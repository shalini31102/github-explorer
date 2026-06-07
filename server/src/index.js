/**
 * index.js
 *
 * Entry point for the GitHub Explorer backend server.
 *
 * Responsibilities:
 * - Load environment variables from .env file
 * - Initialize Express application
 * - Register global middleware (CORS, JSON parsing)
 * - Mount API route handlers
 * - Start HTTP server on configured port
 *
 * Architecture overview:
 * ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
 * │ React Client│────▶│ Express API  │────▶│  GitHub REST API│
 * │ :5173       │     │ :5000        │     │  api.github.com │
 * └─────────────┘     └──────────────┘     └─────────────────┘
 *                            │
 *                     ┌──────┴──────┐
 *                     │ In-Memory   │
 *                     │   Cache     │
 *                     └─────────────┘
 */

// Load .env variables FIRST before anything else
// process.env.GITHUB_TOKEN won't exist until this line runs
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import our route handlers
const githubRoutes = require('./routes/github');

// Initialize the Express application
const app = express();

// Read PORT from environment or fall back to 5000
// Railway will set PORT automatically when deployed
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────

/**
 * CORS (Cross-Origin Resource Sharing)
 *
 * By default, browsers block requests from one origin (port/domain)
 * to a different origin. Our React app on :5173 calling our backend
 * on :5000 would be blocked without this.
 *
 * We restrict CORS to only our frontend URL — not wildcard '*'
 * This is more secure: only our client can call our API.
 *
 * CLIENT_URL is 'http://localhost:5173' locally and our
 * deployed Vercel URL in production.
 */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET'],       // We only need GET for this project
  optionsSuccessStatus: 200
}));

/**
 * JSON Body Parser
 *
 * Parses incoming request bodies as JSON so we can
 * access req.body in our route handlers.
 * Without this, req.body would be undefined.
 */
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────

/**
 * Mount GitHub routes under /api/github prefix
 *
 * This means all routes defined in github.js are automatically
 * prefixed with /api/github:
 *
 * github.js defines:  GET /user/:username
 * Actual endpoint is: GET /api/github/user/:username
 *
 * github.js defines:  GET /user/:username/repos
 * Actual endpoint is: GET /api/github/user/:username/repos
 */
app.use('/api/github', githubRoutes);

// ─── HEALTH CHECK ─────────────────────────────────────────────

/**
 * GET /health
 *
 * Simple endpoint to verify the server is running.
 * Used by Railway and other hosting platforms to check
 * if the service is alive.
 * Also useful for quickly testing the server locally.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 HANDLER ──────────────────────────────────────────────

/**
 * Catch-all route for undefined endpoints.
 *
 * If a request doesn't match any route above,
 * it falls through to here and gets a clear 404.
 * This prevents Express from sending its default
 * HTML error page which is confusing for API consumers.
 *
 * IMPORTANT: This must be registered AFTER all other routes.
 */
app.use((req, res) => {
  res.status(404).json({
    message: `Route '${req.method} ${req.path}' not found.`
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────

/**
 * Global error handling middleware.
 *
 * Express recognizes this as an error handler because it
 * has FOUR parameters (err, req, res, next).
 * If any route calls next(error), it lands here.
 *
 * This is a safety net for any unhandled errors.
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    message: 'An internal server error occurred.'
  });
});

// ─── START SERVER ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────┐
  │   GitHub Explorer API is running    │
  │   Local: http://localhost:${PORT}      │
  │   Health: http://localhost:${PORT}/health │
  └─────────────────────────────────────┘
  `);
});