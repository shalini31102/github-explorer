/**
 * RepoCard.jsx
 *
 * Displays a single GitHub repository as a glassmorphism card.
 * Supports click-to-expand for additional repo details.
 *
 * WHY click-to-expand?
 * The brief's "Should Have" requirement asks to click a repo
 * to see additional details (open issues, default branch).
 * Expand-in-place is cleaner than navigation for this use case.
 *
 * WHY index prop for animation?
 * Framer Motion's stagger effect needs each card to know
 * its position in the list to calculate the delay offset.
 * Card at index 0 appears first, index 1 appears 50ms later, etc.
 *
 * Props:
 * @prop {Object} repo  - Repository data from our backend
 * @prop {number} index - Position in the list (for stagger animation)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './RepoCard.module.css';

/**
 * Language color map.
 * Maps programming language names to their GitHub-standard colors.
 * Used to render the colored dot next to the language name.
 * Falls back to a neutral color for unknown languages.
 */
const LANGUAGE_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  Java:        '#b07219',
  C:           '#555555',
  'C++':       '#f34b7d',
  'C#':        '#178600',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  Ruby:        '#701516',
  PHP:         '#4F5D95',
  Swift:       '#F05138',
  Kotlin:      '#A97BFF',
  Dart:        '#00B4AB',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Shell:       '#89e051',
  Vue:         '#41b883',
  Svelte:      '#ff3e00',
  OpenSCAD:    '#e5cd31',
  'Jupyter Notebook': '#DA5B0B',
};

/**
 * Formats a date string into a human-readable relative time.
 * "2026-06-01T00:00:00Z" → "Updated 7 days ago"
 *
 * @param {string} dateString - ISO date string from GitHub API
 * @returns {string} - Human readable relative time
 */
function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 30) return `Updated ${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Updated 1 month ago';
  if (diffMonths < 12) return `Updated ${diffMonths} months ago`;

  const diffYears = Math.floor(diffDays / 365);
  if (diffYears === 1) return 'Updated 1 year ago';
  return `Updated ${diffYears} years ago`;
}

/**
 * Formats star/fork counts with K suffix.
 * 1200 → "1.2k", 42 → "42"
 */
function formatCount(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(num);
}

export function RepoCard({ repo, index }) {
  // Local state — controls whether the expanded details are visible
  const [isExpanded, setIsExpanded] = useState(false);

  // Get language color, fall back to muted color for unknown languages
  const languageColor = LANGUAGE_COLORS[repo.language] || '#94a3b8';

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.4),
        ease: 'easeOut'
      }}
      whileHover={{ y: -3 }}
    >
      {/* ── MAIN CARD CONTENT ──────────────────────────────── */}
      <div className={styles.cardBody}>

        {/* ── TOP ROW: name + expand toggle ────────────────── */}
        <div className={styles.topRow}>

          {/* Repo name — links to GitHub */}
          <a
            className={styles.repoName}
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${repo.name} on GitHub`}
            onClick={(e) => e.stopPropagation()}
          >
            {repo.name}
          </a>

          {/* Expand/collapse toggle button */}
          <button
            className={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            aria-expanded={isExpanded}
          >
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex' }}
            >
              {/* Chevron icon — rotates 180° when expanded */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.span>
          </button>
        </div>

        {/* ── DESCRIPTION ──────────────────────────────────── */}
        {repo.description ? (
          <p className={styles.description}>{repo.description}</p>
        ) : (
          <p className={styles.noDescription}>No description provided</p>
        )}

        {/* ── BOTTOM ROW: language + stats ─────────────────── */}
        <div className={styles.bottomRow}>

          {/* Language dot + name */}
          {repo.language && (
            <span className={styles.language}>
              <span
                className={styles.languageDot}
                style={{ backgroundColor: languageColor }}
                aria-hidden="true"
              />
              {repo.language}
            </span>
          )}

          {/* Star count */}
          <span className={styles.stat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {formatCount(repo.stars)}
          </span>

          {/* Fork count */}
          <span className={styles.stat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
            {formatCount(repo.forks)}
          </span>

          {/* Last updated */}
          <span className={styles.updatedAt}>
            {formatRelativeDate(repo.updatedAt)}
          </span>
        </div>
      </div>

      {/* ── EXPANDED DETAILS ───────────────────────────────── */}
      {/*
        AnimatePresence allows exit animations.
        When isExpanded becomes false, the details animate OUT
        before being removed from the DOM.
      */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.expandedDetails}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={styles.detailsInner}>

              {/* Open issues count */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Open Issues</span>
                <span className={styles.detailValue}>
                  {repo.openIssues === 0 ? 'None' : repo.openIssues}
                </span>
              </div>

              {/* Default branch */}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Default Branch</span>
                <span className={styles.detailBranch}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="6" y1="3" x2="6" y2="15" />
                    <circle cx="18" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="6" cy="6" r="3" />
                    <path d="M18 9a9 9 0 0 1-9 9" />
                  </svg>
                  {repo.defaultBranch}
                </span>
              </div>

              {/* Topics — only if repo has any */}
              {repo.topics && repo.topics.length > 0 && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Topics</span>
                  <div className={styles.topicsList}>
                    {repo.topics.map((topic) => (
                      <span key={topic} className={styles.topicBadge}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* View repository button */}
              <a
                className={styles.viewButton}
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Repository
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}