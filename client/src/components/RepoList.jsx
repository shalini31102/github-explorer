/**
 * RepoList.jsx
 *
 * Renders the repository grid with sort controls and pagination.
 *
 * Responsibilities:
 * - Display sort buttons (Stars, Name, Updated)
 * - Render the 2-column grid of RepoCard components
 * - Show "Load More" button when hasMore is true
 * - Show loading state during Load More fetch
 *
 * WHY separate from App.jsx?
 * App.jsx is the orchestrator — it connects the hook to
 * components. Putting grid logic there makes it too large.
 * RepoList owns everything about displaying repos.
 *
 * Props:
 * @prop {Array}    repos      - Sorted array of repo objects
 * @prop {boolean}  hasMore    - Whether more pages exist
 * @prop {boolean}  loading    - True during Load More fetch
 * @prop {string}   sortBy     - Current sort: 'stars'|'name'|'updated'
 * @prop {function} onSort     - Called with new sortBy value
 * @prop {function} onLoadMore - Called when Load More is clicked
 * @prop {string}   username   - Current searched username (for heading)
 */

import { motion } from 'framer-motion';
import { RepoCard } from './RepoCard';
import styles from './RepoList.module.css';

/**
 * Sort options configuration.
 * Defined as a constant so adding a new sort option
 * only requires adding one entry here.
 */
const SORT_OPTIONS = [
  { value: 'stars',   label: '★ Stars'   },
  { value: 'name',    label: 'A→Z Name'  },
  { value: 'updated', label: '↻ Updated' },
];

export function RepoList({
  repos,
  hasMore,
  loading,
  sortBy,
  onSort,
  onLoadMore,
  username
}) {
  return (
    <motion.section
      className={styles.section}
      // Fade in when component first appears
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      aria-label="Repository list"
    >
      {/* ── HEADER ROW: title + sort controls ──────────────── */}
      <div className={styles.header}>

        {/* Section title with repo count */}
        <h3 className={styles.title}>
          Repositories
          <span className={styles.count}>{repos.length}</span>
        </h3>

        {/* Sort buttons */}
        <div
          className={styles.sortControls}
          role="group"
          aria-label="Sort repositories"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.sortButton} ${
                sortBy === option.value ? styles.sortButtonActive : ''
              }`}
              onClick={() => onSort(option.value)}
              aria-pressed={sortBy === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── REPO GRID ──────────────────────────────────────── */}
      {/*
        Each RepoCard receives its index so it can calculate
        its own stagger animation delay.
      */}
      <div className={styles.grid}>
        {repos.map((repo, index) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            index={index}
          />
        ))}
      </div>

      {/* ── LOAD MORE ──────────────────────────────────────── */}
      {/*
        Only render this section if there are more pages OR
        if we're currently loading more (to show the spinner).
        Once hasMore is false and not loading, this disappears.
      */}
      {(hasMore || loading) && (
        <div className={styles.loadMoreWrapper}>
          <button
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            disabled={loading}
            aria-label="Load more repositories"
          >
            {loading ? (
              /* Spinner during load more fetch */
              <>
                <span className={styles.spinner} />
                Loading...
              </>
            ) : (
              <>
                Load More Repositories
                {/* Down arrow icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── END OF RESULTS ─────────────────────────────────── */}
      {/*
        When hasMore is false and we have repos,
        show a subtle "end of list" indicator.
      */}
      {!hasMore && repos.length > 0 && (
        <p className={styles.endMessage}>
          All {repos.length} repositories loaded
        </p>
      )}
    </motion.section>
  );
}