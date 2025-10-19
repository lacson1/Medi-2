# Node.js Development Tools for MediFlow

This document describes the comprehensive Node.js tooling added to enhance the MediFlow frontend development experience.

## Overview

The MediFlow frontend now includes three powerful Node.js tool suites:

1. **Development Tools** (`scripts/dev-tools.js`) - Code generation, analysis, and maintenance utilities
2. **Build Tools** (`scripts/build-tools.js`) - Advanced build automation and optimization
3. **Development Helpers** (`scripts/dev-helpers.js`) - Enhanced development workflow and debugging

## Quick Start

### Basic Development
```bash
# Start development server with enhanced monitoring
npm run dev

# Start with debugging enabled
npm run dev:debug

# Start with mock data
npm run dev:mock

# Watch files and run tests on changes
npm run dev:watch
```

### Code Generation
```bash
# Generate a new React component
npm run generate:component MyComponent

# Generate a new page
npm run generate:page PatientDashboard

# Generate a custom hook
npm run generate:hook usePatientData
```

### Building and Analysis
```bash
# Build for production with analysis
npm run build:analyze

# Build with optimizations
npm run build:optimize

# Generate bundle report
npm run build:report
```

## Development Tools (`dev-tools.js`)

### Code Generation Commands

#### Generate Component
```bash
node scripts/dev-tools.js generate-component <ComponentName> [path]
```
Creates a new React component with:
- TypeScript interface
- Test file
- Index export file
- Tailwind CSS integration

#### Generate Page
```bash
node scripts/dev-tools.js generate-page <PageName> [path]
```
Creates a new page component with:
- Responsive layout
- SEO-friendly structure
- Test file

#### Generate Hook
```bash
node scripts/dev-tools.js generate-hook <HookName> [path]
```
Creates a custom React hook with:
- TypeScript interfaces
- Test file
- Proper hook patterns

### Analysis Commands

#### Bundle Analysis
```bash
node scripts/dev-tools.js analyze-bundle
```
- Builds the application
- Analyzes bundle size
- Shows file size breakdown
- Identifies optimization opportunities

#### Dependency Check
```bash
node scripts/dev-tools.js check-deps
```
- Checks for outdated dependencies
- Shows update recommendations
- Validates package integrity

#### Environment Validation
```bash
node scripts/dev-tools.js validate-env
```
- Validates environment configuration
- Checks for missing variables
- Compares with env.example

### Maintenance Commands

#### Cache Cleaning
```bash
node scripts/dev-tools.js clean-cache
```
Cleans all caches and temporary files:
- node_modules/.cache
- dist folder
- coverage reports
- test artifacts

#### Lint Fixing
```bash
node scripts/dev-tools.js lint-fix
```
- Runs ESLint with auto-fix
- Fixes common code style issues
- Reports unfixable issues

#### Type Checking
```bash
node scripts/dev-tools.js type-check
```
- Runs TypeScript type checking
- Reports type errors
- Validates type safety

## Build Tools (`build-tools.js`)

### Build Commands

#### Standard Build
```bash
node scripts/build-tools.js build [environment]
```
Environments: `development`, `staging`, `production`

#### Build with Analysis
```bash
node scripts/build-tools.js build-analyze [environment]
```
- Builds the application
- Opens bundle analyzer
- Shows detailed bundle breakdown

#### Optimized Build
```bash
node scripts/build-tools.js build-optimize [environment]
```
- Pre-build asset optimization
- Advanced build optimizations
- Post-build enhancements

### Deployment Commands

#### Deployment Check
```bash
node scripts/build-tools.js deploy-check
```
Validates deployment readiness:
- Build artifacts exist
- Required files present
- Configuration valid

#### Preview Build
```bash
node scripts/build-tools.js preview
```
- Starts preview server
- Serves production build
- Enables testing

### Asset Management

#### Generate PWA Manifest
```bash
node scripts/build-tools.js generate-manifest
```
Creates optimized PWA manifest with:
- App metadata
- Icon definitions
- Display settings

#### Optimize Assets
```bash
node scripts/build-tools.js optimize-assets
```
- Compresses images
- Optimizes static files
- Generates optimized versions

#### Generate Sitemap
```bash
node scripts/build-tools.js generate-sitemap
```
Creates SEO-friendly sitemap with:
- All application routes
- Priority settings
- Change frequency

### Analysis Commands

#### Bundle Report
```bash
node scripts/build-tools.js bundle-report
```
Generates detailed bundle analysis:
- File size breakdown
- Asset categorization
- Optimization recommendations

## Development Helpers (`dev-helpers.js`)

### Development Server Commands

#### Enhanced Development Server
```bash
node scripts/dev-helpers.js dev
```
- Starts Vite dev server
- Enables enhanced monitoring
- Provides better error reporting

#### Debug Development Server
```bash
node scripts/dev-helpers.js dev-debug
```
- Enables verbose logging
- Activates debug tools
- Provides detailed error information

#### Mock Data Development
```bash
node scripts/dev-helpers.js dev-mock
```
- Uses mock API data
- Enables offline development
- Provides consistent test data

### Monitoring Commands

#### File Watching
```bash
node scripts/dev-helpers.js watch [command]
```
- Watches source files
- Runs commands on changes
- Provides real-time feedback

