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
 * @typedef {Object} SearchState
 * @property {Object|null}  profile          - GitHub user profile data
 * @property {Array}        repos            - All repos fetched so far
 * @property {boolean}      loading          - True when any fetch is in progress
 * @property {string|null}  error            - Error message to show user
 * @property {number}       currentPage      - Which page of repos we're on
 * @property {boolean}      hasMore          - Whether more repo pages exist
 * @property {string}       sortBy           - Current sort: 'stars'|'name'|'updated'
 * @property {string}       searchedUsername - The username currently displayed
 * @property {string}       filterQuery      - Current repo name filter text
 */
const initialState = {
  profile: null,
  repos: [],
  loading: false,
  error: null,
  currentPage: 1,
  hasMore: false,
  sortBy: 'stars',
  searchedUsername: '',
  filterQuery: ''
};

// ─── REDUCER ──────────────────────────────────────────────────

/**
 * Pure function that takes current state + action,
 * returns the next state. Never mutates state directly.
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
     * We reset filterQuery — filter should clear on new search.
     */
    case 'FETCH_START':
      return {
        ...initialState,
        sortBy: state.sortBy,
        loading: true,
        searchedUsername: action.payload.username
      };

    /**
     * FETCH_SUCCESS: Both profile and first page of repos loaded.
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
        repos: [...state.repos, ...action.payload.repos],
        currentPage: state.currentPage + 1,
        hasMore: action.payload.hasMore
      };

    /**
     * LOAD_MORE_ERROR: "Load More" fetch failed.
     * Keep existing repos visible.
     */
    case 'LOAD_MORE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload.message
      };

    /**
     * SET_SORT: User changed sort order.
     */
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy
      };

    /**
     * SET_FILTER: User typed in the repo filter input.
     * Just updates filterQuery — filtered list is computed
     * separately via useMemo, not stored in state.
     */
    case 'SET_FILTER':
      return {
        ...state,
        filterQuery: action.payload.filterQuery
      };

    default:
      return state;
  }
}

// ─── HOOK ─────────────────────────────────────────────────────

export function useGithubSearch() {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // ─── ACTIONS ────────────────────────────────────────────────

  /**
   * searchUser
   * Fetches profile AND first page of repos in parallel.
   *
   * @param {string} username - GitHub username to search
   */
  const searchUser = useCallback(async (username) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    dispatch({
      type: 'FETCH_START',
      payload: { username: trimmedUsername }
    });

    try {
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
      dispatch({
        type: 'FETCH_ERROR',
        payload: { message: error.message }
      });
    }
  }, []);

  /**
   * loadMore
   * Fetches the next page of repos and appends to existing list.
   */
  const loadMore = useCallback(async () => {
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
   * Updates the sort preference.
   *
   * @param {string} sortBy - 'stars' | 'name' | 'updated'
   */
  const setSort = useCallback((sortBy) => {
    dispatch({
      type: 'SET_SORT',
      payload: { sortBy }
    });
  }, []);

  /**
   * setFilter
   * Updates the filter query for repo name filtering.
   * Filtering happens client-side on already-fetched repos.
   *
   * @param {string} query - Text to match against repo names
   */
  const setFilter = useCallback((query) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { filterQuery: query }
    });
  }, []);

  // ─── DERIVED STATE ──────────────────────────────────────────

  /**
   * filteredAndSortedRepos
   *
   * Step 1: Filter by name if query exists
   * Step 2: Sort the filtered results
   *
   * WHY filter before sort?
   * Sorting a smaller filtered array is faster than
   * sorting everything then filtering.
   *
   * WHY useMemo?
   * Recomputes only when repos, sortBy, or filterQuery changes.
   */
  const filteredAndSortedRepos = useMemo(() => {
    // Step 1: Filter
    const filtered = state.filterQuery.trim()
      ? state.repos.filter((repo) =>
          repo.name
            .toLowerCase()
            .includes(state.filterQuery.toLowerCase().trim())
        )
      : state.repos;

    // Step 2: Sort
    return [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        default:
          return 0;
      }
    });
  }, [state.repos, state.sortBy, state.filterQuery]);

  // ─── RETURN ─────────────────────────────────────────────────

  return {
    // State
    profile: state.profile,
    repos: filteredAndSortedRepos,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    sortBy: state.sortBy,
    filterQuery: state.filterQuery,
    searchedUsername: state.searchedUsername,

    // Actions
    searchUser,
    loadMore,
    setSort,
    setFilter
  };
}