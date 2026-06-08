/**
 * useRecentSearches.js
 *
 * Custom hook that manages a list of recently searched
 * GitHub usernames, persisted in localStorage.
 *
 * WHY a separate hook?
 * localStorage logic should never live inside a component.
 * Isolating it here means:
 * - Easy to test in isolation
 * - Component stays clean
 * - If we ever switch storage (sessionStorage, IndexedDB),
 *   we only update this one file
 *
 * WHY localStorage specifically?
 * The brief explicitly mentions "recently searched list
 * that persists in localStorage" as a bonus feature.
 * localStorage survives browser refresh and tab close —
 * perfect for search history.
 *
 * Storage format: JSON array of strings
 * e.g. ["torvalds", "mojombo", "shalini31102"]
 * Max 5 entries — oldest dropped when limit is reached.
 */

import { useState, useCallback } from 'react';

/** localStorage key — prefixed to avoid collisions */
const STORAGE_KEY = 'gitexplorer_recent_searches';

/** Maximum number of recent searches to store */
const MAX_RECENT = 5;

/**
 * Safely reads from localStorage.
 * Returns empty array if localStorage is unavailable
 * or if stored data is corrupted.
 *
 * WHY try/catch?
 * localStorage can throw in private/incognito mode in
 * some browsers, or if storage quota is exceeded.
 * We never want a storage error to crash the app.
 *
 * @returns {string[]} - Array of recent usernames
 */
function readFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    // If JSON is corrupted or localStorage unavailable
    return [];
  }
}

/**
 * Safely writes to localStorage.
 * Silently fails if localStorage is unavailable.
 *
 * @param {string[]} searches - Array of usernames to store
 */
function writeToStorage(searches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // Silently fail — recent searches is a nice-to-have feature
  }
}

/**
 * useRecentSearches
 *
 * @returns {Object} - { recentSearches, addRecentSearch, clearRecentSearches }
 */
export function useRecentSearches() {
  // Initialize state from localStorage on first render
  const [recentSearches, setRecentSearches] = useState(() => readFromStorage());

  /**
   * addRecentSearch
   *
   * Adds a username to the front of the recent searches list.
   * Deduplicates — if username already exists, moves it to front.
   * Enforces MAX_RECENT limit by dropping the oldest entry.
   *
   * @param {string} username - The searched username to add
   */
  const addRecentSearch = useCallback((username) => {
    if (!username?.trim()) return;

    const normalized = username.trim().toLowerCase();

    setRecentSearches((previous) => {
      // Remove if already exists — we'll re-add at the front
      // This prevents duplicates and moves repeated searches to top
      const filtered = previous.filter(
        (item) => item.toLowerCase() !== normalized
      );

      // Add to front, enforce max limit
      const updated = [normalized, ...filtered].slice(0, MAX_RECENT);

      // Persist to localStorage
      writeToStorage(updated);

      return updated;
    });
  }, []);

  /**
   * clearRecentSearches
   *
   * Removes all recent searches from state and localStorage.
   * Called when user clicks the "Clear" button.
   */
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    writeToStorage([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  };
}