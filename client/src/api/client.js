/**
 * client.js
 *
 * Axios API client for communicating with our Express backend.
 *
 * WHY a separate api/client.js file?
 * - Single place to configure the base URL
 * - If our backend URL changes, we update ONE file
 * - Components never need to know the backend URL
 * - Consistent error handling across all API calls
 *
 * IMPORTANT: This file talks to OUR backend only.
 * It never directly calls the GitHub API — that's the
 * whole point of the proxy pattern.
 */

import axios from 'axios';

/**
 * Pre-configured axios instance pointing to our backend.
 *
 * VITE_API_URL comes from client/.env:
 * - Local:      http://localhost:5000/api
 * - Production: https://your-railway-url.railway.app/api
 *
 * In Vite, environment variables MUST start with VITE_
 * to be accessible in the browser via import.meta.env
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout — don't wait forever
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetches a GitHub user's public profile via our backend proxy.
 *
 * @param {string} username - The GitHub username to search for
 * @returns {Promise<Object>} - User profile data
 * @throws {Error} - Throws with message from backend if request fails
 */
export async function fetchUserProfile(username) {
  try {
    const response = await apiClient.get(`/github/user/${username}`);
    return response.data;
  } catch (error) {
    // Extract the error message our backend sent
    // or fall back to a generic message
    const message = error.response?.data?.message
      || 'Failed to fetch user profile. Please try again.';
    throw new Error(message);
  }
}

/**
 * Fetches a page of a GitHub user's public repositories
 * via our backend proxy.
 *
 * @param {string} username - The GitHub username
 * @param {number} page     - Page number for pagination (default: 1)
 * @returns {Promise<Object>} - { repos: Array, hasMore: boolean }
 * @throws {Error} - Throws with message from backend if request fails
 */
export async function fetchUserRepos(username, page = 1) {
  try {
    const response = await apiClient.get(`/github/user/${username}/repos`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message
      || 'Failed to fetch repositories. Please try again.';
    throw new Error(message);
  }
}