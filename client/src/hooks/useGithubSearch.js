/**
 * useGithubSearch.js
 *
 * Custom React hook that manages all state and logic
 * for the GitHub user search feature.
 *
 * WHY a custom hook?
 * - Keeps components clean — they only render, never fetch
 * - All state logic lives in one place — easy to debug
 * - Reusable — any component can use this hook
 * - Testable in isolation without rendering any UI
 *
 * WHY useReducer over useState?
 * - Multiple state values change together (loading + error + data)
 * - useReducer prevents inconsistent intermediate states
 * - Reducer is a pure function — predictable and easy to follow
 * - Each action clearly documents what triggers what change
 */

import { useReducer, useCallback, useMemo } from 'react';
import { fetchUserProfile, fetchUserRepos } from '../api/client';

// ─── STATE SHAPE ──────────────────────────────────────────────

/**
 * This is what our complete application state looks like.
 * Every property is intentional — nothing extra, nothing missing.
 *
 * @typedef {Object} SearchState
 * @property {Object|null}  profile     - GitHub user profile data
 * @property {Array}        repos       - All repos fetched so far
 * @property {boolean}      loading     - True when any fetch is in progress
 * @property {string|null}  error       - Error message to show user
 * @property {number}       currentPage - Which page of repos we're on
 * @property {boolean}      hasMore     - Whether more repo pages exist
 * @property {string}       sortBy      - Current sort: 'stars'|'name'|'updated'
 * @property {string}       searchedUsername - The username currently displayed
 */
const initialState = {
  profile: null,
  repos: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: false,
  sortBy: 'stars',
  searchedUsername: ''
};

// ─── REDUCER ──────────────────────────────────────────────────

/**
 * Pure function that takes current state + action,
 * returns the next state. Never mutates state directly.
 *
 * WHY pure? Same inputs always produce same outputs.
 * This makes bugs easy to track — just log actions.
 *
 * @param {SearchState} state  - Current state
 * @param {Object}      action - { type, payload }
 * @returns {SearchState}      - Next state
 */
function searchReducer(state, action) {
  switch (action.type) {

    /**
     * FETCH_START: User submitted a new search.
     * Reset everything back to a clean slate.
     * We keep sortBy — user's sort preference persists between searches.
     */
    case 'FETCH_START':
      return {
        ...initialState,          // reset all fields
        sortBy: state.sortBy,     // preserve sort preference
        loading: true,            // show loading UI
        searchedUsername: action.payload.username
      };

    /**
     * FETCH_SUCCESS: Both profile and first page of repos loaded.
     * This is the "happy path" — everything worked.
     */
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        profile: action.payload.profile,
        repos: action.payload.repos,
        currentPage: 1,
        hasMore: action.payload.hasMore
      };

    /**
     * FETCH_ERROR: Something went wrong (404, rate limit, network).
     * Clear any stale data and show the error message.
     */
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        profile: null,
        repos: [],
        error: action.payload.message
      };

    /**
     * LOAD_MORE_START: User clicked "Load More".
     * Keep existing repos visible while fetching next page.
     * This is different from FETCH_START which clears everything.
     */
    case 'LOAD_MORE_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    /**
     * LOAD_MORE_SUCCESS: Next page of repos loaded successfully.
     * APPEND new repos to existing list (don't replace).
     */
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        loading: false,
        // Spread existing repos, then add new ones at the end
        repos: [...state.repos, ...action.payload.repos],
        currentPage: state.currentPage + 1,
        hasMore: action.payload.hasMore
      };

    /**
     * LOAD_MORE_ERROR: "Load More" fetch failed.
     * Keep existing repos — don't wipe what user already sees.
     */
    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload.message
      };

    /**
     * SET_SORT: User changed sort order.
     * Just update sortBy — the sorted list is computed
     * separately via useMemo, not stored in state.
     */
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy
      };

    // Safety net — unknown actions return state unchanged
    default:
      return state;
  }
}

// ─── HOOK ─────────────────────────────────────────────────────

/**
 * useGithubSearch
 *
 * Provides all the state and actions needed to search
 * GitHub users and browse their repositories.
 *
 * @returns {Object} - State values and action functions
 */
