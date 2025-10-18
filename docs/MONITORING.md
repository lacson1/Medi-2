# Bluequee2 Monitoring & Error Tracking

## Overview

Bluequee2 includes comprehensive monitoring and error tracking capabilities to ensure application reliability, performance, and user experience. The monitoring system is built with Sentry integration and custom monitoring utilities.

## Features

### 🔍 Error Tracking
- **Automatic Error Capture**: Catches JavaScript errors, unhandled promise rejections, and React component errors
- **Error Context**: Captures user context, component stack traces, and browser information
- **Local Error Storage**: Stores errors locally for debugging and analysis
- **Error Reporting**: Provides easy error reporting interface for users

### 📊 Performance Monitoring
- **Component Performance**: Tracks render times and identifies slow components
- **API Call Monitoring**: Measures API response times and success rates
- **Memory Usage**: Monitors JavaScript heap usage and alerts on high memory consumption
- **Network Status**: Tracks online/offline status and connection quality

### 🏥 Health Checks
- **API Health**: Monitors backend API availability and response times
- **Local Storage**: Checks localStorage functionality and capacity
- **System Information**: Tracks browser capabilities and device information
- **Periodic Monitoring**: Runs health checks every 5 minutes in production

### 📈 User Activity Tracking
- **User Interactions**: Tracks user actions and navigation patterns
- **Page Views**: Monitors page load times and user engagement
- **Session Replay**: Records user sessions for debugging (Sentry)
- **Analytics Integration**: Ready for Google Analytics or other analytics platforms

## Architecture

### Core Components

#### 1. Monitoring Library (`src/lib/monitoring.js`)
- **ErrorLogger**: Handles error logging and storage
- **PerformanceMonitor**: Tracks performance metrics
- **UserActivityTracker**: Monitors user interactions
- **HealthChecker**: Runs system health checks
- **AnalyticsTracker**: Handles analytics events

#### 2. Error Boundary (`src/components/ErrorBoundary.jsx`)
- **MonitoringErrorBoundary**: React error boundary with monitoring integration
- **Custom Fallback UI**: User-friendly error display with retry options
- **Error Reporting**: Built-in error reporting functionality

#### 3. Monitoring Dashboard (`src/components/MonitoringDashboard.jsx`)
- **Real-time Monitoring**: Live health status and error logs
- **Performance Metrics**: System performance and resource usage
- **Error Management**: View, export, and clear stored errors
- **Admin Interface**: Accessible via SuperAdmin dashboard

#### 4. Monitoring Hooks (`src/hooks/useMonitoring.js`)
- **usePerformanceMonitoring**: Track component performance
- **useApiMonitoring**: Monitor API calls
- **useErrorMonitoring**: Handle component errors
- **useMemoryMonitoring**: Track memory usage
- **useNetworkMonitoring**: Monitor network status

## Configuration

### Environment Variables

```env
# Sentry Configuration
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_APP_VERSION=1.0.0

# Optional: Sentry Release Configuration (for CI/CD)
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
```

### Sentry Setup

