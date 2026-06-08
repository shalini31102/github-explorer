/**
 * App.jsx
 *
 * Root component and application orchestrator.
 *
 * WHY is this file kept thin?
 * App.jsx's only job is to connect the useGithubSearch hook
 * to the UI components. All state logic lives in the hook.
 * All rendering logic lives in individual components.
 * App just decides WHICH components to show based on state.
 *
 * This pattern is called "container vs presentational" —
 * App is the container (knows about state), components are
 * presentational (only know how to render props).
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useGithubSearch } from './hooks/useGithubSearch';
import { useRecentSearches } from './hooks/useRecentSearches';
import { SearchBar } from './components/SearchBar';
import { UserProfile } from './components/UserProfile';
import { RepoList } from './components/RepoList';
import { RecentSearches } from './components/RecentSearches';
import { ProfileSkeleton, RepoGridSkeleton } from './components/SkeletonLoader';
import styles from './App.module.css';
import { LanguageChart } from './components/LanguageChart';

export default function App() {
  // Single hook call gives us everything we need
  const {
    profile,
    repos,
    allRepos,
    loading,
    error,
    hasMore,
    sortBy,
    filterQuery,
    searchedUsername,
    searchUser,
    loadMore,
    setSort,
    setFilter
  } = useGithubSearch();

  // Recent searches hook — reads/writes localStorage
  const {
    recentSearches,
    addRecentSearch,
    clearRecentSearches
  } = useRecentSearches();

  /**
   * Derived booleans for readability.
   * These make the JSX below much easier to read than
   * inline conditions everywhere.
   */

  // True only during the very first fetch (no profile yet)
  const isInitialLoading = loading && !profile;

  // Only show "no repos" empty state when user genuinely has no repos
  // NOT when filter just returns zero results
  const hasNoRepos = profile && repos.length === 0 && !loading && !filterQuery;

  // Show repo list section whenever profile exists and not loading
  // RepoList handles the empty filter state internally
  const hasResults = profile && !loading && !hasNoRepos;

  /**
   * handleSearch
   *
   * Wraps searchUser to also save the username to recent searches.
   * This is the single place where a search is triggered —
   * both the SearchBar and RecentSearches chips call this.
   *
   * WHY a wrapper function?
   * We need to do TWO things on every search:
   * 1. Save to recent searches (localStorage)
   * 2. Trigger the actual GitHub search (API call)
   * A wrapper keeps this coordination in one place.
   */
  function handleSearch(username) {
    if (!username?.trim()) return;
    addRecentSearch(username.trim());
    searchUser(username.trim());
  }

  return (
    <div className={styles.app}>

      {/* ── NAVBAR ───────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>

          {/* Logo / Brand — clicking resets to landing */}
          <button
            className={styles.logo}
            onClick={() => window.location.reload()}
            aria-label="Go to home"
          >
            {/* Terminal bracket icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            GitExplorer
          </button>

          {/*
            Show search input in navbar ONLY when results are visible.
            On landing, the main centered SearchBar is shown instead.
            This prevents two search bars showing at once.
          */}
          {(hasResults || error || hasNoRepos || isInitialLoading) && (
            <div className={styles.navSearch}>
              <SearchBar
                onSearch={handleSearch}
                loading={isInitialLoading}
                hasError={!!error}
              />
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── STATE 1: LANDING ─────────────────────────────── */}
          {/*
            Show the centered hero SearchBar only when:
            - No search has been made yet (no profile, no error, no loading)
          */}
          <AnimatePresence>
            {!profile && !error && !isInitialLoading && (
              <motion.div
                key="landing"
                className={styles.landingWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Main centered search bar */}
                <SearchBar
                  onSearch={handleSearch}
                  loading={false}
                  hasError={false}
                />

                {/* Recently searched chips — only shown on landing */}
                <RecentSearches
                  searches={recentSearches}
                  onSelect={handleSearch}
                  onClear={clearRecentSearches}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STATE 2: INITIAL LOADING ──────────────────────── */}
          {/*
            Show skeleton placeholders during the first fetch.
            "Load More" fetches show a spinner inside the button
            instead — we don't replace the whole UI with skeletons.
          */}
          <AnimatePresence>
            {isInitialLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileSkeleton />
                <div className={styles.skeletonGap} />
                <RepoGridSkeleton count={6} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STATE 3: ERROR ────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
                className={styles.errorCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                role="alert"
                aria-live="polite"
              >
                {/* Error icon */}
                <div className={styles.errorIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <h3 className={styles.errorTitle}>Something went wrong</h3>
                <p className={styles.errorMessage}>{error}</p>

                {/* Retry hint */}
                <p className={styles.errorHint}>
                  Try searching for a different username
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STATE 4 & 5: RESULTS or EMPTY ────────────────── */}
          <AnimatePresence>
            {profile && (
              <motion.div
                key="results"
                className={styles.resultsWrapper}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* User profile card — always shown when profile exists */}
                <UserProfile profile={profile} />

                {/* Language distribution chart — shown when repos are loaded */}
                {allRepos.length > 0 && (
                  <LanguageChart repos={repos} />
                )}


                {/* ── STATE 5: EMPTY REPOS ─────────────────────── */}
                {hasNoRepos && (
                  <motion.div
                    className={styles.emptyCard}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {/* Empty state icon */}
                    <div className={styles.emptyIcon}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M3 3h7l2 3h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                        <line x1="12" y1="11" x2="12" y2="15" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <h3 className={styles.emptyTitle}>No public repositories</h3>
                    <p className={styles.emptyMessage}>
                      {searchedUsername} hasn't created any public repositories yet.
                    </p>
                  </motion.div>
                )}

                {/* ── STATE 4: REPO LIST ────────────────────────── */}
                {hasResults && (
                  <RepoList
                    repos={repos}
                    hasMore={hasMore}
                    loading={loading}
                    sortBy={sortBy}
                    filterQuery={filterQuery}
                    onSort={setSort}
                    onFilter={setFilter}
                    onLoadMore={loadMore}
                    username={searchedUsername}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          Built with React + Node.js · Data from{' '}
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub REST API
          </a>
        </p>
      </footer>

    </div>
  );
}