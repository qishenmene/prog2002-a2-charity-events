/**
 * server.js
 * ---------
 * Entry point for the Charity Events RESTful API (Assessment 2).
 *
 * Start with:  npm start   (or: node server.js)
 * Listens on http://localhost:3000
 */

const express = require('express');
const pool = require('./event_db');
const eventsRouter = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

/* ------------------------------------------------------------------ */
/* Middleware                                                          */
/* ------------------------------------------------------------------ */

// Allow the client-side website (served on a different origin, e.g.
// http://localhost:5500) to call this API from the browser.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Parse incoming JSON bodies (ready for the POST endpoints in A3).
app.use(express.json());

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// Health check - useful for verifying the API is up.
app.get('/', (req, res) => {
  res.json({ message: 'Charity Events API is running' });
});

app.use('/api/events', eventsRouter);

// Categories live at their own resource URL (used by the search page).
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT category_id, category_name FROM categories ORDER BY category_name'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/categories failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unknown API routes return JSON rather than an HTML error page.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Charity Events API listening on http://localhost:${PORT}`);
});
