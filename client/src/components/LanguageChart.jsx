/**
 * LanguageChart.jsx
 *
 * Displays a bar chart of programming language distribution
 * across a user's repositories.
 *
 * WHY recharts?
 * - React-native charting library (uses React components)
 * - Lightweight and well-maintained
 * - Brief explicitly mentions it as an acceptable choice
 * - No canvas needed — pure SVG output
 *
 * WHY compute language stats here vs in the hook?
 * Language stats are purely a UI concern — only this
 * component needs them. Computing in the hook would
 * expose data no other component uses.
 *
 * Props:
 * @prop {Array} repos - Array of repo objects with language field
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import styles from './LanguageChart.module.css';

/**
 * Language colors — same map as RepoCard for consistency.
 * Ensures the chart colors match the language dots in cards.
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

/** Fallback color for unknown languages */
const DEFAULT_COLOR = '#94a3b8';

/**
 * Custom tooltip shown when hovering a bar.
 * Replaces recharts default tooltip with our styled version.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const { language, count, percentage } = payload[0].payload;

  return (
    <div className={styles.tooltip}>
      <span
        className={styles.tooltipDot}
        style={{ backgroundColor: LANGUAGE_COLORS[language] || DEFAULT_COLOR }}
      />
      <span className={styles.tooltipLabel}>{language}</span>
      <span className={styles.tooltipValue}>
        {count} repo{count !== 1 ? 's' : ''} ({percentage}%)
      </span>
    </div>
  );
}

export function LanguageChart({ repos }) {
  /**
   * Compute language statistics from repos array.
   *
   * Process:
   * 1. Count repos per language
   * 2. Filter out repos with no language (null)
   * 3. Sort by count descending
   * 4. Take top 8 — more than that makes the chart crowded
   * 5. Calculate percentage for each
   */
  const chartData = useMemo(() => {
    // Step 1: Count occurrences of each language
    const languageCounts = repos.reduce((accumulator, repo) => {
      if (!repo.language) return accumulator; // skip repos with no language

      accumulator[repo.language] = (accumulator[repo.language] || 0) + 1;
      return accumulator;
    }, {});

    // Step 2: Convert to array and sort by count
    const sorted = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // top 8 languages only

    // Step 3: Calculate total for percentage
    const total = sorted.reduce((sum, item) => sum + item.count, 0);

    // Step 4: Add percentage to each entry
    return sorted.map((item) => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }));
  }, [repos]);

  // Don't render if no language data available
  if (chartData.length === 0) return null;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className={styles.header}>
        <h3 className={styles.title}>Language Distribution</h3>
        <span className={styles.subtitle}>
            Based on {repos.length} loaded repositories
        </span>
      </div>

      {/* ── BAR CHART ──────────────────────────────────────── */}
      {/*
        ResponsiveContainer makes the chart fill its parent width.
        Height is fixed at 200px — enough to show bars clearly.
      */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="30%"
          >
            {/* X axis: language names */}
            <XAxis
              dataKey="language"
              tick={{
                fill: '#94a3b8',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace'
              }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y axis: repo count */}
            <YAxis
              tick={{
                fill: '#475569',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace'
              }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            {/* Custom tooltip on hover */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />

            {/* The bars — each colored by language */}
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.language}
                  fill={LANGUAGE_COLORS[entry.language] || DEFAULT_COLOR}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── LEGEND ─────────────────────────────────────────── */}
      {/*
        Recharts legend doesn't style well in dark mode.
        We build our own simple legend below the chart.
      */}
      <div className={styles.legend}>
        {chartData.map((entry) => (
          <div key={entry.language} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{
                backgroundColor: LANGUAGE_COLORS[entry.language] || DEFAULT_COLOR
              }}
            />
            <span className={styles.legendLabel}>{entry.language}</span>
            <span className={styles.legendCount}>{entry.percentage}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}