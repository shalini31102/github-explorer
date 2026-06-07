/**
 * SearchBar.jsx
 *
 * The primary search input component.
 * Handles user input and triggers the GitHub username search.
 *
 * WHY local useState for input?
 * The typed value only matters to this component until
 * the user submits. No other component cares what the
 * user is currently typing — only the final submitted value.
 *
 * Props:
 * @prop {function} onSearch  - Called with username string on submit
 * @prop {boolean}  loading   - Disables input/button while fetching
 * @prop {boolean}  hasError  - Triggers shake animation on error
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './SearchBar.module.css';

export function SearchBar({ onSearch, loading, hasError }) {
  // Local state — only this component needs to know what's being typed
  const [inputValue, setInputValue] = useState('');

  /**
   * handleSubmit
   * Validates input then calls onSearch with the trimmed username.
   * Trim removes accidental leading/trailing spaces.
   */
  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return; // guard: don't search empty or while loading
    onSearch(trimmed);
  }

  /**
   * handleKeyDown
   * Allows user to press Enter instead of clicking the button.
   * Standard UX expectation for search inputs.
   */
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Hero text — only visible on landing */}
      <motion.h1
        className={styles.heroTitle}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        Explore{' '}
        <span className={styles.heroAccent}>GitHub</span>{' '}
        Profiles
      </motion.h1>

      <motion.p
        className={styles.heroSubtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        Search any GitHub username to explore their repositories
      </motion.p>

      {/* 
        Search input row
        animate="shake" triggers the shake animation when hasError is true
        This gives immediate visual feedback without an alert popup
      */}
      <motion.div
        className={styles.searchRow}
        animate={hasError ? 'shake' : 'idle'}
        variants={{
          idle: { x: 0 },
          shake: {
            x: [-8, 8, -6, 6, -4, 4, 0],
            transition: { duration: 0.4 }
          }
        }}
      >
        {/* Search icon */}
        <span className={styles.searchIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>

        <input
          className={styles.input}
          type="text"
          placeholder="Enter a GitHub username (e.g. torvalds)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          // Auto-focus so user can type immediately on landing
          autoFocus
          aria-label="GitHub username search"
        />

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading || !inputValue.trim()}
          aria-label="Search GitHub user"
        >
          {loading ? (
            /* Spinner while loading */
            <span className={styles.spinner} />
          ) : (
            'Search'
          )}
        </button>
      </motion.div>
    </div>
  );
}