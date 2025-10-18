/**
 * API Configuration for MediFlow Application
 * Centralized configuration for API integration
 */

// Environment variables with fallbacks
export const API_CONFIG = {
    // Disable mock data by default - use real API
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production'
} as const;

// Validate required configuration
export const validateApiConfig = (): boolean => {
    return true;
};

// Request configuration
export const REQUEST_CONFIG = {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000 // 1 second
} as const;

// Error handling configuration
export const ERROR_CONFIG = {
    showUserFriendlyErrors: true,
    logErrors: true,
    fallbackToMockOnError: API_CONFIG.isDevelopment
} as const;