export function useGithubSearch() {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // ─── ACTIONS ────────────────────────────────────────────────

  /**
   * searchUser
   *
   * Fetches a GitHub user's profile AND their first page
   * of repos in parallel using Promise.all.
   *
   * WHY Promise.all?
   * Sequential: profile fetch (500ms) + repos fetch (500ms) = 1000ms wait
   * Parallel:   both fetches together = ~500ms wait
   * Users feel this difference.
   *
   * @param {string} username - GitHub username to search
   */
  const searchUser = useCallback(async (username) => {
    // Don't search if username is empty or just whitespace
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    // Signal to UI: clear everything, show loading state
    dispatch({
      type: 'FETCH_START',
      payload: { username: trimmedUsername }
    });

    try {
      // Fetch profile and repos simultaneously — not one after the other
      const [profileData, reposData] = await Promise.all([
        fetchUserProfile(trimmedUsername),
        fetchUserRepos(trimmedUsername, 1)
      ]);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          profile: profileData,
          repos: reposData.repos,
          hasMore: reposData.hasMore
        }
      });

    } catch (error) {
      // error.message was set by our api/client.js catch block
      dispatch({
        type: 'FETCH_ERROR',
        payload: { message: error.message }
      });
    }
  }, []); // No dependencies — this function never needs to be recreated

  /**
   * loadMore
   *
   * Fetches the next page of repos and appends them
   * to the existing list. Profile is NOT re-fetched.
   */
  const loadMore = useCallback(async () => {
    // Safety check — shouldn't be callable if no username or no more pages
    if (!state.searchedUsername || !state.hasMore || state.loading) return;

    const nextPage = state.currentPage + 1;

    dispatch({ type: 'LOAD_MORE_START' });

    try {
      const reposData = await fetchUserRepos(state.searchedUsername, nextPage);

      dispatch({
        type: 'LOAD_MORE_SUCCESS',
        payload: {
          repos: reposData.repos,
          hasMore: reposData.hasMore
        }
      });

    } catch (error) {
      dispatch({
        type: 'LOAD_MORE_ERROR',
        payload: { message: error.message }
      });
    }
  }, [state.searchedUsername, state.currentPage, state.hasMore, state.loading]);

  /**
   * setSort
   *
   * Updates the sort preference.
   * The actual sorting happens in sortedRepos below —
   * we never re-fetch from the API when sort changes.
   *
   * @param {string} sortBy - 'stars' | 'name' | 'updated'
   */
  const setSort = useCallback((sortBy) => {
    dispatch({
      type: 'SET_SORT',
      payload: { sortBy }
    });
  }, []);

  // ─── DERIVED STATE ──────────────────────────────────────────

  /**
   * sortedRepos
   *
   * Computes the sorted repo list from state.repos.
   * WHY useMemo? Sorting is O(n log n) — we don't want to
   * re-sort on every render. useMemo only re-sorts when
   * repos array or sortBy value actually changes.
   *
   * We spread [...state.repos] because .sort() mutates
   * the original array — we never mutate state directly.
   */
  const sortedRepos = useMemo(() => {
    return [...state.repos].sort((a, b) => {
      switch (state.sortBy) {
        case 'stars':
          // Highest stars first
          return b.stars - a.stars;

        case 'name':
          // Alphabetical A → Z
          return a.name.localeCompare(b.name);

        case 'updated':
          // Most recently updated first
          return new Date(b.updatedAt) - new Date(a.updatedAt);

        default:
          return 0;
      }
    });
  }, [state.repos, state.sortBy]);

  // ─── RETURN ─────────────────────────────────────────────────

  /**
   * Expose state values and action functions to components.
   * Components get exactly what they need — nothing internal.
   * sortedRepos replaces raw repos — components never sort themselves.
   */
  return {
    // State
    profile: state.profile,
    repos: sortedRepos,           // pre-sorted, ready to render
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    sortBy: state.sortBy,
    searchedUsername: state.searchedUsername,

    // Actions
    searchUser,
    loadMore,
    setSort
  };
}