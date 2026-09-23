/**
 * search.js
 * ---------
 * Search page logic: lets the user filter events by date, location and
 * category, then calls the search API and renders matching events.
 *
 * Concepts demonstrated:
 * - fetch() with Promises                              (Module 4)
 * - DOM: getElementById, createElement, appendChild    (Module 1)
 * - Event listeners (submit, click)                    (Module 1)
 * - DOM manipulation for error / no-results messages   (Module 1)
 * - Clear Filters button (DOM reset)                   (Module 1)
 * - Form validation                                     (Module 1)
 */

window.addEventListener('DOMContentLoaded', function () {

  // --- Populate the category dropdown from the API ---
  fetchCategories()
    .then(function (categories) {
      var select = document.getElementById('filter-category');
      categories.forEach(function (cat) {
        var option = document.createElement('option');
        option.value = cat.category_id;
        option.textContent = cat.category_name;
        select.appendChild(option);
      });
    })
    .catch(function () {
      // If categories fail to load, the dropdown stays with just "All Categories"
    });

  // --- Form submit: validate, build query, call search API ---
  var form = document.getElementById('search-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // prevent page reload

    // Read filter values
    var date = document.getElementById('filter-date').value.trim();
    var location = document.getElementById('filter-location').value.trim();
    var category = document.getElementById('filter-category').value;

    // Hide previous error / no-results messages
    hideError();
    document.getElementById('no-results').classList.remove('visible');

    // Validate date format if provided (basic form validation)
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      showError('Invalid date format. Please pick a valid date.');
      return;
    }

    // Build filters object (only include non-empty values)
    var filters = {};
    if (date) filters.date = date;
    if (location) filters.location = location;
    if (category) filters.category = category;

    // Show loading indicator
    showLoading();

    // Call the search API
    searchEvents(filters)
      .then(function (events) {
        hideLoading();

        // Clear previous results
        var grid = document.getElementById('results-grid');
        grid.innerHTML = '';

        if (events.length === 0) {
          document.getElementById('no-results').classList.add('visible');
          return;
        }

        // Render results
        events.forEach(function (evt) {
          grid.appendChild(createEventCard(evt));
        });
      })
      .catch(function (err) {
        hideLoading();
        showError(err.message);
      });
  });

  // --- Clear Filters button: reset all form fields (DOM manipulation) ---
  var clearBtn = document.getElementById('clear-btn');
  clearBtn.addEventListener('click', function () {
    document.getElementById('filter-date').value = '';
    document.getElementById('filter-location').value = '';
    document.getElementById('filter-category').value = '';

    hideError();
    document.getElementById('no-results').classList.remove('visible');
    document.getElementById('results-grid').innerHTML = '';
  });

  // ---------- Helper functions ----------

  function showLoading() {
    document.getElementById('loading').classList.add('visible');
  }

  function hideLoading() {
    document.getElementById('loading').classList.remove('visible');
  }

  function showError(msg) {
    var el = document.getElementById('error-msg');
    el.textContent = msg;
    el.classList.add('visible');
  }

  function hideError() {
    var el = document.getElementById('error-msg');
    el.textContent = '';
    el.classList.remove('visible');
  }
});
