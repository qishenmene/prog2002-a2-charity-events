# Coffs Coast Charity Collective — Charity Events Website

PROG2002 Web Development II — Assessment 2
A dynamic website that manages and promotes local charity events, built with **Node.js, Express, MySQL, HTML, JavaScript and the DOM**.

A public-facing website where visitors can:

- Browse the organisation's information and all **active & upcoming** charity events on the **Home page** (events are automatically marked as *past* or *upcoming* based on their dates, and suspended events are never shown).
- **Search events** by date, location and event category, with a one-click *Clear Filters* reset.
- Open an **Event detail page** showing the full description, ticket information, and the fundraising **Goal vs. Progress**, with a *Register* button (registration is under construction and reserved for Assessment 3).

All dynamic content is consumed through self-developed **RESTful APIs** (GET only — POST/PUT/DELETE are planned for Assessment 3).

## Repository structure

```
prog2002-a2-charity-events/
├── api/          # Node.js + Express RESTful API (connects to MySQL)
│   ├── event_db.js       # Database connection pool
│   ├── routes/events.js  # API route handlers
│   └── server.js         # Express application entry point
├── clientside/   # Client-side website (static, served by a Node.js server)
│   ├── index.html        # Home page
│   ├── search.html       # Search events page
│   ├── event.html        # Event details page
│   ├── css/  js/  images/
│   └── server.js         # Simple Node.js static file server (port 5500)
└── database/
    └── charityevents_db.sql  # Schema + sample data (importable via MySQL Workbench)
```

## Getting started

### 1. Database

1. Install MySQL 8.x.
2. Open MySQL Workbench (or any MySQL client) and run `database/charityevents_db.sql`.
   The script creates the database `charityevents_db`, three tables (`organisations`, `categories`, `events`) and inserts 10 sample events (including one past event and one suspended event to demonstrate the filtering logic).
3. Create a database user for the API (or edit the credentials in `api/event_db.js`):

```sql
CREATE USER 'charity_app'@'localhost' IDENTIFIED BY 'App@2026';
GRANT ALL PRIVILEGES ON charityevents_db.* TO 'charity_app'@'localhost';
```

### 2. API (port 3000)

```bash
cd api
npm install
npm start
```

Test with a browser or Postman, e.g. `GET http://localhost:3000/api/events`.

### 3. Client-side website (port 5500)

```bash
cd clientside
npm start        # or: node server.js
```

Open <http://localhost:5500> — the home page fetches live data from the API on port 3000.

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/events` | All active, upcoming events (home page) |
| GET | `/api/categories` | All event categories (search filter dropdown) |
| GET | `/api/events/search?date=&location=&category=` | Filter events by date / location / category |
| GET | `/api/events/:id` | Full details of one event (event page) |

## Author

- **Student ID:** 24832627
- **Unit:** PROG2002 Web Development II — Assessment 2
