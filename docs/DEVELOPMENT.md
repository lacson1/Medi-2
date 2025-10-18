# Development Guide

This guide provides detailed instructions for setting up and contributing to the MediFlow development environment.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended editor with extensions

### Recommended VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/mediflow.git
cd mediflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
VITE_BASE44_SERVER_URL=https://base44.app
VITE_BASE44_APP_ID=your_app_id_here
VITE_USE_MOCK_DATA=true
VITE_ENABLE_DEBUG_MODE=true
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add login functionality
fix(patients): resolve patient search bug
docs(readme): update installation instructions
style(ui): format component code
refactor(api): simplify client configuration
test(patients): add patient form tests
```

### Code Style

#### ESLint Configuration
The project uses ESLint with React and TypeScript rules. Run linting:
```bash
npm run lint
```

#### Prettier Integration
Code formatting is handled by Prettier through ESLint. Format on save is recommended.

#### Component Guidelines
- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript for type safety
- Follow the single responsibility principle

### Testing Strategy

#### Unit Tests
- Test individual components in isolation
- Mock external dependencies
- Focus on component behavior and user interactions

#### Integration Tests
- Test component interactions
- Test API integration
- Test user workflows

#### E2E Tests
- Test complete user journeys
- Test critical business flows
- Test cross-browser compatibility

### Running Tests
```bash
# Unit and integration tests
npm test

# Tests with UI
npm run test:ui

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Project Structure

### Component Organization
```
src/components/
├── ui/                 # Base UI components (Radix)
├── patients/           # Patient-related components
├── appointments/       # Appointment components
├── billing/           # Billing components
├── dashboard/         # Dashboard components
└── ...
```

### Component Structure
Each component should follow this structure:
```jsx
// Component.jsx
import React from 'react';
import { ComponentProps } from './types';

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### API Integration
- Use the Base44 SDK client from `src/api/base44Client.js`
- Implement proper error handling
- Use React Query for data fetching and caching
- Follow the established patterns in existing components

### State Management
- Use React Query for server state
- Use React Context for global client state
- Use local state for component-specific state
- Avoid prop drilling with context providers

## Debugging

### Development Tools
- **React Developer Tools**: Browser extension
- **TanStack Query Devtools**: Built-in query debugging
- **Redux DevTools**: For state inspection (if using Redux)

### Debug Mode
Enable debug mode in `.env`:
```env
VITE_ENABLE_DEBUG_MODE=true
```

This enables:
- Additional console logging
- Development-only UI elements
- Performance monitoring
- Error boundary details

### Common Issues

#### Build Errors
- Check Node.js version compatibility
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check`

#### Runtime Errors
- Check browser console for errors
- Verify environment variables
- Check API connectivity
- Review component props and state

#### Test Failures
- Check test environment setup
- Verify mock data
- Check component test isolation
- Review async test handling

## Performance Guidelines

### Bundle Optimization
- Use dynamic imports for code splitting
- Optimize images and assets
- Minimize bundle size with tree shaking
- Use React.memo for expensive components

### Runtime Performance
- Avoid unnecessary re-renders
- Use useMemo and useCallback appropriately
- Implement virtual scrolling for large lists
- Optimize API calls with React Query

### Monitoring
- Use React Query Devtools for API performance
- Monitor bundle size with build analysis
- Use Lighthouse for performance auditing
- Implement error tracking

## Security Considerations

### Development Security
- Never commit sensitive data to version control
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling

### Code Review Checklist
- [ ] No hardcoded secrets or credentials
- [ ] Proper input validation
- [ ] Error handling implemented
- [ ] Tests cover new functionality
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Security implications reviewed

## Deployment Preparation

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Security headers implemented
- [ ] Performance optimized
- [ ] Documentation updated

### Build Process
```bash
# Production build
npm run build

# Preview build locally
npm run preview
```

## Contributing

### Pull Request Process
1. Create a feature branch from `develop`
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Address review feedback
6. Merge after approval

### Code Review Guidelines
- Review for functionality and correctness
- Check test coverage
- Verify performance impact
- Ensure security best practices
- Review documentation updates

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Tools
- [Base44 SDK Documentation](https://docs.base44.com/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)

### Community
- [GitHub Discussions](https://github.com/your-org/mediflow/discussions)
- [Discord Server](https://discord.gg/mediflow)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mediflow)
