import React, { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorLogger, UserActivityTracker } from '@/lib/monitoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  showDetails?: boolean;
}

/**
 * Enhanced Error Boundary with monitoring integration
 */
class MonitoringErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context
    const errorContext = {
      tags: {
        type: 'react_error_boundary',
        component: this.props.componentName || 'unknown',
      },
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.fallback ? 'custom' : 'default',
      },
    };

    ErrorLogger.log(error, errorContext);

    // Track user activity
    UserActivityTracker.trackUserAction('error_boundary_triggered', {
      component: this.props.componentName,
      error: error.message,
    });

    this.setState({
      error,
      errorInfo,
      errorId: `error-${Date.now()}`,
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    UserActivityTracker.trackUserAction('error_boundary_retry', {
      component: this.props.componentName,
    });
  };

  handleReportBug = (): void => {
    const errorData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      component: this.props.componentName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy error data to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please share this with the development team.');
      })
      .catch(() => {
        // Fallback: show error data in alert
        alert(`Error details:\n\n${JSON.stringify(errorData, null, 2)}`);
      });

    UserActivityTracker.trackUserAction('error_boundary_report_bug', {
      component: this.props.componentName,
    });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showDetails && (
                <div className="rounded-md bg-gray-100 p-3 text-sm">
                  <p className="font-medium text-gray-900">Error Details:</p>
                  <p className="mt-1 text-gray-700">
                    {this.state.error?.message || 'Unknown error occurred'}
                  </p>
                  {this.state.errorId && (
                    <p className="mt-1 text-xs text-gray-500">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleReportBug}
                  className="w-full"
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for error boundary context
 */
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

/**
 * Higher-order component for error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Partial<ErrorBoundaryProps> = {}
) => {
  const WrappedComponent = (props: P) => (
    <MonitoringErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </MonitoringErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Error boundary for specific components
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  showDetails?: boolean;
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName,
  fallback,
  showDetails = false
}) => (
  <MonitoringErrorBoundary
    componentName={componentName || ''}
    fallback={fallback}
    showDetails={showDetails}
  >
    {children}
  </MonitoringErrorBoundary>
);

export default MonitoringErrorBoundary;