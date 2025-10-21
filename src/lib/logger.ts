/**
 * Application logger with environment-aware logging
 *
 * Provides conditional logging that only outputs in development mode,
 * while always logging errors and sending them to monitoring services in production.
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.log('User action completed'); // Only in dev
 * logger.warn('Deprecated API usage'); // Only in dev
 * logger.error('Failed to load data', error); // Always logged + sent to monitoring
 * logger.info('System status', { uptime: 1000 }); // Only in dev
 * ```
 */

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Log general information (development only)
   * @param message - The message to log
   * @param metadata - Optional additional data
   */
  log(message: string, ...metadata: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...metadata);
    }
  }

  /**
   * Log informational messages (development only)
   * @param message - The message to log
   * @param metadata - Optional additional data
   */
  info(message: string, ...metadata: unknown[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...metadata);
    }
  }

  /**
   * Log warning messages (development only)
   * @param message - The warning message
   * @param metadata - Optional additional data
   */
  warn(message: string, ...metadata: unknown[]): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...metadata);
    }
  }

  /**
   * Log error messages (always logged, sent to monitoring in production)
   * @param message - The error message
   * @param error - The error object
   * @param metadata - Optional additional context
   */
  error(message: string, error?: Error | unknown, metadata?: LogMetadata): void {
    // Always log errors to console
    console.error(`[ERROR] ${message}`, error, metadata);

    // Send to monitoring service in production
    if (!this.isDevelopment) {
      this.sendToMonitoring(message, error, metadata);
    }
  }

  /**
   * Log debug information (development only)
   * @param message - The debug message
   * @param metadata - Optional debug data
   */
  debug(message: string, ...metadata: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...metadata);
    }
  }

  /**
   * Log performance metrics (development only)
   * @param label - The performance label
   * @param duration - Duration in milliseconds
   * @param metadata - Optional additional context
   */
  performance(label: string, duration: number, metadata?: LogMetadata): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${duration}ms`, metadata);
    }
  }

  /**
   * Send error to monitoring service (Sentry, etc.)
   * @private
   */
  private sendToMonitoring(
    message: string,
    error?: Error | unknown,
    metadata?: LogMetadata
  ): void {
    // TODO: Integrate with Sentry or other monitoring service
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     extra: { message, ...metadata }
    //   });
    // }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogMetadata };
