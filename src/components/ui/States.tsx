/**
 * Standardized UI states and components for Bluequee2
 * Provides consistent loading states, empty states, and user feedback
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2, 
  FileX, 
  Users, 
  Calendar, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Loading skeleton components
export const LoadingSkeleton = {
  // Card skeleton
  Card: ({ className = '' }) => (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  ),
  
  // List skeleton
  List: ({ count = 5, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  ),
  
  // Table skeleton
  Table: ({ rows = 5, columns = 4, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  ),
  
  // Chart skeleton
  Chart: ({ className = '' }) => (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-64 w-full" />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  ),
  
  // Form skeleton
  Form: ({ fields = 4, className = '' }) => (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
};

// Loading spinner component
export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ 
  loading, 
  children, 
  text = 'Loading...',
  className = '' 
}) => {
  if (!loading) return children;
  
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingSpinner text={text} />
      </div>
    </div>
  );
};

// Empty state components
export const EmptyState = {
  // Generic empty state
  Generic: ({ 
    icon: Icon = FileX, 
    title = 'No data found', 
    description = 'There are no items to display at this time.',
    action,
    className = '' 
  }) => (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
      {action && action}
    </div>
  ),
  
  // Patients empty state
  Patients: ({ onAddPatient, className = '' }) => (
    <EmptyState.Generic
      icon={"Users"}
      title="No patients found"
      description="Get started by adding your first patient to the system."
      action={
        <Button onClick={onAddPatient} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      }
      className={className}
    />
  ),
  
  // Appointments empty state
  Appointments: ({ onScheduleAppointment, className = '' }) => (
    <EmptyState.Generic
      icon={"Calendar"}
      title="No appointments scheduled"
      description="Schedule appointments to manage your patient visits."
      action={
        <Button onClick={onScheduleAppointment} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      }
      className={className}
    />
  ),
  
  // Search empty state
  Search: ({ query, onClearSearch, className = '' }) => (
    <EmptyState.Generic
      icon={"Search"}
      title={`No results for "${query}"`}
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={
        <Button variant="outline" onClick={onClearSearch}>
          Clear Search
        </Button>
      }
      className={className}
    />
  ),
  
  // Error empty state
  Error: ({ 
    title = 'Something went wrong', 
    description = 'We encountered an error while loading the data.',
    onRetry,
    className = '' 
  }) => (
    <EmptyState.Generic
      icon={"AlertCircle"}
      title={title}
      description={description}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry} className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )
      }
      className={className}
    />
  )
};

// Error state component
export const ErrorState = ({ 
  error, 
  onRetry, 
  title = 'Error',
  showDetails = false,
  className = '' 
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">{errorMessage}</p>
      
      {showDetails && error?.stack && (
        <details className="mb-6 max-w-md">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            Show technical details
          </summary>
          <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

// Success state component
export const SuccessState = ({ 
  title = 'Success!', 
  description, 
  action,
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
    )}
    {action && action}
  </div>
);

// Data table empty state
export const TableEmptyState = ({ 
  columns, 
  onAdd,
  addLabel = 'Add Item',
  className = '' 
}) => (
  <tr>
    <td colSpan={columns} className="px-6 py-12">
      <EmptyState.Generic
        title="No data available"
        description="There are no items to display in this table."
        action={
          onAdd && (
            <Button onClick={onAdd} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {addLabel}
            </Button>
          )
        }
        className={className}
      />
    </td>
  </tr>
);

// Loading table row
export const LoadingTableRow = ({ columns, className = '' }: any) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Status indicators
export const StatusIndicator = ({ 
  status, 
  size = 'sm',
  showText = true,
  className = '' 
}) => {
  const statusConfig = {
    active: { color: 'bg-green-500', text: 'Active' },
    inactive: { color: 'bg-gray-500', text: 'Inactive' },
    pending: { color: 'bg-yellow-500', text: 'Pending' },
    completed: { color: 'bg-green-500', text: 'Completed' },
    cancelled: { color: 'bg-red-500', text: 'Cancelled' },
    error: { color: 'bg-red-500', text: 'Error' },
    success: { color: 'bg-green-500', text: 'Success' },
    warning: { color: 'bg-yellow-500', text: 'Warning' },
    info: { color: 'bg-blue-500', text: 'Info' }
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${config.color} ${sizeClasses[size]} rounded-full mr-2`} />
      {showText && <span className="text-sm text-gray-700">{config.text}</span>}
    </div>
  );
};

// Action buttons component
export const ActionButtons = ({ 
  actions = [], 
  size = 'sm',
  className = '' 
}) => {
  if (actions.length === 0) return null;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'outline'}
          size={size}
          onClick={action.onClick}
          disabled={action.disabled}
          className={action.className}
        >
          {action.icon && <action.icon className="w-4 h-4 mr-1" />}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

// Export all components
export default {
  LoadingSkeleton,
  LoadingSpinner,
  LoadingOverlay,
  EmptyState,
  ErrorState,
  SuccessState,
  TableEmptyState,
  LoadingTableRow,
  StatusIndicator,
  ActionButtons
};
