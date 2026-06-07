/**
 * UserProfile.jsx
 *
 * Displays a GitHub user's public profile information.
 * Rendered after a successful search.
 *
 * WHY optional rendering with &&?
 * GitHub API returns null for bio, location, company
 * when a user hasn't filled them in. We only render
 * these fields if they actually have a value.
 * This prevents empty placeholder elements in the DOM.
 *
 * Props:
 * @prop {Object} profile - Shaped user profile from our backend
 * @prop {string} profile.login
 * @prop {string} profile.name
 * @prop {string|null} profile.bio
 * @prop {string} profile.avatarUrl
 * @prop {number} profile.followers
 * @prop {number} profile.following
 * @prop {number} profile.publicRepos
 * @prop {string} profile.htmlUrl
 * @prop {string|null} profile.location
 * @prop {string|null} profile.company
 */

import { motion } from 'framer-motion';
import styles from './UserProfile.module.css';

/**
 * Formats large numbers with K suffix for readability.
 * 1200 → "1.2k", 305000 → "305k", 42 → "42"
 *
 * @param {number} num - The number to format
 * @returns {string} - Formatted string
 */
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(num);
}

export function UserProfile({ profile }) {
  return (
    <motion.div
      className={styles.card}
      // Animate in from above when component mounts
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* ── LEFT: Avatar ───────────────────────────────────── */}
      <div className={styles.avatarWrapper}>
        <img
          className={styles.avatar}
          src={profile.avatarUrl}
          alt={`${profile.login}'s GitHub avatar`}
        />
      </div>

      {/* ── RIGHT: Info ────────────────────────────────────── */}
      <div className={styles.info}>

        {/* Name + username */}
        <div className={styles.nameRow}>
          <h2 className={styles.name}>
            {/* Show name if available, fall back to login */}
            {profile.name || profile.login}
          </h2>
          <span className={styles.login}>@{profile.login}</span>
        </div>

        {/* Bio — only render if user has one */}
        {profile.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}

        {/* Meta: location + company — only if they exist */}
        {(profile.location || profile.company) && (
          <div className={styles.metaRow}>
            {profile.location && (
              <span className={styles.metaItem}>
                {/* Location icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {profile.location}
              </span>
            )}
            {profile.company && (
              <span className={styles.metaItem}>
                {/* Company icon */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {profile.company}
              </span>
            )}
          </div>
        )}

        {/* ── Stats Row ──────────────────────────────────────── */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {formatNumber(profile.followers)}
            </span>
            <span className={styles.statLabel}>followers</span>
          </div>

          {/* Divider dot */}
          <span className={styles.statDivider}>·</span>

          <div className={styles.stat}>
            <span className={styles.statValue}>
              {formatNumber(profile.following)}
            </span>
            <span className={styles.statLabel}>following</span>
          </div>

          {/* Divider dot */}
          <span className={styles.statDivider}>·</span>

          <div className={styles.stat}>
            <span className={styles.statValue}>
              {formatNumber(profile.publicRepos)}
            </span>
            <span className={styles.statLabel}>repos</span>
          </div>
        </div>

        {/* View on GitHub link */}
        <a
          className={styles.githubLink}
          href={profile.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${profile.login}'s GitHub profile`}
        >
          View on GitHub
          {/* External link icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}