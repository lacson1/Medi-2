/**
 * Enhanced React Query hooks for API integration
 * Provides consistent data fetching patterns with error handling and caching
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api/apiClient';
import { ErrorLogger } from '@/lib/monitoring';
import type {
    Patient,
    Appointment,
    User,
    Organization,
    ListOptions,
    GetOptions,
    EntityType,
    BatchOperation
} from '@/types';

// Default query options
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

// Enhanced error handler for mutations
const handleMutationError = (error: Error, toast: any): void => {
    // Log error for monitoring
    ErrorLogger.log(error, {
        tags: {
            type: 'mutation_error',
            component: 'api_hooks'
        }
    });

    // Show user-friendly error message
    toast({
        title: "Operation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
    });
};

// Patient hooks
export const usePatients = (options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['patients', options],
        queryFn: () => api.patients.list(options),
        ...defaultQueryOptions,
        ...options
    });
};

export const usePatient = (id: string, options: GetOptions = {}) => {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => api.patients.get(id, options),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options
    });
};

export const useCreatePatient = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (data: unknown) => api.patients.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: "Patient Created",
                description: "Patient has been successfully created.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => api.patients.update(id, data),
        onSuccess: (_data: Patient, variables: { id: string; data: unknown }) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
            toast({
                title: "Patient Updated",
                description: "Patient information has been successfully updated.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useDeletePatient = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (id: string) => api.patients.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            toast({
                title: "Patient Deleted",
                description: "Patient has been successfully deleted.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

// Appointment hooks
export const useAppointments = (options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['appointments', options],
        queryFn: () => api.appointments.list(options),
        ...defaultQueryOptions,
        ...options
    });
};

export const useAppointment = (id: string, options: GetOptions = {}) => {
    return useQuery({
        queryKey: ['appointment', id],
        queryFn: () => api.appointments.get(id, options),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (data: unknown) => api.appointments.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast({
                title: "Appointment Scheduled",
                description: "Appointment has been successfully scheduled.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => api.appointments.update(id, data),
        onSuccess: (_data: Appointment, variables: { id: string; data: unknown }) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
            toast({
                title: "Appointment Updated",
                description: "Appointment has been successfully updated.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useDeleteAppointment = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (id: string) => api.appointments.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast({
                title: "Appointment Cancelled",
                description: "Appointment has been successfully cancelled.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

// User hooks
export const useUsers = (options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['users', options],
        queryFn: () => api.users.list(options),
        ...defaultQueryOptions,
        ...options
    });
};

export const useUser = (id: string, options: GetOptions = {}) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => api.users.get(id, options),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (data: unknown) => api.users.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: "User Created",
                description: "User account has been successfully created.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => api.users.update(id, data),
        onSuccess: (_data: User, variables: { id: string; data: unknown }) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
            toast({
                title: "User Updated",
                description: "User information has been successfully updated.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (id: string) => api.users.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast({
                title: "User Deleted",
                description: "User account has been successfully deleted.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

// Organization hooks
export const useOrganizations = (options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['organizations', options],
        queryFn: () => api.organizations.list(options),
        ...defaultQueryOptions,
        ...options
    });
};

export const useOrganization = (id: string, options: GetOptions = {}) => {
    return useQuery({
        queryKey: ['organization', id],
        queryFn: () => api.organizations.get(id, options),
        enabled: !!id,
        ...defaultQueryOptions,
        ...options
    });
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (data: unknown) => api.organizations.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast({
                title: "Organization Created",
                description: "Organization has been successfully created.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => api.organizations.update(id, data),
        onSuccess: (_data: Organization, variables: { id: string; data: unknown }) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
            toast({
                title: "Organization Updated",
                description: "Organization information has been successfully updated.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

export const useDeleteOrganization = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: (id: string) => api.organizations.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast({
                title: "Organization Deleted",
                description: "Organization has been successfully deleted.",
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

// Batch operations hook
export const useBatchOperation = () => {
    const queryClient = useQueryClient();
    const toast = (options: { title: string; description: string; variant?: string; duration?: number }) =>
        console.log('Toast:', options);

    return useMutation({
        mutationFn: ({ operations, options }: { operations: BatchOperation[]; options?: any }) => api.batch(operations, options),
        onSuccess: (results: any) => {
            // Invalidate all related queries
            const entityTypes = [...new Set(results.map((r: any) => r.operation.entityType))];
            entityTypes.forEach((entityType: unknown) => {
                queryClient.invalidateQueries({ queryKey: [(entityType as EntityType).toLowerCase() + 's'] });
            });

            const successCount = results.filter((r: any) => r.success).length;
            const totalCount = results.length;

            toast({
                title: "Batch Operation Completed",
                description: `${successCount} of ${totalCount} operations completed successfully.`,
                duration: 3000,
            });
        },
        onError: (error: Error) => handleMutationError(error, toast)
    });
};

// Infinite query hooks for pagination
export const useInfinitePatients = (options: ListOptions = {}) => {
    return useInfiniteQuery<Patient[], Error>({
        queryKey: ['patients', 'infinite', options],
        queryFn: ({ pageParam = 1 }: { pageParam?: unknown }) => api.patients.list({
            ...options,
            page: pageParam as number,
            limit: options.limit || 20
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: Patient[], pages: Patient[][]) => {
            // Assuming API returns pagination info
            if (lastPage.length < (options.limit || 20)) return undefined;
            return pages.length + 1;
        },
        ...defaultQueryOptions,
        ...options
    });
};

export const useInfiniteAppointments = (options: ListOptions = {}) => {
    return useInfiniteQuery<Appointment[], Error>({
        queryKey: ['appointments', 'infinite', options],
        queryFn: ({ pageParam = 1 }: { pageParam?: unknown }) => api.appointments.list({
            ...options,
            page: pageParam as number,
            limit: options.limit || 20
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: Appointment[], pages: Appointment[][]) => {
            if (lastPage.length < (options.limit || 20)) return undefined;
            return pages.length + 1;
        },
        ...defaultQueryOptions,
        ...options
    });
};

// Health check hook
export const useApiHealth = (options: any = {}) => {
    return useQuery({
        queryKey: ['api-health'],
        queryFn: () => api.health(),
        refetchInterval: 30000, // Check every 30 seconds
        ...defaultQueryOptions,
        ...options
    });
};

// Search hooks with debouncing
export const useSearchPatients = (searchTerm: string, options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['patients', 'search', searchTerm],
        queryFn: () => api.patients.list({
            ...options,
            search: searchTerm
        }),
        enabled: !!searchTerm && searchTerm.length >= 2,
        ...defaultQueryOptions,
        ...options
    });
};

export const useSearchAppointments = (searchTerm: string, options: ListOptions = {}) => {
    return useQuery({
        queryKey: ['appointments', 'search', searchTerm],
        queryFn: () => api.appointments.list({
            ...options,
            search: searchTerm
        }),
        enabled: !!searchTerm && searchTerm.length >= 2,
        ...defaultQueryOptions,
        ...options
    });
};

// Cache management hooks
export const useCacheManagement = () => {
    const queryClient = useQueryClient();

    const clearAllCache = (): void => {
        queryClient.clear();
        api.cache.clear();
    };

    const invalidateEntityCache = (entityType: EntityType): void => {
        queryClient.invalidateQueries({ queryKey: [entityType.toLowerCase() + 's'] });
        api.cache.invalidate(entityType.toLowerCase());
    };

    const prefetchEntity = async (entityType: EntityType, id: string): Promise<void> => {
        const entityKey = entityType.toLowerCase() + 's';
        const entityApi = (api as unknown as Record<string, { get: (id: string) => Promise<unknown> }>)[entityKey];
        if (entityApi) {
            await queryClient.prefetchQuery({
                queryKey: [entityType.toLowerCase(), id],
                queryFn: () => entityApi.get(id)
            });
        }
    };

    return {
        clearAllCache,
        invalidateEntityCache,
        prefetchEntity
    };
};

export default {
    // Patient hooks
    usePatients,
    usePatient,
    useCreatePatient,
    useUpdatePatient,
    useDeletePatient,

    // Appointment hooks
    useAppointments,
    useAppointment,
    useCreateAppointment,
    useUpdateAppointment,
    useDeleteAppointment,

    // User hooks
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,

    // Organization hooks
    useOrganizations,
    useOrganization,
    useCreateOrganization,
    useUpdateOrganization,
    useDeleteOrganization,

    // Utility hooks
    useBatchOperation,
    useInfinitePatients,
    useInfiniteAppointments,
    useApiHealth,
    useSearchPatients,
    useSearchAppointments,
    useCacheManagement
};