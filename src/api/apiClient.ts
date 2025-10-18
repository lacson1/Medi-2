/**
 * Enhanced API Client with comprehensive error handling, retry logic, and monitoring
 * Centralized API communication layer for MEDI 2 application
 * Now uses real backend API instead of mock data
 */

import { REQUEST_CONFIG, ERROR_CONFIG } from './apiConfig';
import { ErrorLogger, PerformanceMonitor } from '@/lib/monitoring';
import { realApiClient } from './realApiClient';
import type {
    Patient,
    Appointment,
    User,
    Organization,
    ListOptions,
    GetOptions,
    EntityType,
    ApiErrorContext
} from '@/types';

// Request options interface
interface RequestOptions {
    retries?: number;
    retryDelay?: number;
    useCache?: boolean;
    cacheTTL?: number;
    [key: string]: unknown;
}

// Batch operation interface
interface BatchOperation {
    type: 'list' | 'get' | 'create' | 'update' | 'delete';
    entityType: EntityType;
    id?: string;
    data?: unknown;
    options?: RequestOptions;
}

// Batch result interface
interface BatchResult {
    operation: BatchOperation;
    success: boolean;
    data: unknown;
    error: Error | null;
}

// Cache entry interface
interface CacheEntry {
    data: unknown;
    timestamp: number;
    ttl: number;
}

// Health check result interface
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
    timestamp: string;
}

// Request interceptor for authentication and monitoring
class ApiRequestInterceptor {
    private activeRequests = new Set<string>();

    async intercept<T>(requestFn: () => Promise<T>, options: RequestOptions = {}): Promise<T> {
        const requestId = this.generateRequestId();

        try {
            // Add to active requests
            this.activeRequests.add(requestId);

            // Log request start
            const startTime = PerformanceMonitor.startTiming(`api_request_${requestId}`);

            // Execute request with retry logic
            const result = await this.executeWithRetry(requestFn, options);

            // Log successful request
            PerformanceMonitor.endTiming(`api_request_${requestId}`, startTime);

            return result;
        } catch (error) {
            // Enhanced error handling
            this.handleApiError(error as Error, requestId, options);
            throw error;
        } finally {
            this.activeRequests.delete(requestId);
        }
    }

