/**
 * api.js
 * ------
 * Shared helper for calling the Charity Events RESTful API.
 *
 * All pages import this script to fetch data from the API.
 * Uses Promises and the Fetch API (Module 4 concepts).
 */

// The API base URL — change this if your API runs on a different host/port
const API_BASE = 'http://localhost:3000';

/**
 * Fetch all active & upcoming events for the home page.
 * @returns {Promise<Array>} resolves to an array of event objects
 */
function fetchEvents() {
  return fetch(`${API_BASE}/api/events`)
    .then((response) => {
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();
    });
}

/**
 * Fetch all event categories for the search dropdown.
 * @returns {Promise<Array>} resolves to an array of category objects
 */
function fetchCategories() {
  return fetch(`${API_BASE}/api/categories`)
    .then((response) => {
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();
    });
}

/**
 * Search events by optional date, location, and category.
 * @param {Object} filters - { date?: string, location?: string, category?: string }
 * @returns {Promise<Array>} resolves to an array of matching event objects
 */
function searchEvents(filters) {
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.location) params.append('location', filters.location);
  if (filters.category) params.append('category', filters.category);

  const url = `${API_BASE}/api/events/search?${params.toString()}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        // Return the error message from the API so the page can display it
        return response.json().then((body) => {
          throw new Error(body.error || `API error: ${response.status}`);
        });
      }
      return response.json();
    });
}

/**
 * Fetch full details for a single event.
 * @param {number} id - the event id
 * @returns {Promise<Object>} resolves to the event detail object
 */
function fetchEventById(id) {
  return fetch(`${API_BASE}/api/events/${id}`)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((body) => {
          throw new Error(body.error || `API error: ${response.status}`);
        });
      }
      return response.json();
    });
}

/**
 * Format a date string "YYYY-MM-DD" into a human-readable label
 * e.g. "Sat, 11 Oct 2026". Returns "Past" if the date is before today.
 */
function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-AU', options);
}

/**
 * Determine whether an event date is in the past.
 */
function isPastEvent(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Format a ticket price. Free events show "Free".
 */
function formatPrice(price) {
  const num = parseFloat(price);
  return num === 0 ? 'Free' : `$${num.toFixed(2)}`;
}

/**
 * Format an AUD amount with thousands separators.
 */
function formatAmount(amount) {
  return '$' + parseFloat(amount).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ============================================================
   Shared rendering helper — used by the home and search pages
   Uses DOM: createElement / appendChild (Module 1 concepts)
   ============================================================ */

/**
 * Create a DOM element representing a single event card.
 * @param {Object} evt - event object from the API
 * @returns {HTMLElement} an <article class="event-card"> element
 */
function createEventCard(evt) {
  // Card container
  var card = document.createElement('article');
  card.className = 'event-card';

  // Image
  var img = document.createElement('img');
  img.src = 'images/' + evt.event_image;
  img.alt = evt.event_name;
  card.appendChild(img);

  // Card body
  var body = document.createElement('div');
  body.className = 'event-card-body';

  // Date badge (upcoming vs past)
  var badge = document.createElement('span');
  var isPast = isPastEvent(evt.event_date);
  badge.className = isPast ? 'badge badge-past' : 'badge badge-upcoming';
  badge.textContent = isPast ? 'Past Event' : 'Upcoming';
  body.appendChild(badge);

  // Event name
  var h3 = document.createElement('h3');
  h3.textContent = evt.event_name;
  body.appendChild(h3);

  // Meta: date, location, category
  var meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = formatDateLabel(evt.event_date) + ' \u2022 ' + evt.location + ' \u2022 ' + evt.category_name;
  body.appendChild(meta);

  // Price
  var price = document.createElement('div');
  price.className = 'price';
  price.textContent = formatPrice(evt.ticket_price);
  body.appendChild(price);

  // Link to detail page (URL query string)
  var link = document.createElement('a');
  link.className = 'btn-link';
  link.href = 'event.html?id=' + evt.event_id;
  link.textContent = 'View Details \u2192';
  body.appendChild(link);

  card.appendChild(body);
  return card;
}