#### Application Monitoring
```bash
node scripts/dev-helpers.js monitor
```
Creates monitoring utilities:
- Performance tracking
- Error monitoring
- Memory usage tracking

#### Application Debugging
```bash
node scripts/dev-helpers.js debug
```
- Checks for common issues
- Validates configuration
- Generates debug report

#### Performance Profiling
```bash
node scripts/dev-helpers.js profile
```
Creates profiling utilities:
- Component render timing
- Hook performance tracking
- Async operation profiling

### Environment Commands

#### Health Check
```bash
node scripts/dev-helpers.js check-health
```
Comprehensive health check:
- Dependencies validation
- TypeScript checking
- Linting validation
- Test execution
- Build verification

#### Setup Development Environment
```bash
node scripts/dev-helpers.js setup-dev
```
- Installs dependencies
- Creates environment files
- Runs initial checks
- Provides setup guidance

#### Reset Development Environment
```bash
node scripts/dev-helpers.js reset-dev
```
- Cleans all caches
- Reinstalls dependencies
- Resets to clean state

## Package.json Integration

The new Node.js tools are integrated into the package.json scripts:

### Development Scripts
```json
{
  "dev": "node scripts/dev-helpers.js dev",
  "dev:debug": "node scripts/dev-helpers.js dev-debug",
  "dev:mock": "node scripts/dev-helpers.js dev-mock",
  "dev:watch": "node scripts/dev-helpers.js watch",
  "dev:setup": "node scripts/dev-helpers.js setup-dev",
  "dev:reset": "node scripts/dev-helpers.js reset-dev",
  "dev:health": "node scripts/dev-helpers.js check-health"
}
```

### Build Scripts
```json
{
  "build": "node scripts/build-tools.js build",
  "build:dev": "node scripts/build-tools.js build development",
  "build:staging": "node scripts/build-tools.js build staging",
  "build:prod": "node scripts/build-tools.js build production",
  "build:analyze": "node scripts/build-tools.js build-analyze",
  "build:optimize": "node scripts/build-tools.js build-optimize"
}
```

### Generation Scripts
```json
{
  "generate:component": "node scripts/dev-tools.js generate-component",
  "generate:page": "node scripts/dev-tools.js generate-page",
  "generate:hook": "node scripts/dev-tools.js generate-hook",
  "generate:icons": "node scripts/dev-tools.js generate-icons"
}
```

### Analysis Scripts
```json
{
  "analyze:bundle": "node scripts/dev-tools.js analyze-bundle",
  "analyze:deps": "node scripts/dev-tools.js check-deps",
  "validate:env": "node scripts/dev-tools.js validate-env"
}
```

## Benefits

### Enhanced Development Experience
- **Code Generation**: Quickly scaffold components, pages, and hooks
- **Real-time Monitoring**: Watch files and run commands automatically
- **Debug Tools**: Comprehensive debugging and profiling utilities
- **Health Checks**: Validate development environment integrity

### Improved Build Process
- **Multi-environment Builds**: Support for dev, staging, and production
- **Bundle Analysis**: Detailed analysis and optimization recommendations
- **Asset Optimization**: Automatic asset compression and optimization
- **Deployment Validation**: Ensure deployment readiness

### Better Maintenance
- **Dependency Management**: Check for updates and security issues
- **Cache Management**: Clean caches and temporary files
- **Environment Validation**: Ensure proper configuration
- **Automated Fixes**: Auto-fix common code issues

## Usage Examples

### Daily Development Workflow
```bash
# Start development
npm run dev

# Generate a new component
npm run generate:component PatientCard

# Watch for changes and run tests
npm run dev:watch

# Check application health
npm run dev:health
```

### Pre-deployment Workflow
```bash
# Build with analysis
npm run build:analyze

# Check deployment readiness
npm run build:deploy-check

# Generate reports
npm run build:report
```

### Maintenance Workflow
```bash
# Check for outdated dependencies
npm run analyze:deps

# Clean caches
npm run clean:cache

# Validate environment
npm run validate:env
```

## Configuration

### Environment Variables
The tools respect standard environment variables:
- `NODE_ENV`: Node environment
- `VITE_NODE_ENV`: Vite environment
- `VITE_ENABLE_DEBUG_MODE`: Enable debug mode
- `VITE_USE_MOCK_DATA`: Use mock data

### Customization
All tools can be customized by modifying the script files:
- `scripts/dev-tools.js`: Development utilities
- `scripts/build-tools.js`: Build automation
- `scripts/dev-helpers.js`: Development workflow

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
chmod +x scripts/*.js
```

#### Missing Dependencies
```bash
npm run dev:setup
```

#### Build Failures
```bash
npm run dev:reset
npm run build:analyze
```

#### Environment Issues
```bash
npm run validate:env
npm run dev:health
```

### Getting Help
```bash
# Show help for any tool
node scripts/dev-tools.js help
node scripts/build-tools.js help
node scripts/dev-helpers.js help
```

## Contributing

When adding new features to the Node.js tools:

1. Follow the existing command structure
2. Add proper error handling
3. Include help documentation
4. Update this README
5. Test with different environments

The tools are designed to be extensible and maintainable, making it easy to add new functionality as the project grows.