    private async executeWithRetry<T>(requestFn: () => Promise<T>, options: RequestOptions = {}): Promise<T> {
        const maxRetries = options.retries || REQUEST_CONFIG.retries;
        const retryDelay = options.retryDelay || REQUEST_CONFIG.retryDelay;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                // Don't retry on certain error types
                if (this.shouldNotRetry(error as Error, attempt, maxRetries)) {
                    throw error;
                }

                // Wait before retry
                if (attempt < maxRetries) {
                    await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }
        }
        throw new Error('Max retries exceeded');
    }

    private shouldNotRetry(error: Error, attempt: number, maxRetries: number): boolean {
        const errorWithStatus = error as Error & { status?: number };

        // Don't retry on authentication errors
        if (errorWithStatus.status === 401 || errorWithStatus.status === 403) {
            return true;
        }

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500 && errorWithStatus.status !== 429) {
            return true;
        }

        // Don't retry if max attempts reached
        if (attempt >= maxRetries) {
            return true;
        }

        return false;
    }

    private handleApiError(error: Error, requestId: string, options: RequestOptions): void {
        const errorWithStatus = error as Error & {
            status?: number;
            url?: string;
            method?: string;
            response?: unknown;
            code?: string;
        };

        const errorContext: ApiErrorContext = {
            requestId,
            timestamp: new Date().toISOString(),
            url: errorWithStatus.url || 'unknown',
            method: errorWithStatus.method || 'unknown',
            status: errorWithStatus.status,
            response: errorWithStatus.response,
            options
        };

        // Log error with context
        ErrorLogger.log(error, {
            tags: {
                type: 'api_error',
                status: errorWithStatus.status?.toString() || 'unknown',
                endpoint: errorWithStatus.url || 'unknown'
            },
            extra: errorContext
        });

        // Handle specific error types
        this.handleSpecificErrors(errorWithStatus);
    }

    private handleSpecificErrors(error: Error & { status?: number; code?: string }): void {
        switch (error.status) {
            case 401:
                // Unauthorized - redirect to login
                this.handleUnauthorized();
                break;
            case 403:
                // Forbidden - show access denied
                this.showUserError('Access denied. Insufficient permissions.');
                break;
            case 404:
                // Not found - provide more specific guidance
                this.showUserError('The requested resource was not found. Please check the URL or contact support if this persists.');
                break;
            case 409:
                // Conflict - duplicate resource
                this.showUserError('This resource already exists. Please check your data and try again.');
                break;
            case 422:
                // Validation error
                this.showUserError('Please check your input data and try again.');
                break;
            case 429:
                // Rate limited
                this.showUserError('Too many requests. Please wait a moment before trying again.');
                break;
            case 500:
                // Server error
                this.showUserError('Server error. Please try again later or contact support.');
                break;
            case 502:
            case 503:
            case 504:
                // Service unavailable
                this.showUserError('Service temporarily unavailable. Please try again in a few moments.');
                break;
            default:
                if (error.code === 'NETWORK_ERROR') {
                    this.showUserError('Network error. Please check your internet connection and try again.');
                } else if (error.code === 'TIMEOUT') {
                    this.showUserError('Request timed out. Please try again.');
                } else {
                    this.showUserError('An unexpected error occurred. Please try again or contact support.');
                }
        }
    }

    private handleUnauthorized(): void {
        // Clear stored token
        localStorage.removeItem('auth_token');

        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    private showUserError(message: string): void {
        if (ERROR_CONFIG.showUserFriendlyErrors) {
            // Log user-facing errors for monitoring
            ErrorLogger.log(new Error(message), {
                tags: { type: 'user_error' },
                extra: { message }
            });
        }
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


// Enhanced API Client
export class EnhancedApiClient {
    private interceptor: ApiRequestInterceptor;
    private cache: Map<string, CacheEntry>;

    constructor() {
        this.interceptor = new ApiRequestInterceptor();
        this.cache = new Map();
    }

    // Helper method to get API endpoint for entity type
    private getEntityEndpoint(entityType: EntityType): string {
        const endpointMap: { [key in EntityType]: string } = {
            Patient: '/patients',
            Appointment: '/appointments',
            User: '/users',
            Organization: '/organizations',
            Encounter: '/encounters',
            Prescription: '/prescriptions',
            LabOrder: '/lab-orders',
            Billing: '/billing',
            ConsultationTemplate: '/consultation-templates',
            MedicalDocumentTemplate: '/medical-document-templates'
        };
        return endpointMap[entityType] || `/${entityType.toLowerCase()}s`;
    }

    // Generic entity operations with real API integration
    async list<T>(entityType: EntityType, options: ListOptions = {}): Promise<T[]> {
        return this.interceptor.intercept(async () => {
            const cacheKey = `list_${entityType}_${JSON.stringify(options)}`;

            // Check cache first
            if (options.useCache !== false) {
                const cached = this.getFromCache(cacheKey);
                if (cached) return cached as T[];
            }

            // Use real API client
            const endpoint = this.getEntityEndpoint(entityType);
            const response = await realApiClient.request<Array<T>>(endpoint);
            const transformed = response.data || [];

            // Cache result
            if (options.useCache !== false) {
                this.setCache(cacheKey, transformed, options.cacheTTL || 300000); // 5 minutes default
            }

            return transformed;
        }, options);
    }

    async get<T>(entityType: EntityType, id: string, options: GetOptions = {}): Promise<T> {
        return this.interceptor.intercept(async () => {
            const cacheKey = `get_${entityType}_${id}`;

            // Check cache first
            if (options.useCache !== false) {
                const cached = this.getFromCache(cacheKey);
                if (cached) return cached as T;
            }

            // Use real API client
            const endpoint = this.getEntityEndpoint(entityType);
            const response = await realApiClient.request<T>(`${endpoint}/${id}`);
            const transformed = response.data;

            // Cache result
            if (options.useCache !== false) {
                this.setCache(cacheKey, transformed, options.cacheTTL || 300000);
            }

            return transformed;
        }, options);
    }

    async create<T>(entityType: EntityType, data: unknown, options: RequestOptions = {}): Promise<T> {
        return this.interceptor.intercept(async () => {
            // Use real API client
            const endpoint = this.getEntityEndpoint(entityType);
            const response = await realApiClient.request<T>(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            const transformed = response.data;

            // Invalidate related caches
            this.invalidateCache(`list_${entityType}`);

            return transformed;
        }, options);
    }

    async update<T>(entityType: EntityType, id: string, data: unknown, options: RequestOptions = {}): Promise<T> {
        return this.interceptor.intercept(async () => {
            // Use real API client
            const endpoint = this.getEntityEndpoint(entityType);
            const response = await realApiClient.request<T>(`${endpoint}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            const transformed = response.data;

            // Invalidate related caches
            this.invalidateCache(`list_${entityType}`);
            this.invalidateCache(`get_${entityType}_${id}`);

            return transformed;
        }, options);
    }

    async delete(entityType: EntityType, id: string, options: RequestOptions = {}): Promise<unknown> {
        return this.interceptor.intercept(async () => {
            // Use real API client
            const endpoint = this.getEntityEndpoint(entityType);
            const response = await realApiClient.request<unknown>(`${endpoint}/${id}`, {
                method: 'DELETE'
            });

            // Invalidate related caches
            this.invalidateCache(`list_${entityType}`);
            this.invalidateCache(`get_${entityType}_${id}`);

            return response.data;
        }, options);
    }

    // Batch operations for improved performance
    async batchOperation(operations: BatchOperation[], options: RequestOptions = {}): Promise<BatchResult[]> {
        return this.interceptor.intercept(async () => {
            const results = await Promise.allSettled(
                operations.map(op => this.executeOperation(op))
            );

            return results.map((result, index) => ({
                operation: operations[index] || { type: 'unknown', data: null },
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason as Error : null
            }));
        }, options);
    }

    private async executeOperation(operation: BatchOperation): Promise<unknown> {
        const { type, entityType, ...params } = operation;

        switch (type) {
            case 'list':
                return this.list(entityType, params.options as ListOptions);
            case 'get':
                return this.get(entityType, params.id as string, params.options as GetOptions);
            case 'create':
                return this.create(entityType, params.data, params.options as RequestOptions);
            case 'update':
                return this.update(entityType, params.id as string, params.data, params.options as RequestOptions);
            case 'delete':
                return this.delete(entityType, params.id as string, params.options as RequestOptions);
            default:
                throw new Error(`Unknown operation type: ${type as string}`);
        }
    }

    // Cache management
    private getFromCache(key: string): unknown {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    private setCache(key: string, data: unknown, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
    }

    invalidateCache(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    clearCache(): void {
        this.cache.clear();
    }

    // Health check
    async healthCheck(): Promise<HealthCheckResult> {
        try {
            const startTime = Date.now();
            // Use real API client for health check
            const response = await realApiClient.request<{ status: string }>('/health');
            const responseTime = Date.now() - startTime;

            return {
                status: response.data?.status === 'healthy' ? 'healthy' : 'unhealthy',
                responseTime,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: (error as Error).message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Create singleton instance
export const apiClient = new EnhancedApiClient();

// Export convenience methods
export const api = {
    // Patient operations
    patients: {
        list: (options?: ListOptions) => apiClient.list<Patient>('Patient', options),
        get: (id: string, options?: GetOptions) => apiClient.get<Patient>('Patient', id, options),
        create: (data: unknown, options?: RequestOptions) => apiClient.create<Patient>('Patient', data, options),
        update: (id: string, data: unknown, options?: RequestOptions) => apiClient.update<Patient>('Patient', id, data, options),
        delete: (id: string, options?: RequestOptions) => apiClient.delete('Patient', id, options)
    },

    // Appointment operations
    appointments: {
        list: (options?: ListOptions) => apiClient.list<Appointment>('Appointment', options),
        get: (id: string, options?: GetOptions) => apiClient.get<Appointment>('Appointment', id, options),
        create: (data: unknown, options?: RequestOptions) => apiClient.create<Appointment>('Appointment', data, options),
        update: (id: string, data: unknown, options?: RequestOptions) => apiClient.update<Appointment>('Appointment', id, data, options),
        delete: (id: string, options?: RequestOptions) => apiClient.delete('Appointment', id, options)
    },

    // User operations
    users: {
        list: (options?: ListOptions) => apiClient.list<User>('User', options),
        get: (id: string, options?: GetOptions) => apiClient.get<User>('User', id, options),
        create: (data: unknown, options?: RequestOptions) => apiClient.create<User>('User', data, options),
        update: (id: string, data: unknown, options?: RequestOptions) => apiClient.update<User>('User', id, data, options),
        delete: (id: string, options?: RequestOptions) => apiClient.delete('User', id, options)
    },

    // Organization operations
    organizations: {
        list: (options?: ListOptions) => apiClient.list<Organization>('Organization', options),
        get: (id: string, options?: GetOptions) => apiClient.get<Organization>('Organization', id, options),
        create: (data: unknown, options?: RequestOptions) => apiClient.create<Organization>('Organization', data, options),
        update: (id: string, data: unknown, options?: RequestOptions) => apiClient.update<Organization>('Organization', id, data, options),
        delete: (id: string, options?: RequestOptions) => apiClient.delete('Organization', id, options)
    },

    // Batch operations
    batch: (operations: BatchOperation[], options?: RequestOptions) => apiClient.batchOperation(operations, options),

    // Health check
    health: () => apiClient.healthCheck(),

    // Cache management
    cache: {
        clear: () => apiClient.clearCache(),
        invalidate: (pattern: string) => apiClient.invalidateCache(pattern)
    }
};

export default apiClient;
