# TypeScript Test Suite Documentation

## Overview

This document describes the comprehensive TypeScript test suite for the MediFlow application. The test suite provides type-safe testing with high coverage and multiple testing strategies, including comprehensive CRUD (Create, Read, Update, Delete) testing for all entities.

## Test Structure

```text
src/tests/
├── setup.ts                    # Test setup and configuration
├── components/                 # Component tests
│   ├── ui/                    # UI component tests
│   │   ├── button.test.tsx
│   │   ├── input.test.tsx
│   │   ├── card.test.tsx
│   │   ├── label.test.tsx
│   │   ├── badge.test.tsx
│   │   └── select.test.tsx
│   ├── PatientCard.test.tsx
│   └── crudComponents.test.tsx # CRUD component tests
├── api/                       # API layer tests
│   ├── apiClient.test.ts
│   └── crud.test.ts          # Comprehensive CRUD API tests
├── contexts/                  # Context provider tests
│   └── AuthContext.test.tsx
├── hooks/                     # Custom hook tests
│   ├── useApi.test.tsx
│   └── crudHooks.test.tsx    # CRUD React Query hook tests
├── utils/                     # Utility function tests
│   ├── validationSchemas.test.ts
│   ├── security.test.ts
│   ├── accessibility.test.tsx
│   └── index.test.ts
├── lib/                       # Library tests
│   └── monitoring.test.ts
├── types/                     # Type definition tests
│   └── index.test.ts
├── e2e/                       # End-to-end tests
│   ├── enhanced-patient-workspace-orders.test.ts
│   └── crudWorkflows.test.ts  # CRUD E2E workflow tests
└── mocks/                     # Mock data and handlers
    ├── handlers.ts
    └── server.ts
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: jsdom for DOM testing
- **Setup**: `src/tests/setup.ts` for global test configuration
- **Coverage**: 80% threshold for all metrics
- **Timeout**: 10 seconds for tests and hooks
- **Aliases**: `@` mapped to `src` directory

### Test Setup (`src/tests/setup.ts`)

- MSW (Mock Service Worker) for API mocking
- Global test utilities and mocks
- Environment variable mocking
- Browser API mocking (matchMedia, IntersectionObserver, ResizeObserver)
- Console error suppression for known issues

## Test Categories

### 1. Unit Tests

**Purpose**: Test individual components and functions in isolation

**Location**: `src/tests/components/`, `src/tests/utils/`, `src/tests/lib/`, `src/tests/types/`

**Examples**:
- Button component rendering and interactions
- Input validation and error handling
- Utility function behavior
- Type definition correctness

**Command**: `npm run test:unit`

### 2. Integration Tests

**Purpose**: Test how different parts of the application work together

**Location**: `src/tests/api/`, `src/tests/contexts/`, `src/tests/hooks/`

**Examples**:
- API client functionality
- Context provider state management
- React Query hook behavior
- Authentication flow

**Command**: `npm run test:integration`

### 3. CRUD Tests

**Purpose**: Test Create, Read, Update, Delete operations for all entities

**Location**: `src/tests/api/crud.test.ts`, `src/tests/hooks/crudHooks.test.tsx`, `src/tests/components/crudComponents.test.tsx`

**Examples**:
- Patient CRUD operations
- Appointment scheduling and management
- Prescription creation and updates
- Lab order processing
- Billing record management
- User and organization management

**Commands**:
- `npm run test:crud` - Run all CRUD tests
- `npm run test:crud:unit` - API-level CRUD tests
- `npm run test:crud:hooks` - React Query hook tests
- `npm run test:crud:components` - Component tests
- `npm run test:crud:e2e` - E2E workflow tests

### 4. End-to-End Tests

**Purpose**: Test complete user workflows

**Location**: `src/tests/e2e/`, `playwright/` (separate from unit tests)

**Examples**:
- User login flow
- Patient creation workflow
- Appointment scheduling
- Billing process
- Complete CRUD workflows

**Command**: `npm run test:e2e`

## Test Utilities

### Mock Data Factories

```typescript
// Create mock data with type safety
const mockPatient = createMockPatient({
  first_name: 'John',
  last_name: 'Doe',
  // ... other properties
});

const mockAppointment = createMockAppointment({
  patient_id: 'patient-1',
  appointment_date: '2024-02-01T10:00:00Z',
  // ... other properties
});
```

### Test Wrappers

```typescript
// React Query wrapper for hook testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

### Custom Render Functions

```typescript
// Render with providers
const renderWithProviders = (ui: ReactElement, options: any = {}) => {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const { render } = require('@testing-library/react');
  
  const queryClient = options.queryClient || createMockQueryClient();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...options });
};
```

## Testing Patterns

### 1. Component Testing

```typescript
describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Hook Testing

```typescript
describe('usePatients Hook', () => {
  it('should fetch patients list', async () => {
    mockApi.patients.list.mockResolvedValue([mockPatient]);

    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([mockPatient]);
  });
});
```

### 3. API Testing

```typescript
describe('EnhancedApiClient', () => {
  it('should list patients', async () => {
    mockBase44.entities.Patient.list.mockResolvedValue([mockPatient]);

    const result = await apiClient.list<Patient>('Patient');

    expect(result).toEqual([mockPatient]);
    expect(mockBase44.entities.Patient.list).toHaveBeenCalledWith({});
  });
});
```

### 4. Context Testing

```typescript
describe('AuthContext', () => {
  it('should handle successful login', async () => {
    const mockUser: AuthUser = {
      id: 'user-1',
      first_name: 'John',
      // ... other properties
    };

    mockBase44.auth.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('john.doe@example.com');
    });
  });
});
```

## Mocking Strategies

### 1. API Mocking

```typescript
// Mock the base44 client
vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
    },
    entities: {
      Patient: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}));
```

### 2. Context Mocking

```typescript
// Mock Auth Context
export const mockAuthContext = {
  user: createMockUser(),
  loading: false,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  // ... other properties
};
```

### 3. Environment Mocking

```typescript
// Mock environment variables
vi.mock('import.meta.env', () => ({
  MODE: 'test',
  VITE_SENTRY_DSN: 'https://test@sentry.io/test',
  VITE_APP_VERSION: '1.0.0',
}));
```

## Coverage Requirements

### Global Thresholds

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

- **Text**: Console output during test runs
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html` (open in browser)

### Excluded Files

- Test files (`**/*.{test,spec}.{js,ts,tsx}`)
- Type definition files (`**/*.d.ts`)
- Entry points (`main.tsx`, `App.tsx`, `pages/index.tsx`)

## Running Tests

### Available Commands

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run end-to-end tests
npm run test:e2e

# Type checking
npm run test:typecheck

# Linting
npm run test:lint

# Code formatting
npm run test:format

# Clean test artifacts
npm run test:clean
```

### Test Runner Script

The `scripts/test-runner.js` provides additional test management:

```bash
# Show help
node scripts/test-runner.js help

# Run specific test suite
node scripts/test-runner.js unit
node scripts/test-runner.js integration
node scripts/test-runner.js coverage
```

## Best Practices

### 1. Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies
- Use factory functions for test data
- Reset mocks between tests

### 3. Assertions

- Use specific matchers
- Test both positive and negative cases
- Verify side effects

### 4. Async Testing

- Use `waitFor` for async operations
- Handle loading states
- Test error conditions

### 5. Type Safety

- Use TypeScript types in tests
- Leverage type inference
- Test type definitions

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout in `vitest.config.ts`
2. **Mock Issues**: Ensure mocks are reset between tests
3. **Coverage Issues**: Check excluded files in configuration
4. **Type Errors**: Run `npm run test:typecheck` separately

### Debug Mode

```bash
# Run tests with debug output
DEBUG=vitest npm run test

# Run specific test file
npm run test src/tests/components/ui/button.test.tsx
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## Performance Considerations

- Tests should complete in under 10 seconds
- Use `vi.clearAllMocks()` to prevent memory leaks
- Mock heavy operations (API calls, file I/O)
- Use `beforeEach` and `afterEach` for cleanup

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparisons
2. **Performance Testing**: Add performance benchmarks
3. **Accessibility Testing**: Integrate axe-core
4. **Mutation Testing**: Add mutation testing for better coverage
5. **Test Data Management**: Implement test data factories

## Contributing

When adding new tests:

1. Follow the existing patterns
2. Ensure type safety
3. Add appropriate mocks
4. Include both positive and negative test cases
5. Update this documentation if needed

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
