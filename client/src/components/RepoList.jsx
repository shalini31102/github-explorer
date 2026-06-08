/**
 * RepoList.jsx
 *
 * Renders the repository grid with sort controls,
 * filter input, and pagination.
 *
 * Props:
 * @prop {Array}    repos       - Filtered + sorted array of repo objects
 * @prop {boolean}  hasMore     - Whether more pages exist
 * @prop {boolean}  loading     - True during Load More fetch
 * @prop {string}   sortBy      - Current sort: 'stars'|'name'|'updated'
 * @prop {string}   filterQuery - Current filter text
 * @prop {function} onSort      - Called with new sortBy value
 * @prop {function} onFilter    - Called with new filter text
 * @prop {function} onLoadMore  - Called when Load More is clicked
 * @prop {string}   username    - Current searched username
 */

import { motion } from 'framer-motion';
import { RepoCard } from './RepoCard';
import styles from './RepoList.module.css';

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
  filterQuery,
  onSort,
  onFilter,
  onLoadMore,
  username
}) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      aria-label="Repository list"
    >
      {/* ── HEADER ROW: title + sort controls ──────────────── */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          Repositories
          <span className={styles.count}>{repos.length}</span>
        </h3>

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

      {/* ── FILTER INPUT ───────────────────────────────────── */}
      <div className={styles.filterWrapper}>
        <span className={styles.filterIcon}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>

        <input
          className={styles.filterInput}
          type="text"
          placeholder="Filter repositories by name..."
          value={filterQuery}
          onChange={(e) => onFilter(e.target.value)}
          aria-label="Filter repositories by name"
        />

        {/* Clear filter button — only shown when filter is active */}
        {filterQuery && (
          <button
            className={styles.filterClear}
            onClick={() => onFilter('')}
            aria-label="Clear filter"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── FILTER RESULTS COUNT ───────────────────────────── */}
      {filterQuery && (
        <p className={styles.filterCount}>
          {repos.length === 0
            ? `No repositories match "${filterQuery}"`
            : `Showing ${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'} matching "${filterQuery}"`
          }
        </p>
      )}

      {/* ── REPO GRID or EMPTY FILTER STATE ──────────────── */}
      {repos.length === 0 && filterQuery ? (
        <div className={styles.emptyFilter}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p>No repositories match <strong>"{filterQuery}"</strong></p>
          <button
            className={styles.clearFilterButton}
            onClick={() => onFilter('')}
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {repos.map((repo, index) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              index={index}
            />
          ))}
        </div>
      )}

      {/* ── LOAD MORE ──────────────────────────────────────── */}
      {(hasMore || loading) && (
        <div className={styles.loadMoreWrapper}>
          <button
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            disabled={loading}
            aria-label="Load more repositories"
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                Loading...
              </>
            ) : (
              <>
                Load More Repositories
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── END OF RESULTS ─────────────────────────────────── */}
      {!hasMore && repos.length > 0 && !filterQuery && (
        <p className={styles.endMessage}>
          All {repos.length} repositories loaded
        </p>
      )}
    </motion.section>
  );
}