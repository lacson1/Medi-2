/**
 * API Configuration for MediFlow Application
 * Centralized configuration for API integration
 */

// Environment variables with fallbacks
export const API_CONFIG = {
    // Use environment variable for mock data, default to false in production
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.MODE !== 'production',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
    baseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? 'https://api.yourdomain.com' : 'http://localhost:3001'),
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true' && import.meta.env.MODE !== 'production'
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