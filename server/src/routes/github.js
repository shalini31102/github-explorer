/**
 * github.js (routes)
 *
 * Defines the Express routes for GitHub-related API endpoints.
 * This file is the entry point for all requests coming from
 * our React frontend.
 *
 * Route handlers follow this pattern:
 * 1. Extract parameters from the request
 * 2. Check the cache — return early if data exists
 * 3. Call the GitHub service to fetch fresh data
 * 4. Store the fresh data in cache
 * 5. Send the response back to the client
 *
 * Errors from the GitHub service bubble up here,
 * where we decide the appropriate HTTP status code.
 */

const express = require('express');
const router = express.Router();
const { getUserProfile, getUserRepos } = require('../services/githubService');
const cache = require('../cache/inMemoryCache');

/**
 * GET /api/github/user/:username
 *
 * Fetches a GitHub user's public profile.
 * Checks cache first — only calls GitHub API on cache miss.
 *
 * @param {string} username - GitHub username from URL parameter
 *
 * Response shape:
 * {
 *   login, name, bio, avatarUrl, followers,
 *   following, publicRepos, htmlUrl,
 *   location, company, fromCache
 * }
 */
router.get('/user/:username', async (req, res) => {
  // Extract username from the URL parameter
  // e.g. for '/user/torvalds', username = 'torvalds'
  const { username } = req.params;

  // Sanitize username — trim whitespace and convert to lowercase
  // This prevents 'Torvalds' and 'torvalds' being cached separately
  const normalizedUsername = username.trim().toLowerCase();

  // Build a unique cache key for this specific user's profile
  // Prefixing with 'user:' avoids collision with repo cache keys
  const cacheKey = `user:${normalizedUsername}`;

  // --- CACHE CHECK ---
  // If we have fresh data, return it immediately without
  // hitting the GitHub API at all. This is the main benefit
  // of caching — speed and rate limit preservation.
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    // fromCache: true lets us verify caching works during development
    return res.status(200).json({ ...cachedData, fromCache: true });
  }

  // --- CACHE MISS: Fetch from GitHub ---
  try {
    const profile = await getUserProfile(normalizedUsername);

    // Store in cache so the next request within 60s is instant
    cache.set(cacheKey, profile);

    // fromCache: false indicates this was a fresh API call
    return res.status(200).json({ ...profile, fromCache: false });

  } catch (error) {
    // Handle specific GitHub API error codes
    // error.response exists when GitHub replied with an error status
    // error.response is undefined when there was a network failure

    if (error.response?.status === 404) {
      // GitHub user does not exist
      return res.status(404).json({
        message: `GitHub user '${normalizedUsername}' not found.`
      });
    }

    if (error.response?.status === 403) {
      // GitHub rate limit exceeded
      // The X-RateLimit-Reset header tells when it resets (Unix timestamp)
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const resetDate = resetTime
        ? new Date(resetTime * 1000).toLocaleTimeString()
        : 'soon';

      return res.status(403).json({
        message: `GitHub API rate limit exceeded. Resets at ${resetDate}.`
      });
    }

    // Unknown/unexpected error — log it server-side for debugging
    // but don't expose internal details to the client
    console.error(`Error fetching profile for '${normalizedUsername}':`, error.message);
    return res.status(500).json({
      message: 'An unexpected error occurred. Please try again.'
    });
  }
});

/**
 * GET /api/github/user/:username/repos
 *
 * Fetches a paginated list of a GitHub user's public repositories.
 * Supports pagination via ?page query parameter.
 * Each page returns up to 30 repositories (GitHub's default).
 *
 * @param {string} username - GitHub username from URL parameter
 * @query  {number} page    - Page number (default: 1)
 *
 * Response shape:
 * {
 *   repos: Array of repo objects,
 *   hasMore: boolean (true if there might be more pages),
 *   fromCache: boolean
 * }
 */
router.get('/user/:username/repos', async (req, res) => {
  const { username } = req.params;
  const normalizedUsername = username.trim().toLowerCase();

  // Parse page from query string, default to 1 if not provided
  // parseInt converts '2' (string) to 2 (number)
  // The || 1 handles NaN if someone passes ?page=abc
  const page = parseInt(req.query.page) || 1;

  // Cache key includes page number — different pages are different data
  const cacheKey = `repos:${normalizedUsername}:page:${page}`;

  // --- CACHE CHECK ---
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({ ...cachedData, fromCache: true });
  }

  // --- CACHE MISS: Fetch from GitHub ---
  try {
    const repos = await getUserRepos(normalizedUsername, page);

    // If GitHub returned 30 repos, there might be more pages
    // If it returned less than 30, we've reached the last page
    const hasMore = repos.length === 30;

    const responseData = { repos, hasMore };

    // Cache the response data
    cache.set(cacheKey, responseData);

    return res.status(200).json({ ...responseData, fromCache: false });

  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        message: `GitHub user '${normalizedUsername}' not found.`
      });
    }

    if (error.response?.status === 403) {
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const resetDate = resetTime
        ? new Date(resetTime * 1000).toLocaleTimeString()
        : 'soon';

      return res.status(403).json({
        message: `GitHub API rate limit exceeded. Resets at ${resetDate}.`
      });
    }

    console.error(`Error fetching repos for '${normalizedUsername}':`, error.message);
    return res.status(500).json({
      message: 'An unexpected error occurred. Please try again.'
    });
  }
});

module.exports = router;