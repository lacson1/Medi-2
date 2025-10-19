import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Search, Camera, Mic, Upload } from 'lucide-react';

interface MobileFormFieldProps {
    label: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'textarea';
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    autoComplete?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'url' | 'search' | 'decimal';
    className?: string;
}

export const MobileFormField: React.FC<MobileFormFieldProps> = ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    autoComplete,
    inputMode,
    className = ''
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    const handleFocus = () => {
        setIsFocused(true);
        // Prevent zoom on iOS for non-text inputs
        if (type !== 'text' && type !== 'textarea') {
            inputRef.current?.setAttribute('readonly', 'true');
            setTimeout(() => {
                inputRef.current?.removeAttribute('readonly');
            }, 100);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className={`mobile-stack-sm ${className}`}>
            <label className="text-sm font-medium text-foreground">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`
                            w-full px-3 py-3
                            bg-background border rounded-lg
                            text-foreground placeholder-muted-foreground
                            resize-none
                            min-h-[120px]
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                            disabled:opacity-50 disabled:cursor-not-allowed
                            mobile-input
                            ${error ? 'border-red-500' : 'border-border'}
                            ${isFocused ? 'ring-2 ring-primary border-transparent' : ''}
                        `}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type={inputType}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete={autoComplete}
                        inputMode={inputMode}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`
                            w-full px-3 py-3
                            bg-background border rounded-lg
                            text-foreground placeholder-muted-foreground
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                            disabled:opacity-50 disabled:cursor-not-allowed
                            mobile-input
                            ${error ? 'border-red-500' : 'border-border'}
                            ${isFocused ? 'ring-2 ring-primary border-transparent' : ''}
                            ${isPassword ? 'pr-10' : ''}
                        `}
                    />
                )}

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="
                            absolute right-3 top-1/2 -translate-y-1/2
                            p-1 rounded
                            text-muted-foreground hover:text-foreground
                            touch-target
                        "
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

// Mobile Form Component
interface MobileFormProps {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    className?: string;
}

export const MobileForm: React.FC<MobileFormProps> = ({
    children,
    onSubmit,
    className = ''
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className={`mobile-stack ${className}`}
        >
            {children}
        </form>
    );
};

// Mobile Form Actions Component
interface MobileFormActionsProps {
    children: React.ReactNode;
    className?: string;
}

export const MobileFormActions: React.FC<MobileFormActionsProps> = ({
    children,
    className = ''
}) => {
    return (
        <div className={`mobile-stack-sm pt-4 ${className}`}>
            {children}
        </div>
    );
};

// Mobile Button Component
interface MobileButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = true,
    className = ''
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'bg-primary text-primary-foreground hover:bg-primary/90';
            case 'secondary':
                return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
            case 'outline':
                return 'border border-border bg-background hover:bg-muted';
            case 'ghost':
                return 'hover:bg-muted';
            case 'destructive':
                return 'bg-red-600 text-white hover:bg-red-700';
            default:
                return 'bg-primary text-primary-foreground hover:bg-primary/90';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 text-sm min-h-touch';
            case 'md':
                return 'px-4 py-3 text-base min-h-touch';
            case 'lg':
                return 'px-6 py-4 text-lg min-h-touch-lg';
            default:
                return 'px-4 py-3 text-base min-h-touch';
        }
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center
                rounded-lg font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                touch-target
                ${getVariantClasses()}
                ${getSizeClasses()}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
        >
            {loading && (
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};

// Mobile File Upload Component
interface MobileFileUploadProps {
    label: string;
    accept?: string;
    multiple?: boolean;
    onFileSelect: (files: FileList) => void;
    className?: string;
}

export const MobileFileUpload: React.FC<MobileFileUploadProps> = ({
    label,
    accept,
    multiple = false,
    onFileSelect,
    className = ''
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`mobile-stack-sm ${className}`}>
            <label className="text-sm font-medium text-foreground">
                {label}
            </label>

            <button
                type="button"
                onClick={handleClick}
                className="
                    w-full p-4
                    border-2 border-dashed border-border
                    rounded-lg
                    bg-muted/50 hover:bg-muted
                    transition-colors duration-200
                    touch-target
                    flex flex-col items-center justify-center
                    text-muted-foreground hover:text-foreground
                "
            >
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Tap to upload files</span>
                <span className="text-xs mt-1">or drag and drop</span>
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

// Mobile Search Input Component
interface MobileSearchInputProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    className?: string;
}

export const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    onSearch,
    className = ''
}) => {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch();
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
            </div>

            <input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="
                    w-full pl-10 pr-4 py-3
                    bg-background border border-border rounded-lg
                    text-foreground placeholder-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    mobile-input
                "
            />
        </div>
    );
};

export default MobileFormField;
