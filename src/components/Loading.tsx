import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
}

// Base loading spinner component - memoized for performance
export const LoadingSpinner = memo<LoadingSpinnerProps>(({ className, size = 'default' }) => {
  const sizeClasses: Record<string, string> = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )}
    />
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

interface PageLoadingProps {
  message?: string;
}

// Full page loading component
export const PageLoading = ({ message = 'Loading...' }: PageLoadingProps) => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <LoadingSpinner size="xl" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

interface InlineLoadingProps {
  message?: string;
  className?: string;
}

// Inline loading component
export const InlineLoading = ({ message = 'Loading...', className }: InlineLoadingProps) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground">{message}</span>
  </div>
);

// Card loading skeleton
export const CardLoading = () => (
  <div className="rounded-lg border bg-card p-6 space-y-4">
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
      <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded animate-pulse"></div>
      <div className="h-3 bg-muted rounded w-5/6 animate-pulse"></div>
    </div>
  </div>
);

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

// Table loading skeleton
export const TableLoading = ({ rows = 5, columns = 4 }: TableLoadingProps) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-muted rounded animate-pulse flex-1"
            style={{
              width: colIndex === 0 ? '20%' :
                colIndex === columns - 1 ? '15%' : 'auto'
            }}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

interface ButtonLoadingProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
}

// Button loading state
export const ButtonLoading = ({ children, loading, className, ...props }: ButtonLoadingProps) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={cn(
      'inline-flex items-center justify-center',
      className
    )}
  >
    {loading && <LoadingSpinner size="sm" className="mr-2" />}
    {children}
  </button>
);

interface FormLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

// Form loading overlay
export const FormLoading = ({ loading, children }: FormLoadingProps) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Saving...</p>
        </div>
      </div>
    )}
  </div>
);

interface DataLoadingProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  emptyMessage?: string;
}

// Data loading wrapper
export const DataLoading = ({ loading, error, children, emptyMessage = 'No data available' }: DataLoadingProps) => {
  if (loading) {
    return <PageLoading message="Loading data..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-destructive text-center">
          <p className="font-medium">Failed to load data</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!children || (Array.isArray(children) && children.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

// Default Loading component for Suspense fallbacks
const Loading = memo(() => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-sm text-muted-foreground">Loading...</p>
  </div>
));

Loading.displayName = 'Loading';

export default Loading;
