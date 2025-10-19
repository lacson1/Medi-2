# CRUD Testing Documentation

## Overview

This document describes the comprehensive CRUD (Create, Read, Update, Delete) testing suite for the MediFlow application. The CRUD testing covers all entities and operations across multiple testing levels.

## Test Structure

```text
src/tests/
├── api/
│   ├── apiClient.test.ts          # Existing API client tests
│   └── crud.test.ts              # Comprehensive CRUD API tests
├── hooks/
│   ├── useApi.test.tsx           # Existing hook tests
│   └── crudHooks.test.tsx        # CRUD React Query hook tests
├── components/
│   ├── ui/                       # Existing UI component tests
│   └── crudComponents.test.tsx   # CRUD component tests
└── e2e/
    ├── enhanced-patient-workspace-orders.test.ts  # Existing E2E tests
    └── crudWorkflows.test.ts     # CRUD E2E workflow tests
```

## Entities Covered

The CRUD testing suite covers all major entities in the MediFlow application:

### 1. **Patients**
- **CREATE**: Patient registration with validation
- **READ**: Patient listing, searching, filtering, and individual retrieval
- **UPDATE**: Patient information updates, status changes
- **DELETE**: Patient removal with cascade handling

### 2. **Appointments**
- **CREATE**: Appointment scheduling with conflict detection
- **READ**: Appointment listing by date, doctor, patient, status
- **UPDATE**: Rescheduling, status updates, completion
- **DELETE**: Appointment cancellation

### 3. **Prescriptions**
- **CREATE**: Prescription creation with drug interaction checks
- **READ**: Prescription listing by patient, doctor, medication
- **UPDATE**: Dosage changes, discontinuation, refill management
- **DELETE**: Prescription removal

### 4. **Lab Orders**
- **CREATE**: Lab test ordering with priority and location
- **READ**: Lab order listing by patient, doctor, status
- **UPDATE**: Results entry, status updates, priority changes
- **DELETE**: Lab order cancellation

### 5. **Billing**
- **CREATE**: Invoice creation with insurance information
- **READ**: Billing record listing by patient, status, date range
- **UPDATE**: Payment processing, status updates, adjustments
- **DELETE**: Billing record removal

### 6. **Encounters**
- **CREATE**: Encounter documentation with diagnosis and treatment
- **READ**: Encounter listing by patient, doctor, date
- **UPDATE**: Notes updates, diagnosis modifications
- **DELETE**: Encounter removal

### 7. **Users**
- **CREATE**: User creation with role and permission assignment
- **READ**: User listing by role, department, status
- **UPDATE**: Permission changes, role updates, activation/deactivation
- **DELETE**: User removal

### 8. **Organizations**
- **CREATE**: Organization registration with licensing information
- **READ**: Organization listing by type, location, status
- **UPDATE**: Information updates, status changes
- **DELETE**: Organization removal

## Test Categories

### 1. **API-Level CRUD Tests** (`src/tests/api/crud.test.ts`)

**Purpose**: Test CRUD operations at the API client level

**Coverage**:
- All CRUD operations for each entity
- Error handling and validation
- Network error scenarios
- Performance with large datasets
- Concurrent operations
- Batch operations

**Key Test Scenarios**:
```typescript
// Example: Patient CRUD operations
describe('Patient CRUD Operations', () => {
  describe('CREATE - Patient Creation', () => {
    it('should create a new patient with valid data')
    it('should handle patient creation with missing required fields')
    it('should handle patient creation with invalid email format')
  })
  
  describe('READ - Patient Retrieval', () => {
    it('should list all patients with pagination')
    it('should get a specific patient by ID')
    it('should handle patient not found')
    it('should search patients by name')
  })
  
  describe('UPDATE - Patient Modification', () => {
    it('should update patient information')
    it('should handle partial updates')
    it('should handle update with invalid data')
  })
  
  describe('DELETE - Patient Removal', () => {
    it('should delete a patient')
    it('should handle deletion of non-existent patient')
    it('should handle deletion with dependent records')
  })
})
```

### 2. **React Query Hook Tests** (`src/tests/hooks/crudHooks.test.tsx`)

**Purpose**: Test CRUD operations through React Query hooks

**Coverage**:
- `useResource` hook functionality
- `useResourceList` hook functionality
- Cache management and invalidation
- Loading and error states
- Optimistic updates
- Cross-entity operations

**Key Test Scenarios**:
```typescript
// Example: Hook integration tests
describe('useResource Hook - Patient CRUD', () => {
  describe('READ Operations', () => {
    it('should fetch patient list')
    it('should fetch single patient')
    it('should handle loading states')
    it('should handle error states')
  })
  
  describe('CREATE Operations', () => {
    it('should create a new patient')
    it('should handle create errors')
    it('should invalidate cache after create')
  })
  
  describe('UPDATE Operations', () => {
    it('should update a patient')
    it('should handle update errors')
    it('should invalidate cache after update')
  })
  
  describe('DELETE Operations', () => {
    it('should delete a patient')
    it('should handle delete errors')
    it('should invalidate cache after delete')
  })
})
```

### 3. **Component-Level Tests** (`src/tests/components/crudComponents.test.tsx`)

**Purpose**: Test CRUD operations in React components and forms

**Coverage**:
- Form rendering and validation
- User interactions (clicks, form submissions)
- Error handling in UI
- Loading states
- Form cancellation and navigation

**Key Test Scenarios**:
```typescript
// Example: Component CRUD tests
describe('Patient CRUD Component Operations', () => {
  describe('CREATE Operations', () => {
    it('should render create form when create button is clicked')
    it('should create a new patient when form is submitted')
    it('should validate required fields')
    it('should handle create errors')
  })
  
  describe('READ Operations', () => {
    it('should display patient list')
    it('should show loading state')
    it('should handle load errors')
  })
  
  describe('UPDATE Operations', () => {
    it('should render edit form when edit button is clicked')
    it('should update patient when form is submitted')
    it('should handle update errors')
  })
  
  describe('DELETE Operations', () => {
    it('should delete patient when delete button is clicked')
    it('should handle delete errors')
  })
})
```

### 4. **End-to-End Tests** (`src/tests/e2e/crudWorkflows.test.ts`)

**Purpose**: Test complete CRUD workflows from user perspective

**Coverage**:
- Complete user workflows
- Cross-entity operations
- Error scenarios
- Performance testing
- Concurrent operations

**Key Test Scenarios**:
```typescript
// Example: E2E CRUD workflows
test.describe('Patient CRUD Workflow', () => {
  test('should complete full patient CRUD lifecycle', async ({ page }) => {
    // CREATE: Add a new patient
    // READ: View patient details
    // UPDATE: Edit patient information
    // DELETE: Remove patient
  })
  
  test('should handle patient creation with validation errors', async ({ page }) => {
    // Test form validation
  })
  
  test('should search and filter patients', async ({ page }) => {
    // Test search and filtering functionality
  })
})
```

## Test Commands

### CRUD-Specific Commands

```bash
# Run all CRUD tests
npm run test:crud

# Run specific CRUD test categories
npm run test:crud:unit        # API-level CRUD tests
npm run test:crud:hooks       # React Query hook tests
npm run test:crud:components  # Component tests
npm run test:crud:e2e         # E2E workflow tests

# Run CRUD tests in watch mode
npm run test:crud:watch
```

### General Test Commands

```bash
# Run all tests (includes CRUD tests)
npm run test:all

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

## Test Data and Mocking

### Mock Data Factories

The test suite includes comprehensive mock data factories:

```typescript
// From setup.tsx
export const createMockPatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: 'patient-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  // ... other properties
  ...overrides
});

