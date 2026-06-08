/**
 * RecentSearches.jsx
 *
 * Displays a row of clickable chips for recently searched
 * GitHub usernames. Appears on the landing page below
 * the search bar.
 *
 * WHY chips instead of a dropdown?
 * Chips are immediately visible — no click needed to see
 * options. For a max of 5 items, chips are cleaner than
 * a dropdown which would feel like overkill.
 *
 * Props:
 * @prop {string[]}  searches  - Array of recent usernames
 * @prop {function}  onSelect  - Called with username when chip clicked
 * @prop {function}  onClear   - Called when Clear button clicked
 */

import { motion } from 'framer-motion';
import styles from './RecentSearches.module.css';

export function RecentSearches({ searches, onSelect, onClear }) {
  // Don't render anything if no recent searches exist
  if (!searches || searches.length === 0) return null;

  return (
    <motion.div
      className={styles.wrapper}
      // Fade in when recent searches appear
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Label */}
      <span className={styles.label}>Recent</span>

      {/* Chips row */}
      <div className={styles.chips}>
        {searches.map((username, index) => (
          <motion.button
            key={username}
            className={styles.chip}
            onClick={() => onSelect(username)}
            aria-label={`Search ${username} again`}
            // Stagger each chip appearing
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Small user icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {username}
          </motion.button>
        ))}
      </div>

      {/* Clear button */}
      <button
        className={styles.clearButton}
        onClick={onClear}
        aria-label="Clear recent searches"
      >
        Clear
      </button>
    </motion.div>
  );
}