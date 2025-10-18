/**
 * Accessibility utilities and components for Bluequee2
 * Provides comprehensive accessibility support including ARIA attributes, focus management, and screen reader support
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Extend Window interface for screen reader announcements
declare global {
    interface Window {
        announceToScreenReader?: (message: string, priority: 'polite' | 'assertive') => void;
    }
}

interface Announcement {
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
}

// Focus management utilities
export const focusManager = {
    // Store original focus element
    originalFocus: null as HTMLElement | null,

    // Trap focus within an element
    trapFocus(element: HTMLElement, options: { onEscape?: () => void } = {}): () => void {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            }

            if (e.key === 'Escape' && options.onEscape) {
                options.onEscape();
            }
        };

        element.addEventListener('keydown', handleKeyDown);

        // Focus first element
        firstElement?.focus();

        return () => {
            element.removeEventListener('keydown', handleKeyDown);
        };
    },

    // Restore focus to original element
    restoreFocus(): void {
        if (this.originalFocus && typeof this.originalFocus.focus === 'function') {
            this.originalFocus.focus();
            this.originalFocus = null;
        }
    },

    // Store current focus
    storeFocus(): void {
        this.originalFocus = document.activeElement as HTMLElement;
    }
};

// ARIA live region for announcements
interface AriaLiveRegionProps {
    children?: React.ReactNode;
    priority?: 'polite' | 'assertive';
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({ children, priority = 'polite' }) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
        const id = Date.now().toString();
        setAnnouncements(prev => [...prev, { id, message, priority }]);

        // Remove announcement after it's been read
        setTimeout(() => {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        }, 1000);
    }, []);

    useEffect(() => {
        // Expose announce function globally for easy access
        window.announceToScreenReader = announce;

        return () => {
            delete window.announceToScreenReader;
        };
    }, [announce]);

    return (
        <div {...(priority === 'assertive' ? { 'aria-live': 'assertive' as const } : { 'aria-live': 'polite' as const })} aria-atomic="true" className="sr-only">
            {announcements.map(announcement => (
                <div key={announcement.id}>{announcement.message}</div>
            ))}
            {children}
        </div>
    );
};

// Skip to content link
interface SkipToContentProps {
    targetId?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({ targetId = 'main-content' }) => (
    <a
        href={`#${targetId}`}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
        onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById(targetId);
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        }}
    >
        Skip to main content
    </a>
);

// Enhanced button with accessibility features
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    loading?: boolean;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    className?: string;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
    children,
    onClick,
    disabled = false,
    loading = false,
    ariaLabel,
    ariaDescribedBy,
    className = '',
    ...props
}, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled && !loading) {
                setIsPressed(true);
                onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
            }
        }
    }, [onClick, disabled, loading]);

    const handleKeyUp = useCallback(() => {
        setIsPressed(false);
    }, []);

    return (
        <button
            ref={ref}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            {...(isPressed && { 'aria-pressed': 'true' as const })}
            {...((disabled || loading) && { 'aria-disabled': 'true' as const })}
            className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
});

AccessibleButton.displayName = 'AccessibleButton';

// Enhanced input with accessibility features
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    className?: string;
}

export const AccessibleInput = React.forwardRef<HTMLInputElement, AccessibleInputProps>(({
    label,
    error,
    helpText,
    required = false,
    className = '',
    ...props
}, ref) => {
    const id = useRef(`input-${Math.random().toString(36).substr(2, 9)}`).current;
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-label="required"> *</span>}
                </label>
            )}

            <input
                ref={ref}
                id={id}
                {...(error && { 'aria-invalid': 'true' as const })}
                aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
                {...(required && { 'aria-required': 'true' as const })}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300' : 'border-gray-300'
                    } ${className}`}
                {...props}
            />

            {helpText && (
                <p id={helpId} className="text-sm text-gray-500">{helpText}</p>
            )}

            {error && (
                <p id={errorId} className="text-sm text-red-600" role="alert">{error}</p>
            )}
        </div>
    );
});

AccessibleInput.displayName = 'AccessibleInput';

// Modal with accessibility features
interface AccessibleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className = ''
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            focusManager.storeFocus();
            setIsVisible(true);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            // Focus modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
        } else {
            setIsVisible(false);
            document.body.style.overflow = '';
            focusManager.restoreFocus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isVisible) return;

        const modal = modalRef.current;
        if (!modal) return;

        const cleanup = focusManager.trapFocus(modal, {
            onEscape: onClose
        });

        return cleanup;
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>

                <div className="px-6 py-4">{children}</div>
            </div>
        </div>,
        document.body
    );
};

// Form validation interfaces
interface FormValues {
    [key: string]: string | number | boolean;
}

interface FormErrors {
    [key: string]: string | null;
}

interface FormTouched {
    [key: string]: boolean;
}

interface FormValidators {
    [key: string]: (value: string | number | boolean) => string | null;
}

// Form validation with accessibility
export const useAccessibleForm = (initialValues: FormValues = {}) => {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<FormTouched>({});

    const setValue = useCallback((name: string, value: string | number | boolean) => {
        setValues((prev: FormValues) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const setError = useCallback((name: string, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }));

        // Announce error to screen reader
        if (window.announceToScreenReader) {
            window.announceToScreenReader(`Error: ${error}`, 'assertive');
        }
    }, []);

    const setTouchedField = useCallback((name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const validateField = useCallback((name: string, value: string | number | boolean, validator: (value: string | number | boolean) => string | null) => {
        const error = validator(value);
        if (error) {
            setError(name, error);
            return false;
        }
        return true;
    }, [setError]);

    const validateForm = useCallback((validators: FormValidators) => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.keys(validators).forEach(field => {
            const validator = validators[field];
            if (validator) {
                const error = validator(values[field] as string | number | boolean);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);

        if (!isValid && window.announceToScreenReader) {
            const errorCount = Object.keys(newErrors).length;
            window.announceToScreenReader(`Form has ${errorCount} error${errorCount > 1 ? 's' : ''}`, 'assertive');
        }

        return isValid;
    }, [values]);

    return {
        values,
        errors,
        touched,
        setValue,
        setError,
        setTouchedField,
        validateField,
        validateForm
    };
};

// Keyboard navigation hook
interface KeyboardNavigationOptions<T> {
    items: T[];
    onSelect: (item: T) => void;
}

export const useKeyboardNavigation = <T,>({ items, onSelect }: KeyboardNavigationOptions<T>) => {
    const [activeIndex, setActiveIndex] = useState(-1);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev =>
                    prev < items.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev =>
                    prev > 0 ? prev - 1 : items.length - 1
                );
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (activeIndex >= 0 && items[activeIndex]) {
                    onSelect(items[activeIndex]);
                }
                break;
            case 'Escape':
                setActiveIndex(-1);
                break;
        }
    }, [items, activeIndex, onSelect]);

    return {
        activeIndex,
        handleKeyDown,
        setActiveIndex
    };
};

// Screen reader only text
interface ScreenReaderOnlyProps {
    children: React.ReactNode;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => (
    <span className="sr-only">{children}</span>
);

// High contrast mode detection
export const useHighContrastMode = (): boolean => {
    const [isHighContrast, setIsHighContrast] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        setIsHighContrast(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = (): boolean => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
};

// Color scheme detection
export const useColorScheme = (): 'light' | 'dark' => {
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setColorScheme(mediaQuery.matches ? 'dark' : 'light');

        const handleChange = (e: MediaQueryListEvent) => setColorScheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return colorScheme;
};

// Accessibility testing utilities
export const accessibilityTest = {
    // Check if element has proper ARIA attributes
    hasProperAria: (element: HTMLElement): boolean => {
        const hasRole = element.getAttribute('role');
        const hasAriaLabel = element.getAttribute('aria-label');
        const hasAriaLabelledBy = element.getAttribute('aria-labelledby');

        return Boolean(hasRole || hasAriaLabel || hasAriaLabelledBy);
    },

    // Check if form has proper labels
    hasProperLabels: (form: HTMLFormElement): boolean => {
        const inputs = form.querySelectorAll('input, select, textarea');
        return Array.from(inputs).every(input => {
            const id = input.getAttribute('id');
            const label = form.querySelector(`label[for="${id}"]`);
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');

            return Boolean(label || ariaLabel || ariaLabelledBy);
        });
    },

    // Check color contrast ratio
    checkContrast: (foreground: string, background: string): { ratio: number; passes: boolean } => {
        // This would need a proper color contrast calculation library
        // For now, return a placeholder
        // TODO: Implement actual color contrast calculation
        console.log('Checking contrast between', foreground, 'and', background);
        return { ratio: 4.5, passes: true };
    }
};

export default {
    focusManager,
    AriaLiveRegion,
    SkipToContent,
    AccessibleButton,
    AccessibleInput,
    AccessibleModal,
    useAccessibleForm,
    useKeyboardNavigation,
    ScreenReaderOnly,
    useHighContrastMode,
    useReducedMotion,
    useColorScheme,
    accessibilityTest
};
