/**
 * event.js
 * --------
 * Event detail page logic: reads the event id from the URL query string,
 * fetches full details from the API, and renders them via DOM manipulation.
 *
 * Concepts demonstrated:
 * - URL Query String to pass the event ID between pages  (Module 1)
 * - fetch() with Promises (.then() / .catch())            (Module 4)
 * - DOM: getElementById, createElement, appendChild        (Module 1)
 * - innerHTML and textContent for rendering                (Module 1)
 * - Event listener (click) for the modal                   (Module 1)
 */

window.addEventListener('DOMContentLoaded', function () {

  // --- Read the event id from the URL query string ---
  // e.g. event.html?id=1 → params.get('id') === '1'
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  var loading = document.getElementById('loading');
  var errorMsg = document.getElementById('error-msg');
  var container = document.getElementById('event-detail');

  // Validate that an id was provided
  if (!id) {
    loading.classList.remove('visible');
    showError('No event specified. Please return to the home page and select an event.');
    return;
  }

  // --- Fetch event details from the API ---
  fetchEventById(id)
    .then(function (evt) {
      loading.classList.remove('visible');
      renderEventDetail(evt);
    })
    .catch(function (err) {
      loading.classList.remove('visible');
      showError(err.message);
    });

  // --- Modal: Register button "under construction" ---
  var modalOverlay = document.getElementById('modal-overlay');
  var modalClose = document.getElementById('modal-close');

  modalClose.addEventListener('click', function () {
    modalOverlay.classList.remove('visible');
  });

  // Click outside modal to close
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('visible');
    }
  });

  // ---------- Render function ----------

  function renderEventDetail(evt) {
    // Main container
    var detail = document.createElement('div');
    detail.className = 'event-detail';

    // Image
    var img = document.createElement('img');
    img.src = 'images/' + evt.event_image;
    img.alt = evt.event_name;
    detail.appendChild(img);

    // Body
    var body = document.createElement('div');
    body.className = 'event-detail-body';

    // Title
    var h1 = document.createElement('h1');
    h1.textContent = evt.event_name;
    body.appendChild(h1);

    // Meta row: date, time, location, category
    var metaRow = document.createElement('div');
    metaRow.className = 'meta-row';

    var dateLabel = formatDateLabel(evt.event_date);
    var isPast = isPastEvent(evt.event_date);

    metaRow.innerHTML =
      '<span>📅 ' + dateLabel + ' at ' + evt.event_time + '</span>' +
      '<span>📍 ' + evt.location + '</span>' +
      '<span>🏷️ ' + evt.category_name + '</span>' +
      (isPast ? '<span class="badge badge-past">Past Event</span>'
              : '<span class="badge badge-upcoming">Upcoming</span>');
    body.appendChild(metaRow);

    // Organisation section
    var orgSection = document.createElement('div');
    orgSection.className = 'detail-section';
    orgSection.innerHTML =
      '<h2>Hosted by</h2>' +
      '<p><strong>' + evt.org_name + '</strong></p>' +
      '<p>' + evt.org_description + '</p>' +
      '<p style="margin-top:0.5rem;font-size:0.9rem;color:#64748b">' +
        '✉️ ' + evt.contact_email + ' &nbsp; ☎️ ' + evt.contact_phone +
      '</p>';
    body.appendChild(orgSection);

    // Description
    var descSection = document.createElement('div');
    descSection.className = 'detail-section';
    descSection.innerHTML =
      '<h2>About This Event</h2>' +
      '<p class="description">' + evt.event_description + '</p>';
    body.appendChild(descSection);

    // Goal vs. Progress
    var goalSection = document.createElement('div');
    goalSection.className = 'detail-section';

    var goalTitle = document.createElement('h2');
    goalTitle.textContent = 'Fundraising Goal & Progress';
    goalSection.appendChild(goalTitle);

    var progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    // Label row: raised vs goal
    var progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    progressLabel.innerHTML =
      '<span>Raised: ' + formatAmount(evt.funds_raised) + '</span>' +
      '<span>Goal: ' + formatAmount(evt.goal_amount) + '</span>';
    progressContainer.appendChild(progressLabel);

    // Progress bar
    var progressPercent = parseFloat(evt.progress_percent) || 0;
    var bar = document.createElement('div');
    bar.className = 'progress-bar';

    var fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = Math.min(progressPercent, 100) + '%';
    fill.textContent = progressPercent + '%';
    bar.appendChild(fill);
    progressContainer.appendChild(bar);

    goalSection.appendChild(progressContainer);
    body.appendChild(goalSection);

    // Ticket info
    var ticketBox = document.createElement('div');
    ticketBox.className = 'ticket-box';

    var ticketLabel = document.createElement('div');
    ticketLabel.style.fontSize = '0.9rem';
    ticketLabel.style.color = '#475569';
    ticketLabel.style.marginBottom = '0.3rem';
    ticketLabel.textContent = 'Ticket Price';
    ticketBox.appendChild(ticketLabel);

    var ticketPrice = document.createElement('div');
    ticketPrice.className = 'price-large';
    ticketPrice.textContent = formatPrice(evt.ticket_price);
    ticketBox.appendChild(ticketPrice);

    body.appendChild(ticketBox);

    // Register button
    var registerBtn = document.createElement('button');
    registerBtn.className = 'btn-register';
    registerBtn.textContent = 'Register / Purchase Ticket';
    registerBtn.addEventListener('click', function () {
      modalOverlay.classList.add('visible');
    });
    body.appendChild(registerBtn);

    detail.appendChild(body);

    // Append to the page container
    container.appendChild(detail);
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
  }
});
