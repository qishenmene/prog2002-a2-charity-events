/**
 * server.js
 * ---------
 * Minimal Node.js static file server for the charity events website.
 *
 * Start with:  npm start   (or: node server.js)
 * Listens on http://localhost:5500
 *
 * Serves static files (HTML, CSS, JS, SVG) from the current directory.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const BASE_DIR = __dirname;

// MIME type map for common file extensions
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Parse the URL and prevent directory traversal
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  // Resolve the file path safely
  const filePath = path.join(BASE_DIR, path.normalize(urlPath));

  // Ensure the resolved path is still inside the base directory
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 — Page Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Charity Events website running on http://localhost:${PORT}`);
});
