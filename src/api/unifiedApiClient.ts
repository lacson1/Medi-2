/**
 * Unified API Client
 * Provides generic CRUD methods for any resource
 */

// Types for API responses
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    timestamp: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp: string;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
    };
    timestamp: string;
}

// Request options
export interface RequestOptions {
    headers?: Record<string, string>;
    signal?: AbortSignal;
}

// Query parameters for list operations
export interface ListParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    [key: string]: any;
}

class UnifiedApiClient {
    private baseURL: string;

    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Get authentication token from localStorage
     */
    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    /**
     * Build URL with query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, any>): string {
        const url = new URL(`${this.baseURL}/${endpoint}`, window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Make HTTP request with error handling
     */
    private async request<T>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = this.getAuthToken();

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders.Authorization = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    success: false,
                    error: {
                        code: 'HTTP_ERROR',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                    },
                    timestamp: new Date().toISOString(),
                }));

                throw new Error(errorData.error?.message || 'Request failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error occurred');
        }
    }

    /**
     * List resources with pagination and filtering
     */
    async list<T>(
        resource: string,
        params?: ListParams,
        options?: RequestOptions
    ): Promise<PaginatedResponse<T>> {
        const url = this.buildURL(resource, params);
        return this.request<PaginatedResponse<T>>(url, {
            method: 'GET',
            signal: options?.signal,
        });
    }

    /**
     * Get single resource by ID
     */
    async get<T>(
        resource: string,
        id: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        const url = this.buildURL(`${resource}/${id}`);
        return this.request<ApiResponse<T>>(url, {
            method: 'GET',
            signal: options?.signal,
        });
    }

    /**
     * Create new resource
     */
    async create<T>(
        resource: string,
        data: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        const url = this.buildURL(resource);
        return this.request<ApiResponse<T>>(url, {
            method: 'POST',
            body: JSON.stringify(data),
            signal: options?.signal,
        });
    }

    /**
     * Update existing resource
     */
    async update<T>(
        resource: string,
        id: string,
        data: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        const url = this.buildURL(`${resource}/${id}`);
        return this.request<ApiResponse<T>>(url, {
            method: 'PUT',
            body: JSON.stringify(data),
            signal: options?.signal,
        });
    }

    /**
     * Delete resource
     */
    async delete(
        resource: string,
        id: string,
        options?: RequestOptions
    ): Promise<ApiResponse<void>> {
        const url = this.buildURL(`${resource}/${id}`);
        return this.request<ApiResponse<void>>(url, {
            method: 'DELETE',
            signal: options?.signal,
        });
    }

    /**
     * Search resources
     */
    async search<T>(
        resource: string,
        query: string,
        filters?: Record<string, any>,
        options?: RequestOptions
    ): Promise<PaginatedResponse<T>> {
        const params = {
            search: query,
            ...filters,
        };
        return this.list<T>(resource, params, options);
    }

    /**
     * Bulk update multiple resources
     */
    async bulkUpdate<T>(
        resource: string,
        updates: Array<{ id: string; data: any }>,
        options?: RequestOptions
    ): Promise<ApiResponse<T[]>> {
        const url = this.buildURL(`${resource}/bulk`);
        return this.request<ApiResponse<T[]>>(url, {
            method: 'PUT',
            body: JSON.stringify({ updates }),
            signal: options?.signal,
        });
    }

    /**
     * Upload file
     */
    async upload(
        resource: string,
        file: File,
        additionalData?: Record<string, any>,
        options?: RequestOptions
    ): Promise<ApiResponse<{ url: string; filename: string }>> {
        const url = this.buildURL(`${resource}/upload`);
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
        }

        const token = this.getAuthToken();
        const headers: Record<string, string> = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers,
            signal: options?.signal,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Download file
     */
    async download(
        resource: string,
        id: string,
        filename?: string,
        options?: RequestOptions
    ): Promise<Blob> {
        const url = this.buildURL(`${resource}/${id}/download`);
        const token = this.getAuthToken();

        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: options?.signal,
        });

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Get resource statistics
     */
    async getStats(
        resource: string,
        options?: RequestOptions
    ): Promise<ApiResponse<Record<string, any>>> {
        const url = this.buildURL(`${resource}/stats`);
        return this.request<ApiResponse<Record<string, any>>>(url, {
            method: 'GET',
            signal: options?.signal,
        });
    }
}

// Create and export singleton instance
export const unifiedApiClient = new UnifiedApiClient();

// Export the class for testing or custom instances
export { UnifiedApiClient };
