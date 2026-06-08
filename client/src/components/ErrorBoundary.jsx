/**
 * ErrorBoundary.jsx
 *
 * React class component that catches unexpected JavaScript errors
 * anywhere in the component tree and shows a fallback UI
 * instead of a blank white screen.
 *
 * WHY a class component?
 * Error boundaries MUST be class components — React does not
 * yet support error boundaries as function components.
 * This is the one legitimate use case for class components
 * in a modern React codebase.
 *
 * WHY do we need this?
 * Our hook and API layer handle known errors (404, 403, network).
 * But unknown errors — malformed API response, null reference,
 * third party library crash — would show a blank white screen.
 * This catches those and shows a helpful message instead.
 */

import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // hasError: true triggers the fallback UI
    this.state = { hasError: false, error: null };
  }

  /**
   * getDerivedStateFromError
   *
   * Called when a child component throws an error.
   * Returns new state that triggers the fallback UI.
   * This is a static method — it cannot access `this`.
   *
   * @param {Error} error - The error that was thrown
   * @returns {Object} - New state with hasError: true
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch
   *
   * Called after an error has been caught.
   * Used for logging — in production you'd send this
   * to an error tracking service like Sentry.
   *
   * @param {Error} error - The error that was thrown
   * @param {Object} info - Component stack trace
   */
  componentDidCatch(error, info) {
    // Log to console in development
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', info.componentStack);
  }

  /**
   * handleReset
   *
   * Resets the error state and reloads the page.
   * Gives the user a way to recover without manually refreshing.
   */
  handleReset() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper}>
          <div className={styles.card}>

            {/* Error icon */}
            <div className={styles.iconWrapper}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 className={styles.title}>Something went wrong</h2>

            <p className={styles.message}>
              An unexpected error occurred. This has been logged
              and we'll look into it.
            </p>

            {/* Show error message in development */}
            {import.meta.env.DEV && this.state.error && (
              <pre className={styles.errorDetails}>
                {this.state.error.message}
              </pre>
            )}

            <button
              className={styles.resetButton}
              onClick={this.handleReset}
            >
              Reload Page
            </button>

          </div>
        </div>
      );
    }

    // No error — render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;