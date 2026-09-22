/**
 * event_db.js
 * ----------
 * Database connection for the Charity Events API.
 *
 * Creates a connection pool to the MySQL database "charityevents_db"
 * and exports it so route handlers can run queries.
 *
 * A pool (rather than a single connection) is used because the API
 * handles many short queries: the pool re-uses connections efficiently
 * and handles dropped connections automatically.
 *
 * If you are marking this assignment on your own computer, update the
 * user / password below to a user that has access to charityevents_db
 * (see README.md for the GRANT statement).
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'charity_app',
  password: 'App@2026',
  database: 'charityevents_db',
  connectionLimit: 10,
  waitForConnections: true,
  // Return DATE/TIME columns as plain strings ("YYYY-MM-DD", "HH:MM:SS")
  // instead of JavaScript Date objects, which avoids timezone drift.
  dateStrings: true,
});

module.exports = pool;
