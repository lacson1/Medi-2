import React from 'react';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Focus trap component for modals and dialogs
export const FocusTrap = ({ children, className, ...props }: FocusTrapProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            (lastElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            (firstElement as HTMLElement)?.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    (firstElement as HTMLElement)?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn(className)} {...props}>
      {children}
    </div>
  );
};

interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

// Skip link component for keyboard navigation
export const SkipLink = ({ href, children = 'Skip to main content', className }: SkipLinkProps) => (
  <a
    href={href}
    className={cn(
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
      'bg-primary text-primary-foreground px-4 py-2 rounded-md',
      'z-50 focus:outline-none focus:ring-2 focus:ring-ring',
      className
    )}
  >
    {children}
  </a>
);

interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
}

// Screen reader only text
export const SrOnly = ({ children, className }: SrOnlyProps) => (
  <span className={cn('sr-only', className)}>
    {children}
  </span>
);

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  [key: string]: unknown;
}

// Accessible button with proper ARIA attributes
export const AccessibleButton = ({
  children,
  onClick,
  disabled,
  loading,
  ariaLabel,
  ariaDescribedBy,
  className,
  ...props
}: AccessibleButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    aria-disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    {...props}
  >
    {loading && (
      <>
        <SrOnly>{"Loading"}</SrOnly>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      </>
    )}
    {children}
  </button>
);

interface AccessibleFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
  description?: string;
  className?: string;
}

// Accessible form field wrapper
export const AccessibleField = ({
  label,
  error,
  required,
  children,
  id,
  description,
  className
}: AccessibleFieldProps) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {React.cloneElement(children as React.ReactElement, {
        id: fieldId,
        'aria-describedby': [
          description && descriptionId,
          error && errorId
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? 'true' : 'false',
        'aria-required': required
      })}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleTableProps {
  caption?: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Accessible table component
export const AccessibleTable = ({
  caption,
  children,
  className,
  ...props
}: AccessibleTableProps) => (
  <div className="overflow-x-auto">
    <table
      className={cn('w-full caption-bottom text-sm', className)}
      role="table"
      {...props}
    >
      {caption && (
        <caption className="mt-4 text-sm text-muted-foreground">
          {caption}
        </caption>
      )}
      {children}
    </table>
  </div>
);

interface AccessibleNavProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  ariaLabel?: string;
  [key: string]: unknown;
}

// Accessible navigation component
export const AccessibleNav = ({
  children,
  className,
  role = 'navigation',
  ariaLabel,
  ...props
}: AccessibleNavProps) => (
  <nav
    role={role}
    aria-label={ariaLabel}
    className={cn(className)}
    {...props}
  >
    {children}
  </nav>
);

interface AccessibleListProps {
  children: React.ReactNode;
  className?: string;
  role?: string;
  [key: string]: unknown;
}

// Accessible list component
export const AccessibleList = ({
  children,
  className,
  role = 'list',
  ...props
}: AccessibleListProps) => (
  <ul
    role={role}
    className={cn('space-y-2', className)}
    {...props}
  >
    {children}
  </ul>
);

interface AccessibleListItemProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Accessible list item component
export const AccessibleListItem = ({
  children,
  className,
  ...props
}: AccessibleListItemProps) => (
  <li
    role="listitem"
    className={cn(className)}
    {...props}
  >
    {children}
  </li>
);

// Keyboard navigation hook
export const useKeyboardNavigation = (items: unknown[], onSelect: (item: unknown) => void) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
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
        if (activeIndex >= 0 && onSelect) {
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
    setActiveIndex,
    handleKeyDown
  };
};

// Announce changes to screen readers
export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = React.useState('');

  const announce = React.useCallback((message: string) => {
    setAnnouncement(message);
    // Clear announcement after screen reader has time to read it
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const AnnouncementRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return { announce, AnnouncementRegion };
};

export default FocusTrap;
