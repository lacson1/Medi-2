/**
 * Standardized form hook using react-hook-form + zod validation
 * Provides consistent form handling across the application
 */

import { useForm as useReactHookForm, UseFormProps, FieldValues, Path, FieldError, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

interface UseFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, 'resolver' | 'defaultValues'> {
    schema: z.ZodSchema<T>;
    onSubmit: (data: T) => Promise<void> | void;
    defaultValues?: Partial<T>;
}

interface FormState {
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
}

export function useForm<T extends FieldValues>({
    schema,
    onSubmit,
    defaultValues,
    ...formOptions
}: UseFormOptions<T>) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const form = useReactHookForm<T>({
        resolver: zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<T> | undefined,
        mode: 'onChange',
        ...formOptions,
    });

    const {
        handleSubmit,
        formState: { errors, isDirty, isValid, touchedFields },
        setError,
        clearErrors,
        reset,
        watch,
        getValues,
        setValue,
        trigger,
    } = form;

    // Enhanced submit handler with error handling
    const handleFormSubmit = handleSubmit(async (data: any) => {
        try {
            setIsSubmitting(true);
            setSubmitError(null);
            await onSubmit(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setSubmitError(errorMessage);

            // Set form-level error
            setError('root', {
                type: 'manual',
                message: errorMessage,
            });
        } finally {
            setIsSubmitting(false);
        }
    });

    // Helper to set field error
    const setFieldError = (field: Path<T>, message: string) => {
        setError(field, {
            type: 'manual',
            message,
        });
    };

    // Helper to clear field error
    const clearFieldError = (field: Path<T>) => {
        clearErrors(field);
    };

    // Helper to validate specific field
    const validateField = async (field: Path<T>) => {
        return await trigger(field);
    };

    // Helper to validate all fields
    const validateAll = async () => {
        return await trigger();
    };

    // Helper to reset form with new values
    const resetForm = (values?: T) => {
        reset(values);
        setSubmitError(null);
    };

    // Get field error message
    const getFieldError = (field: Path<T>): string | undefined => {
        const error = errors[field];
        if (error && typeof error === 'object' && 'message' in error) {
            return (error as FieldError).message;
        }
        return undefined;
    };

    // Remove unused function
    // const isFieldTouched = (field: string): boolean => {
    //     return (touchedFields as any)[field] || false;
    // };

    // Get form state
    const formState: FormState = {
        isSubmitting,
        isDirty,
        isValid,
        errors: Object.keys(errors).reduce((acc: any, key) => {
            const error = (errors as any)[key];
            if (error && typeof error === 'object' && 'message' in error) {
                acc[key] = (error as FieldError).message || 'Error';
            }
            return acc;
        }, {} as Record<string, string>),
        touched: Object.keys(touchedFields).reduce((acc: any, key) => {
            acc[key] = (touchedFields as any)[key] || false;
            return acc;
        }, {} as Record<string, boolean>),
    };

    return {
        // Form methods
        handleSubmit: handleFormSubmit,
        reset: resetForm,
        watch,
        getValues,
        setValue,
        trigger,

        // Error handling
        setError: setFieldError,
        clearErrors: clearFieldError,
        getFieldError,
        validateField,
        validateAll,

        // State
        formState,
        submitError,
        setSubmitError,

        // Form instance for advanced usage
        form,
    };
}

export default useForm;
