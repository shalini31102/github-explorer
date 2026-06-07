/**
 * githubService.js
 *
 * Handles all communication with the GitHub REST API.
 * This service is the ONLY place in our app that knows
 * about GitHub's API structure.
 *
 * Why isolate this? If GitHub changes their API response
 * shape tomorrow, we only update this one file — nothing
 * else in our app needs to change.
 */

const axios = require('axios');

/**
 * A pre-configured axios instance for GitHub API calls.
 *
 * baseURL:所有 requests automatically prepend this
 * Authorization: Raises our rate limit from 60 to 5000 req/hour
 * Accept: Tells GitHub we want v3 of their API
 */
const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
});

/**
 * Fetches a GitHub user's public profile.
 * We shape the response to only include fields our
 * frontend actually needs — nothing more.
 *
 * @param {string} username - The GitHub username to look up
 * @returns {Object} - Shaped user profile object
 * @throws {Error} - Throws if user not found or API fails
 */
async function getUserProfile(username) {
  const response = await githubClient.get(`/users/${username}`);

  // Shape the data — only return what our frontend needs
  // This protects us from GitHub changing field names
  return {
    login: response.data.login,
    name: response.data.name,
    bio: response.data.bio,
    avatarUrl: response.data.avatar_url,
    followers: response.data.followers,
    following: response.data.following,
    publicRepos: response.data.public_repos,
    htmlUrl: response.data.html_url,
    location: response.data.location,
    company: response.data.company
  };
}

/**
 * Fetches a page of a GitHub user's public repositories.
 * GitHub returns 30 repos per page by default.
 *
 * @param {string} username - The GitHub username
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Array} - Array of shaped repository objects
 * @throws {Error} - Throws if user not found or API fails
 */
async function getUserRepos(username, page = 1) {
  const response = await githubClient.get(`/users/${username}/repos`, {
    params: {
      per_page: 30, // GitHub's default, being explicit here
      page,         // Which page of results to fetch
      sort: 'updated' // Initial sort from GitHub's side
    }
  });

  // Shape each repo — map over the array and pick only
  // the fields we need, renaming some for cleaner usage
  return response.data.map(repo => ({
    id: repo.id,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,   // GitHub calls it stargazers_count
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
    htmlUrl: repo.html_url,
    topics: repo.topics             // Array of topic tags on the repo
  }));
}

module.exports = { getUserProfile, getUserRepos };