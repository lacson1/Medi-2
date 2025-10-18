# Lab Management Test Suite Documentation

## Overview

This document describes the comprehensive test suite for the Lab Management modules in the MediFlow application. The test suite covers three main components:

1. **Lab Inventory Manager** - Inventory tracking, stock management, and alerts
2. **Equipment Manager** - Equipment tracking, maintenance scheduling, and status monitoring
3. **Quality Control** - QC testing, compliance tracking, and corrective actions

## Test Structure

### Component Tests

#### Lab Inventory Manager Tests (`LabInventoryManager.test.tsx`)

**Test Coverage:**
- ✅ **Inventory Metrics** - Total items, low stock, out of stock, expiring soon, total value
- ✅ **Add Item Form** - Form validation, required fields, category selection
- ✅ **Edit Item Function** - Form population, data updates
- ✅ **Delete Item Function** - Confirmation dialog, deletion process
- ✅ **Stock Alerts** - Out of stock, expiring soon, low stock alerts
- ✅ **Filter and Search** - Category filtering, status filtering, text search
- ✅ **Item Display** - Card layout, progress bars, status badges
- ✅ **Category Breakdown** - Metrics by category
- ✅ **Stock Utilization** - Average utilization metrics

**Key Test Scenarios:**
- Displays correct metrics based on mock data (6 total items, 2 low stock, 1 out of stock)
- Form validation for required fields (name, category, current stock, minimum stock, unit)
- Search functionality across multiple fields (name, supplier, lot number, location)
- Alert system with detailed item information
- Stock level progress bars with color coding

#### Equipment Manager Tests (`EquipmentManager.test.tsx`)

**Test Coverage:**
- ✅ **Equipment Metrics** - Total equipment, operational, maintenance due, under maintenance, out of order, calibration due
- ✅ **Add Equipment Form** - Form validation, equipment types, required fields
- ✅ **Schedule Maintenance** - Maintenance types, scheduling, technician assignment
- ✅ **Equipment Status** - Status badges, utilization rates, maintenance dates
- ✅ **Maintenance Alerts** - Overdue maintenance, out of order, calibration due, under maintenance
- ✅ **Filter and Search** - Equipment type filtering, status filtering, name search
- ✅ **Equipment Display** - Card layout, utilization bars, warranty info
- ✅ **Additional Metrics** - Utilization rate, maintenance costs, equipment age
- ✅ **Edit Equipment Function** - Form population, data updates
- ✅ **Schedule Maintenance from Card** - Direct maintenance scheduling

**Key Test Scenarios:**
- Displays correct metrics (6 total equipment, 3 operational, 1 maintenance due)
- Equipment type selection (Analyzer, Microscope, Centrifuge, Incubator, etc.)
- Maintenance type selection (Preventive, Corrective, Calibration, Inspection)
- Utilization rate display with progress bars
- Alert system with detailed equipment information

#### Quality Control Tests (`QualityControl.test.tsx`)

**Test Coverage:**
- ✅ **QC Test Form** - Form validation, test types, status options, required fields
- ✅ **Compliance Tracking** - Compliance metrics, status badges, area details
- ✅ **QC Metrics** - Total tests, passed, failed, pending, in progress, trend
- ✅ **Pass/Fail Tracking** - Pass rate trends, test distribution, actual vs target values
- ✅ **Corrective Actions** - Failed test actions, form field, alert integration
- ✅ **Filter and Search** - Test type filtering, status filtering, name search
- ✅ **Edit QC Test Function** - Form population, data updates
- ✅ **Tabs Navigation** - QC Tests, Compliance, Trends & Analytics
- ✅ **Alerts and Notifications** - Failed tests, non-compliant areas, warnings, pending
- ✅ **Test Results Display** - Value formatting, range highlighting, performance details

**Key Test Scenarios:**
- Displays correct metrics (7 total tests, 5 passed, 2 failed, 1 pending)
- Test type selection (Internal QC, External QC, Proficiency Testing, Calibration, Maintenance QC)
- Status selection (Passed, Failed, Pending, In Progress, Cancelled)
- Compliance tracking across multiple areas
- Corrective action tracking for failed tests
- Tab navigation between different QC views

### Integration Tests

#### Laboratory Management Integration Tests (`LaboratoryManagement.integration.test.tsx`)

**Test Coverage:**
- ✅ **Overview Tab Integration** - Lab metrics, recent activity, cross-module data
- ✅ **Tab Navigation Integration** - Seamless switching between modules
- ✅ **Cross-Module Data Integration** - Consistent metrics across tabs
- ✅ **Alert Integration** - Critical alerts from all modules, severity categorization
- ✅ **Form Integration** - Add forms work across all modules
- ✅ **Data Consistency** - Metrics consistency, status indicators
- ✅ **User Workflow Integration** - Complete workflows, maintenance, QC processes
- ✅ **Performance Integration** - Load times, tab switching responsiveness
- ✅ **Error Handling Integration** - API error handling, form validation

**Key Test Scenarios:**
- Overview displays metrics from all three modules
- Tab switching maintains data consistency
- Alerts are properly categorized by severity (Critical, Warning, Info)
- Forms work consistently across all modules
- Complete user workflows from overview to specific actions
- Performance benchmarks for load times and responsiveness

## Test Data

