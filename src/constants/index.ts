/**
 * Application-wide constants
 *
 * Centralized constants for magic numbers, configuration values,
 * and other reusable values throughout the application.
 *
 * @module constants
 */

/**
 * Time-related constants (all in milliseconds)
 */
export const TIME = {
  ONE_SECOND: 1000,
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Toast notification durations and delays (in milliseconds)
 */
export const TOAST = {
  REMOVE_DELAY: 1500,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
  INFO_DURATION: 3000,
} as const;

/**
 * API configuration constants
 */
export const API = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
} as const;

/**
 * Medication dosage options (in various units)
 */
export const MEDICATION_DOSAGES = [
  "5",
  "10",
  "20",
  "25",
  "50",
  "100",
  "250",
  "500",
  "1000",
] as const;

/**
 * Pagination configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  MIN_PAGE_SIZE: 5,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;

/**
 * Search configuration
 */
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300, // milliseconds
  MAX_RESULTS: 50,
} as const;

/**
 * Performance monitoring thresholds (in milliseconds)
 */
export const PERFORMANCE = {
  SLOW_API_THRESHOLD: 1000,
  CRITICAL_API_THRESHOLD: 3000,
  SLOW_RENDER_THRESHOLD: 16, // 60fps target
  CRITICAL_RENDER_THRESHOLD: 100,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'medi2_auth_token',
  REFRESH_TOKEN: 'medi2_refresh_token',
  USER_PREFERENCES: 'medi2_user_prefs',
  SELECTED_ORGANIZATION: 'medi2_selected_org',
  THEME: 'medi2_theme',
  LANGUAGE: 'medi2_language',
} as const;

/**
 * Breakpoints for responsive design (in pixels)
 */
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  WIDE: 1280,
  ULTRAWIDE: 1536,
} as const;

/**
 * Chart/Analytics configuration
 */
export const CHARTS = {
  DEFAULT_HEIGHT: 300,
  DEFAULT_WIDTH: 600,
  ANIMATION_DURATION: 300,
  COLORS: {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#6366f1',
  } as const,
} as const;

/**
 * Form validation constants
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  ZIP_CODE_LENGTH: 5,
  SSN_LENGTH: 9,
} as const;

/**
 * Audit logging constants
 */
export const AUDIT = {
  MAX_LOG_SIZE: 10000, // Maximum entries to keep in memory
  BATCH_SIZE: 100, // Number of logs to send at once
  FLUSH_INTERVAL: 60000, // Flush logs every minute
} as const;

/**
 * WebRTC/Telemedicine constants
 */
export const TELEMEDICINE = {
  ICE_GATHERING_TIMEOUT: 3000,
  CONNECTION_TIMEOUT: 10000,
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY: 2000,
} as const;

/**
 * Lab test constants
 */
export const LAB_TESTS = {
  RESULT_EXPIRY_DAYS: 90,
  CRITICAL_RESULT_ALERT_HOURS: 1,
  NORMAL_RESULT_NOTIFICATION_HOURS: 24,
} as const;

/**
 * Appointment constants
 */
export const APPOINTMENTS = {
  DEFAULT_DURATION_MINUTES: 30,
  MIN_DURATION_MINUTES: 15,
  MAX_DURATION_MINUTES: 240,
  REMINDER_ADVANCE_HOURS: 24,
  CANCELLATION_NOTICE_HOURS: 4,
} as const;

/**
 * Date format patterns
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATETIME: 'MMM dd, yyyy HH:mm',
  DISPLAY_TIME: 'HH:mm',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SENT: 'Sent successfully.',
} as const;