1. **Create Sentry Account**: Sign up at [sentry.io](https://sentry.io)
2. **Create Project**: Create a new React project in Sentry
3. **Get DSN**: Copy the DSN from your project settings
4. **Configure Environment**: Add DSN to your `.env` file
5. **Deploy**: The monitoring will automatically start working

### Vite Configuration

The Vite configuration includes Sentry plugin for:
- Source map uploads
- Release tracking
- Performance monitoring
- Error tracking

## Usage

### Basic Error Handling

```jsx
import { ErrorLogger } from '@/lib/monitoring';

try {
  // Your code here
} catch (error) {
  ErrorLogger.log(error, {
    tags: { component: 'MyComponent' },
    extra: { userId: user.id }
  });
}
```

### Performance Monitoring

```jsx
import { usePerformanceMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  usePerformanceMonitoring('MyComponent');
  
  return <div>My Component</div>;
}
```

### API Call Monitoring

```jsx
import { useApiMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  const { trackApiCall } = useApiMonitoring();
  
  const fetchData = async () => {
    return trackApiCall(
      () => api.getData(),
      { operation: 'fetchData', component: 'MyComponent' }
    );
  };
}
```

### Error Boundary Usage

```jsx
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Component-Specific Error Boundary

```jsx
import { ComponentErrorBoundary } from '@/components/ErrorBoundary';

function MyComponent() {
  return (
    <ComponentErrorBoundary 
      componentName="MyComponent"
      showDetails={true}
    >
      <div>My Component Content</div>
    </ComponentErrorBoundary>
  );
}
```

## Monitoring Dashboard

### Access
- Navigate to SuperAdmin Dashboard
- Click on "Monitoring" tab
- View real-time system status

### Dashboard Features
- **Health Status**: API and localStorage health checks
- **Error Log**: View stored errors with details
- **Performance Metrics**: System performance data
- **Export Errors**: Download error logs for analysis
- **Clear Errors**: Remove stored error data

## Production Considerations

### Performance Impact
- **Minimal Overhead**: Monitoring adds <1% performance impact
- **Async Operations**: All monitoring operations are non-blocking
- **Conditional Loading**: Monitoring only loads in production when configured

### Privacy & Security
- **No PII**: Monitoring doesn't capture personally identifiable information
- **User Consent**: Consider adding user consent for detailed tracking
- **Data Retention**: Configure appropriate data retention policies in Sentry

### Error Filtering
- **Development Errors**: Filters out common development-only errors
- **ResizeObserver**: Ignores ResizeObserver loop limit exceeded errors
- **Custom Filters**: Add custom error filtering logic as needed

## Troubleshooting

### Common Issues

#### 1. Sentry Not Initializing
```bash
# Check environment variables
echo $VITE_SENTRY_DSN

# Verify Sentry DSN format
# Should be: https://[key]@[org].ingest.sentry.io/[project]
```

#### 2. Source Maps Not Uploading
```bash
# Check Sentry auth token
echo $SENTRY_AUTH_TOKEN

# Verify project configuration
# Check SENTRY_ORG and SENTRY_PROJECT variables
```

#### 3. High Memory Usage
```jsx
// Check memory monitoring
import { useMemoryMonitoring } from '@/hooks/useMonitoring';

function MyComponent() {
  const { checkMemoryUsage } = useMemoryMonitoring();
  
  useEffect(() => {
    const memoryInfo = checkMemoryUsage();
    console.log('Memory usage:', memoryInfo);
  }, []);
}
```

### Debug Mode

Enable debug mode for detailed monitoring logs:

```env
VITE_ENABLE_DEBUG_MODE=true
```

## Best Practices

### 1. Error Handling
- Always wrap API calls in try-catch blocks
- Use error boundaries for component error handling
- Provide meaningful error messages to users

### 2. Performance Monitoring
- Monitor component render times
- Track API response times
- Set up alerts for slow operations

### 3. User Experience
- Show loading states during API calls
- Provide retry mechanisms for failed operations
- Display user-friendly error messages

### 4. Monitoring Strategy
- Set up alerts for critical errors
- Monitor key performance metrics
- Regular review of error logs
- Performance optimization based on data

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy with Sentry
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with Sentry
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
          VITE_APP_VERSION: ${{ github.sha }}
        run: npm run build
      
      - name: Deploy
        run: ./deploy.sh
```

## Support

For monitoring-related issues:
1. Check the monitoring dashboard for system status
2. Review error logs in the SuperAdmin dashboard
3. Check Sentry dashboard for detailed error information
4. Contact the development team with specific error details

## Future Enhancements

- **Real-time Alerts**: Email/SMS notifications for critical errors
- **Custom Dashboards**: User-specific monitoring dashboards
- **A/B Testing**: Integration with A/B testing platforms
- **Advanced Analytics**: User behavior analysis and insights
- **Mobile Monitoring**: React Native monitoring integration