### Mock Data Structure

The tests use comprehensive mock data that reflects real-world scenarios:

**Inventory Items (6 items):**
- Blood Collection Tubes (In Stock)
- Glucose Test Strips (Low Stock)
- Microscope Slides (Out of Stock)
- Hemoglobin Reagent (Low Stock)
- Disposable Pipette Tips (In Stock)
- Calcium Control Solution (Expiring Soon)

**Equipment (6 items):**
- Hematology Analyzer (Operational)
- Compound Microscope (Calibration Due)
- High-Speed Centrifuge (Under Maintenance)
- Chemistry Analyzer (Operational)
- Incubator (Operational)
- Refrigerated Centrifuge (Out of Order)

**QC Tests (7 tests):**
- Glucose Control (Passed)
- Hematology Control (Failed)
- Proficiency Test - Chemistry (Pending)
- Hemoglobin Control (Passed)
- Chemistry Panel Control (Passed)
- Calibration Verification (Passed)
- Temperature Monitoring (Failed)

**Compliance Records (6 areas):**
- Personnel Training (Compliant)
- Equipment Calibration (Warning)
- Documentation (Non-Compliant)
- Quality Control (Compliant)
- Safety Protocols (Compliant)
- Sample Handling (Warning)

## Running Tests

### Individual Component Tests

```bash
# Run Lab Inventory Manager tests
npm test src/tests/lab-management/LabInventoryManager.test.tsx

# Run Equipment Manager tests
npm test src/tests/lab-management/EquipmentManager.test.tsx

# Run Quality Control tests
npm test src/tests/lab-management/QualityControl.test.tsx
```

### Integration Tests

```bash
# Run integration tests
npm test src/tests/lab-management/LaboratoryManagement.integration.test.tsx
```

### Full Test Suite

```bash
# Run all lab management tests
npm test src/tests/lab-management/

# Run with coverage
npm test src/tests/lab-management/ --coverage

# Use the test runner script
./test-lab-management.sh

# Run with coverage using script
./test-lab-management.sh --coverage
```

## Test Requirements

### Prerequisites

- Node.js 18+ 
- npm or yarn
- React Testing Library
- Jest
- @tanstack/react-query

### Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

## Test Coverage Goals

### Component Coverage
- **Lab Inventory Manager**: 95%+ line coverage
- **Equipment Manager**: 95%+ line coverage  
- **Quality Control**: 95%+ line coverage

### Integration Coverage
- **Cross-module functionality**: 90%+ coverage
- **User workflows**: 100% coverage
- **Error handling**: 85%+ coverage

## Test Scenarios Covered

### Functional Scenarios
1. **CRUD Operations** - Create, Read, Update, Delete for all entities
2. **Form Validation** - Required fields, data types, business rules
3. **Search and Filtering** - Text search, category filters, status filters
4. **Alert Systems** - Critical, warning, and info alerts
5. **Status Management** - Stock levels, equipment status, QC results
6. **Metrics Calculation** - Real-time metrics, trends, utilization

### User Experience Scenarios
1. **Navigation** - Tab switching, form opening/closing
2. **Data Display** - Cards, progress bars, status badges
3. **Responsive Design** - Mobile and desktop layouts
4. **Performance** - Load times, responsiveness
5. **Error Handling** - API errors, validation errors

### Business Logic Scenarios
1. **Stock Management** - Low stock alerts, expiry tracking
2. **Maintenance Scheduling** - Preventive, corrective, calibration
3. **Quality Control** - Pass/fail tracking, corrective actions
4. **Compliance Monitoring** - Status tracking, review cycles

## Continuous Integration

### GitHub Actions Integration

```yaml
name: Lab Management Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test src/tests/lab-management/ --coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test src/tests/lab-management/ --passWithNoTests"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Mock API Client Issues**
   - Ensure mockApiClient is properly mocked
   - Check entity method implementations

2. **Async Test Issues**
   - Use `waitFor` for async operations
   - Properly handle loading states

3. **Form Testing Issues**
   - Use proper form field selectors
   - Handle form validation states

4. **Integration Test Issues**
   - Ensure proper QueryClient setup
   - Mock all external dependencies

### Debug Commands

```bash
# Run tests with verbose output
npm test src/tests/lab-management/ --verbose

# Run specific test file with debug
npm test src/tests/lab-management/LabInventoryManager.test.tsx --verbose

# Run tests with coverage and debug
npm test src/tests/lab-management/ --coverage --verbose
```

## Future Enhancements

### Planned Test Improvements
1. **Visual Regression Testing** - Screenshot comparisons
2. **Performance Testing** - Load testing, stress testing
3. **Accessibility Testing** - WCAG compliance
4. **E2E Testing** - Full user journey testing
5. **API Testing** - Backend integration tests

### Test Data Enhancements
1. **Dynamic Test Data** - Generate realistic test data
2. **Edge Case Testing** - Boundary conditions, error states
3. **Internationalization Testing** - Multi-language support
4. **Concurrent User Testing** - Multi-user scenarios

## Conclusion

This comprehensive test suite ensures the Lab Management modules are robust, reliable, and user-friendly. The tests cover all critical functionality, user workflows, and edge cases, providing confidence in the system's quality and reliability.

The modular test structure allows for easy maintenance and extension as new features are added to the Lab Management system.
