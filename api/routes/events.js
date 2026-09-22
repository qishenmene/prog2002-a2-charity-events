/**
 * routes/events.js
 * ----------------
 * RESTful GET endpoints for charity event data.
 *
 * Endpoint overview (see README for the full design rationale):
 *   GET /api/events                                  - active & upcoming events (home page)
 *   GET /api/events/search?date=&location=&category= - filtered search (search page)
 *   GET /api/events/:id                              - one event's full details (event page)
 *   GET /api/categories                              - all event categories (search dropdown)
 *
 * Design notes:
 * - Only GET is required for Assessment 2 (POST/PUT/DELETE come in A3).
 * - URLs name resources, not actions, following REST conventions.
 * - Every statement uses prepared SQL with "?" placeholders, so user
 *   input can never be executed as SQL (prevents SQL injection).
 * - Suspended events (policy violations) are filtered out of every
 *   endpoint, so they are never exposed to the website.
 */

const express = require('express');
const pool = require('../event_db');

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

// Columns returned for list views (home page + search results).
const LIST_COLUMNS = `
  e.event_id, e.event_name, e.event_date, e.event_time, e.location,
  e.ticket_price, e.event_image, e.event_status,
  c.category_name, o.org_name
`;

// The FROM/JOIN fragment shared by the list endpoints.
const LIST_FROM = `
  FROM events e
  INNER JOIN categories c ON e.category_id = c.category_id
  INNER JOIN organisations o ON e.org_id = o.org_id
`;

/**
 * Escapes LIKE wildcards (%, _) in user input so a search for "50%"
 * behaves literally. SQL injection itself is already prevented by the
 * prepared statements; this only keeps the LIKE pattern well-formed.
 */
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (ch) => '\\' + ch);
}

/** Validates a YYYY-MM-DD string and returns it, or null if invalid. */
function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(value + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? null : value;
}

/* ------------------------------------------------------------------ */
/* GET /api/events - home page listing                                 */
/* ------------------------------------------------------------------ */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT ${LIST_COLUMNS}
      ${LIST_FROM}
      WHERE e.event_status = 'active'
        AND e.event_date >= CURDATE()
      ORDER BY e.event_date, e.event_time
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------ */
/* GET /api/events/search - search page                                */
/* All three filters are optional and can be combined.                 */
/* ------------------------------------------------------------------ */
router.get('/search', async (req, res) => {
  const { date, location, category } = req.query;
  const conditions = ['e.event_status = \'active\''];
  const params = [];

  // Filter 1: date - return events occurring on or after this date.
  if (date !== undefined && date !== '') {
    const validDate = parseDate(date);
    if (!validDate) {
      return res.status(400).json({ error: 'Invalid date. Expected format: YYYY-MM-DD.' });
    }
    conditions.push('e.event_date >= ?');
    params.push(validDate);
  }

  // Filter 2: location - partial, case-insensitive match.
  if (location !== undefined && location !== '') {
    conditions.push('e.location LIKE ?');
    params.push('%' + escapeLike(location.trim()) + '%');
  }

  // Filter 3: category - must be a positive integer id.
  if (category !== undefined && category !== '') {
    const categoryId = Number(category);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: 'Invalid category id.' });
    }
    conditions.push('e.category_id = ?');
    params.push(categoryId);
  }

  try {
    const sql = `
      SELECT ${LIST_COLUMNS}
      ${LIST_FROM}
      WHERE ${conditions.join(' AND ')}
      ORDER BY e.event_date, e.event_time
    `;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/events/search failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ------------------------------------------------------------------ */
/* GET /api/events/:id - event details page                            */
/* ------------------------------------------------------------------ */
router.get('/:id', async (req, res) => {
  const eventId = Number(req.params.id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: 'Invalid event id.' });
  }

  try {
    const sql = `
      SELECT
        e.event_id, e.event_name, e.event_description, e.event_date, e.event_time,
        e.location, e.ticket_price, e.goal_amount, e.funds_raised, e.event_image,
        e.event_status,
        c.category_name,
        o.org_name, o.description AS org_description,
        o.contact_email, o.contact_phone,
        CASE
          WHEN e.goal_amount > 0 THEN ROUND(e.funds_raised / e.goal_amount * 100, 1)
          ELSE 0
        END AS progress_percent
      ${LIST_FROM}
      WHERE e.event_id = ?
        AND e.event_status = 'active'
    `;
    const [rows] = await pool.query(sql, [eventId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/events/:id failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
