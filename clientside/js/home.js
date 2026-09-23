/**
 * home.js
 * --------
 * Home page logic: fetches all active & upcoming events from the API
 * and renders them as cards using DOM manipulation (Module 1 & 4).
 *
 * Concepts demonstrated:
 * - fetch() with Promises (.then() / .catch())        (Module 4)
 * - DOM: getElementById, createElement, appendChild   (Module 1)
 * - onload event                                       (Module 1)
 * - Error handling and DOM error display              (Module 1)
 */

// Run when the page finishes loading
window.addEventListener('DOMContentLoaded', function () {

  var loading = document.getElementById('loading');
  var errorMsg = document.getElementById('error-msg');
  var grid = document.getElementById('event-grid');

  // Call the API to fetch all active & upcoming events
  fetchEvents()
    .then(function (events) {
      loading.classList.remove('visible');

      if (events.length === 0) {
        errorMsg.textContent = 'No upcoming events at this time. Please check back soon.';
        errorMsg.classList.add('visible');
        return;
      }

      // createEventCard is defined in the shared api.js file
      events.forEach(function (evt) {
        grid.appendChild(createEventCard(evt));
      });
    })
    .catch(function (err) {
      loading.classList.remove('visible');
      errorMsg.textContent = 'Unable to load events: ' + err.message;
      errorMsg.classList.add('visible');
    });
});