export const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 'appointment-1',
  patient_id: 'patient-1',
  appointment_date: '2024-02-01T10:00:00Z',
  // ... other properties
  ...overrides
});
```

### API Mocking

The tests use MSW (Mock Service Worker) for API mocking:

```typescript
// From handlers.ts
export const handlers = [
  http.get('/api/patients', () => {
    return HttpResponse.json([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
  }),
  // ... other handlers
];
```

## Error Handling Tests

The CRUD test suite includes comprehensive error handling:

### API Error Scenarios
- Network errors
- Server errors (500, 404, 403)
- Validation errors
- Timeout errors
- Authentication errors

### Component Error Scenarios
- Form validation errors
- API error display
- Loading state handling
- User feedback

### E2E Error Scenarios
- Network failures
- Server unavailability
- Validation failures
- Concurrent operation conflicts

## Performance Testing

The CRUD tests include performance considerations:

### API Performance
- Large dataset handling (1000+ records)
- Concurrent operations
- Batch operations
- Cache performance

### Component Performance
- Large list rendering
- Form performance with many fields
- Search and filtering performance

### E2E Performance
- Page load times
- Form submission times
- Search response times
- Concurrent user scenarios

## Cross-Entity Testing

The test suite includes tests for related entity operations:

### Related Entity Creation
- Creating appointments for patients
- Creating prescriptions for patients
- Creating lab orders for patients
- Creating billing records for appointments

### Cascade Operations
- Deleting patients with related records
- Updating related records when parent changes
- Handling foreign key constraints

### Data Integrity
- Ensuring data consistency across entities
- Validating relationships
- Handling orphaned records

## Best Practices

### Test Organization
- Group tests by entity and operation
- Use descriptive test names
- Include both positive and negative test cases
- Test edge cases and error scenarios

### Test Data Management
- Use factory functions for mock data
- Keep test data realistic
- Use unique identifiers to avoid conflicts
- Clean up test data after tests

### Assertions
- Test both success and error cases
- Verify API calls are made correctly
- Check UI state changes
- Validate data transformations

### Performance Considerations
- Use appropriate timeouts
- Test with realistic data volumes
- Monitor test execution time
- Optimize test data setup

## Continuous Integration

The CRUD tests are integrated into the CI/CD pipeline:

### Pre-commit Hooks
- Run CRUD unit tests
- Run CRUD component tests
- Check test coverage

### Pull Request Checks
- Run all CRUD tests
- Run E2E tests
- Generate coverage reports

### Deployment Pipeline
- Run full test suite including CRUD tests
- Performance regression testing
- Cross-browser E2E testing

## Coverage Goals

The CRUD test suite aims for:

- **API Coverage**: 95%+ for all CRUD operations
- **Component Coverage**: 90%+ for CRUD components
- **Hook Coverage**: 95%+ for React Query hooks
- **E2E Coverage**: 80%+ for critical user workflows

## Maintenance

### Regular Updates
- Update tests when API changes
- Add tests for new entities
- Update mock data as needed
- Review and update test scenarios

### Test Review Process
- Code review for all test changes
- Regular test suite review
- Performance monitoring
- Coverage analysis

## Troubleshooting

### Common Issues

1. **Test Timeouts**
   - Increase timeout values
   - Check for slow API responses
   - Optimize test data setup

2. **Mock Data Conflicts**
   - Use unique identifiers
   - Clean up test data
   - Use factory functions

3. **E2E Test Flakiness**
   - Add proper waits
   - Use stable selectors
   - Handle dynamic content

4. **Coverage Gaps**
   - Add missing test cases
   - Test error scenarios
   - Cover edge cases

### Debug Tools

- Vitest UI for unit tests
- Playwright UI for E2E tests
- Browser dev tools for debugging
- Network tab for API monitoring

## Future Enhancements

### Planned Improvements
- Visual regression testing
- Accessibility testing integration
- Mobile-specific CRUD tests
- Internationalization testing
- Advanced performance testing

### Test Automation
- Automated test generation
- Smart test data generation
- Performance regression detection
- Cross-browser compatibility testing
