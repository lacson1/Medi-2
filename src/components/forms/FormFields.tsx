/**
 * Standardized form field components using react-hook-form
 * Provides consistent form field handling across the application
 */

import React from 'react';
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface BaseFieldProps<T extends FieldValues> {
    name: FieldPath<T>;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    helpText?: string;
}

interface InputFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local';
}

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    rows?: number;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    options: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface CheckboxFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    text?: string;
}

interface SwitchFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
    text?: string;
}

// Generic field wrapper with error handling
function FieldWrapper<T extends FieldValues>({
    name,
    label,
    required,
    children,
    className,
    helpText,
}: {
    name: FieldPath<T>;
    label?: string | undefined;
    required?: boolean | undefined;
    children: React.ReactNode;
    className?: string | undefined;
    helpText?: string | undefined;
}) {
    const { formState: { errors } } = useFormContext<T>();
    const error = errors[name];
    const errorMessage = error?.message as string | undefined;

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
                    {label}
                </Label>
            )}
            {children}
            {helpText && !errorMessage && (
                <p className="text-sm text-muted-foreground">{helpText}</p>
            )}
            {errorMessage && (
                <p className="text-sm text-red-600" role="alert">{errorMessage}</p>
            )}
        </div>
    );
}

// Input field component
export function InputField<T extends FieldValues>({
    name,
    label,
    placeholder,
    required,
    disabled,
    className,
    helpText,
    type = 'text',
}: InputFieldProps<T>) {
    return (
        <Controller
            name={name}
            render={({ field }) => {
                const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                    if (type === 'number') {
                        const value = event.target.value;
                        field.onChange(value === '' ? undefined : Number(value));
                    } else {
                        field.onChange(event);
                    }
                };

                const inputValue = field.value ?? (type === 'number' ? '' : '');

                return (
                    <FieldWrapper name={name} label={label} required={required} className={className} helpText={helpText}>
                        <Input
                            {...field}
                            id={name}
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={cn('w-full', className)}
                            onChange={handleChange}
                            value={inputValue}
                        />
                    </FieldWrapper>
                );
            }}
        />
    );
}

// Textarea field component
export function TextareaField<T extends FieldValues>({
    name,
    label,
    placeholder,
    required,
    disabled,
    className,
    helpText,
    rows = 3,
}: TextareaFieldProps<T>) {
    return (
        <Controller
            name={name}
            render={({ field }) => (
                <FieldWrapper name={name} label={label} required={required} className={className} helpText={helpText}>
                    <Textarea
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={rows}
                        className={cn('w-full', className)}
                    />
                </FieldWrapper>
            )}
        />
    );
}

// Select field component
export function SelectField<T extends FieldValues>({
    name,
    label,
    placeholder,
    required,
    disabled,
    className,
    helpText,
    options,
}: SelectFieldProps<T>) {
    return (
        <Controller
            name={name}
            render={({ field }) => (
                <FieldWrapper name={name} label={label} required={required} className={className} helpText={helpText}>
                    <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={disabled || false}
                    >
                        <SelectTrigger className={cn('w-full', className)}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option: any) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled || false}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FieldWrapper>
            )}
        />
    );
}

// Checkbox field component
export function CheckboxField<T extends FieldValues>({
    name,
    label,
    text,
    required,
    disabled,
    className,
    helpText,
}: CheckboxFieldProps<T>) {
    return (
        <Controller
            name={name}
            render={({ field }) => (
                <FieldWrapper name={name} label={label} required={required} className={className} helpText={helpText}>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={name}
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            disabled={disabled}
                        />
                        {(text || label) && (
                            <Label htmlFor={name} className="text-sm font-normal">
                                {text || label}
                            </Label>
                        )}
                    </div>
                </FieldWrapper>
            )}
        />
    );
}

// Switch field component
export function SwitchField<T extends FieldValues>({
    name,
    label,
    text,
    required,
    disabled,
    className,
    helpText,
}: SwitchFieldProps<T>) {
    return (
        <Controller
            name={name}
            render={({ field }) => (
                <FieldWrapper name={name} label={label} required={required} className={className} helpText={helpText}>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={name}
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            disabled={disabled}
                        />
                        {(text || label) && (
                            <Label htmlFor={name} className="text-sm font-normal">
                                {text || label}
                            </Label>
                        )}
                    </div>
                </FieldWrapper>
            )}
        />
    );
}

// Form wrapper component
interface FormProps<T extends FieldValues> {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
    children: React.ReactNode;
    className?: string;
}

export function Form<T extends FieldValues>({
    onSubmit,
    children,
    className,
}: FormProps<T>) {
    return (
        <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
            {children}
        </form>
    );
}

export default {
    InputField,
    TextareaField,
    SelectField,
    CheckboxField,
    SwitchField,
    Form,
};
