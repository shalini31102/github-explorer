/**
 * SkeletonLoader.jsx
 *
 * Placeholder loading UI that mimics the shape of real content.
 *
 * WHY skeletons over a spinner?
 * Skeletons show the user WHERE content will appear,
 * reducing perceived load time. The page feels responsive
 * even before data arrives. This is standard practice at
 * GitHub, LinkedIn, YouTube, and most modern apps.
 *
 * WHY two separate components (Profile + Repo)?
 * Each skeleton matches the exact layout of its real
 * counterpart. The profile skeleton mimics UserProfile.jsx
 * and the repo skeleton mimics RepoCard.jsx.
 *
 * The shimmer animation is a CSS gradient that slides
 * left to right, giving the impression of light reflecting
 * off a surface — standard skeleton loader pattern.
 */

import styles from './SkeletonLoader.module.css';

/**
 * A single animated shimmer block.
 * Used as the building block for all skeleton elements.
 *
 * @param {string} className - Additional CSS class for sizing
 */
function ShimmerBlock({ className }) {
  return (
    <div
      className={`${styles.shimmer} ${className || ''}`}
      aria-hidden="true" // hidden from screen readers — decorative only
    />
  );
}

/**
 * ProfileSkeleton
 *
 * Mimics the layout of UserProfile.jsx:
 * - Circle on the left (avatar)
 * - Lines on the right (name, bio, stats)
 */
export function ProfileSkeleton() {
  return (
    <div
      className={styles.profileCard}
      role="status"
      aria-label="Loading user profile"
    >
      {/* Avatar circle placeholder */}
      <ShimmerBlock className={styles.avatar} />

      {/* Right side info placeholders */}
      <div className={styles.profileInfo}>
        {/* Name line — wider */}
        <ShimmerBlock className={styles.lineLg} />

        {/* Username line — medium */}
        <ShimmerBlock className={styles.lineMd} />

        {/* Bio lines — two lines */}
        <ShimmerBlock className={styles.lineFull} />
        <ShimmerBlock className={styles.lineXl} />

        {/* Stats row — three short blocks */}
        <div className={styles.statsRow}>
          <ShimmerBlock className={styles.lineSm} />
          <ShimmerBlock className={styles.lineSm} />
          <ShimmerBlock className={styles.lineSm} />
        </div>
      </div>
    </div>
  );
}

/**
 * RepoSkeleton
 *
 * Mimics the layout of RepoCard.jsx:
 * - Title line at top
 * - Description lines
 * - Bottom row with language dot + stats
 */
export function RepoSkeleton() {
  return (
    <div
      className={styles.repoCard}
      role="status"
      aria-label="Loading repository"
    >
      {/* Repo name line */}
      <ShimmerBlock className={styles.lineMd} />

      {/* Description lines */}
      <ShimmerBlock className={styles.lineFull} />
      <ShimmerBlock className={styles.lineXl} />

      {/* Bottom row: language dot + stats */}
      <div className={styles.repoBottom}>
        <ShimmerBlock className={styles.dot} />
        <ShimmerBlock className={styles.lineSm} />
        <ShimmerBlock className={styles.lineSm} />
        <ShimmerBlock className={styles.lineSm} />
      </div>
    </div>
  );
}

/**
 * RepoGridSkeleton
 *
 * Renders a full grid of RepoSkeleton cards.
 * 6 cards matches the typical first-page result count
 * for users with many repos, so the layout feels accurate.
 *
 * @param {number} count - Number of skeleton cards to show (default: 6)
 */
export function RepoGridSkeleton({ count = 6 }) {
  return (
    <div className={styles.grid}>
      {/*
        Array.from creates an array of `count` items.
        We only need the index for the key — value is unused (_).
      */}
      {Array.from({ length: count }, (_, i) => (
        <RepoSkeleton key={i} />
      ))}
    </div>
  );
}