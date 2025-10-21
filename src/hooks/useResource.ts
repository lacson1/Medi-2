/**
 * Generic Resource Hooks
 * Provides React Query hooks for CRUD operations on any resource
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unifiedApiClient, ListParams, ApiResponse, PaginatedResponse } from '@/api/unifiedApiClient';

// Generic resource hook
export function useResource<T>(resource: string, id?: string) {
    const queryClient = useQueryClient();

    // List query
    const listQuery = useQuery({
        queryKey: [resource],
        queryFn: () => unifiedApiClient.list<T>(resource),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Single item query
    const itemQuery = useQuery({
        queryKey: [resource, id],
        queryFn: () => unifiedApiClient.get<T>(resource, id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: Partial<T>) => unifiedApiClient.create<T>(resource, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
            unifiedApiClient.update<T>(resource, id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: [resource] });
            queryClient.invalidateQueries({ queryKey: [resource, id] });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => unifiedApiClient.delete(resource, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });

    return {
        list: listQuery,
        item: itemQuery,
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        isLoading: listQuery.isLoading || itemQuery.isLoading,
        error: listQuery.error || itemQuery.error,
    };
}

// Hook for listing resources with parameters
export function useResourceList<T>(
    resource: string,
    params?: ListParams,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: [resource, 'list', params],
        queryFn: () => unifiedApiClient.list<T>(resource, params),
        enabled: options?.enabled !== false,
        staleTime: options?.staleTime || 5 * 60 * 1000,
    });
}

// Hook for getting a single resource
export function useResourceItem<T>(
    resource: string,
    id: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: [resource, id],
        queryFn: () => unifiedApiClient.get<T>(resource, id),
        enabled: options?.enabled !== false && !!id,
        staleTime: options?.staleTime || 2 * 60 * 1000,
    });
}

// Hook for searching resources
export function useResourceSearch<T>(
    resource: string,
    query: string,
    filters?: Record<string, string | number | boolean>,
    options?: {
        enabled?: boolean;
        staleTime?: number;
    }
) {
    return useQuery({
        queryKey: [resource, 'search', query, filters],
        queryFn: () => unifiedApiClient.search<T>(resource, query, filters),
        enabled: options?.enabled !== false && !!query,
        staleTime: options?.staleTime || 2 * 60 * 1000,
    });
}

// Hook for CRUD mutations
export function useResourceMutations<T>(resource: string) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: Partial<T>) => unifiedApiClient.create<T>(resource, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
            unifiedApiClient.update<T>(resource, id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: [resource] });
            queryClient.invalidateQueries({ queryKey: [resource, id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => unifiedApiClient.delete(resource, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: (updates: Array<{ id: string; data: Partial<T> }>) =>
            unifiedApiClient.bulkUpdate<T>(resource, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        bulkUpdate: bulkUpdateMutation,
    };
}

// Specialized hooks for common resources
export function usePatients() {
    return useResource('patients');
}

export function useAppointments() {
    return useResource('appointments');
}

export function usePrescriptions() {
    return useResource('prescriptions');
}

export function useLabOrders() {
    return useResource('lab-orders');
}

export function useUsers() {
    return useResource('users');
}

export function useOrganizations() {
    return useResource('organizations');
}

export function useBilling() {
    return useResource('billing');
}

export function useEncounters() {
    return useResource('encounters');
}

// Hook for patient-specific data
export function usePatientData(patientId: string) {
    const patientQuery = useResourceItem('patients', patientId);
    const appointmentsQuery = useResourceList('appointments', { patient_id: patientId });
    const prescriptionsQuery = useResourceList('prescriptions', { patient_id: patientId });
    const labOrdersQuery = useResourceList('lab-orders', { patient_id: patientId });
    const encountersQuery = useResourceList('encounters', { patient_id: patientId });

    return {
        patient: patientQuery,
        appointments: appointmentsQuery,
        prescriptions: prescriptionsQuery,
        labOrders: labOrdersQuery,
        encounters: encountersQuery,
        isLoading: patientQuery.isLoading || appointmentsQuery.isLoading ||
            prescriptionsQuery.isLoading || labOrdersQuery.isLoading ||
            encountersQuery.isLoading,
        error: patientQuery.error || appointmentsQuery.error ||
            prescriptionsQuery.error || labOrdersQuery.error ||
            encountersQuery.error,
    };
}

// Hook for dashboard data
export function useDashboardData() {
    const patientsQuery = useResourceList('patients', { limit: 10 });
    const appointmentsQuery = useResourceList('appointments', { limit: 10 });
    const prescriptionsQuery = useResourceList('prescriptions', { limit: 10 });
    const labOrdersQuery = useResourceList('lab-orders', { limit: 10 });

    return {
        patients: patientsQuery,
        appointments: appointmentsQuery,
        prescriptions: prescriptionsQuery,
        labOrders: labOrdersQuery,
        isLoading: patientsQuery.isLoading || appointmentsQuery.isLoading ||
            prescriptionsQuery.isLoading || labOrdersQuery.isLoading,
        error: patientsQuery.error || appointmentsQuery.error ||
            prescriptionsQuery.error || labOrdersQuery.error,
    };
}

// Hook for file uploads
export function useFileUpload(resource: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ file, additionalData }: { file: File; additionalData?: Record<string, unknown> }) =>
            unifiedApiClient.upload(resource, file, additionalData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [resource] });
        },
    });
}

// Hook for file downloads
export function useFileDownload(resource: string) {
    return useMutation({
        mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
            unifiedApiClient.download(resource, id, filename),
    });
}

// Hook for resource statistics
export function useResourceStats(resource: string) {
    return useQuery({
        queryKey: [resource, 'stats'],
        queryFn: () => unifiedApiClient.getStats(resource),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
