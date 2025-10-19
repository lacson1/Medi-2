/**
 * CRUD End-to-End Tests
 * Tests complete CRUD workflows using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('CRUD End-to-End Workflows', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:5173');

        // Wait for the application to load
        await page.waitForLoadState('networkidle');
    });

    test.describe('Patient CRUD Workflow', () => {
        test('should complete full patient CRUD lifecycle', async ({ page }) => {
            // Navigate to patients page
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            // CREATE: Add a new patient
            await page.click('[data-testid="create-patient-btn"]');
            await page.waitForSelector('[data-testid="patient-form"]');

            // Fill patient form
            await page.fill('[data-testid="first-name-input"]', 'John');
            await page.fill('[data-testid="last-name-input"]', 'Doe');
            await page.fill('[data-testid="email-input"]', 'john.doe@example.com');
            await page.fill('[data-testid="phone-input"]', '+1234567890');
            await page.fill('[data-testid="address-input"]', '123 Main St');
            await page.fill('[data-testid="city-input"]', 'Anytown');
            await page.fill('[data-testid="state-input"]', 'NY');
            await page.fill('[data-testid="zip-input"]', '12345');
            await page.selectOption('[data-testid="gender-select"]', 'male');
            await page.selectOption('[data-testid="blood-type-select"]', 'O+');

            // Submit form
            await page.click('[data-testid="save-patient-btn"]');

            // Verify patient was created
            await page.waitForSelector('[data-testid="patient-item"]');
            await expect(page.locator('[data-testid="patient-name"]')).toContainText('John Doe');
            await expect(page.locator('[data-testid="patient-email"]')).toContainText('john.doe@example.com');

            // READ: View patient details
            await page.click('[data-testid="view-patient-btn"]');
            await page.waitForSelector('[data-testid="patient-details"]');

            await expect(page.locator('[data-testid="patient-details-name"]')).toContainText('John Doe');
            await expect(page.locator('[data-testid="patient-details-email"]')).toContainText('john.doe@example.com');
            await expect(page.locator('[data-testid="patient-details-phone"]')).toContainText('+1234567890');

            // UPDATE: Edit patient information
            await page.click('[data-testid="edit-patient-btn"]');
            await page.waitForSelector('[data-testid="patient-form"]');

            // Update patient information
            await page.fill('[data-testid="first-name-input"]', 'Johnny');
            await page.fill('[data-testid="phone-input"]', '+1234567899');
            await page.fill('[data-testid="address-input"]', '456 Updated St');

            // Submit updated form
            await page.click('[data-testid="save-patient-btn"]');

            // Verify patient was updated
            await page.waitForSelector('[data-testid="patient-item"]');
            await expect(page.locator('[data-testid="patient-name"]')).toContainText('Johnny Doe');
            await expect(page.locator('[data-testid="patient-phone"]')).toContainText('+1234567899');

            // DELETE: Remove patient
            await page.click('[data-testid="delete-patient-btn"]');

            // Confirm deletion
            await page.waitForSelector('[data-testid="confirm-delete-dialog"]');
            await page.click('[data-testid="confirm-delete-btn"]');

            // Verify patient was deleted
            await page.waitForSelector('[data-testid="patient-list"]');
            await expect(page.locator('[data-testid="patient-item"]')).not.toBeVisible();
        });

        test('should handle patient creation with validation errors', async ({ page }) => {
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            await page.click('[data-testid="create-patient-btn"]');
            await page.waitForSelector('[data-testid="patient-form"]');

            // Try to submit form with invalid data
            await page.fill('[data-testid="email-input"]', 'invalid-email');
            await page.click('[data-testid="save-patient-btn"]');

            // Verify validation error is shown
            await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
        });

        test('should search and filter patients', async ({ page }) => {
            // Create multiple patients first
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            // Create first patient
            await page.click('[data-testid="create-patient-btn"]');
            await page.fill('[data-testid="first-name-input"]', 'Alice');
            await page.fill('[data-testid="last-name-input"]', 'Johnson');
            await page.fill('[data-testid="email-input"]', 'alice@example.com');
            await page.fill('[data-testid="phone-input"]', '+1111111111');
            await page.click('[data-testid="save-patient-btn"]');

            // Create second patient
            await page.click('[data-testid="create-patient-btn"]');
            await page.fill('[data-testid="first-name-input"]', 'Bob');
            await page.fill('[data-testid="last-name-input"]', 'Smith');
            await page.fill('[data-testid="email-input"]', 'bob@example.com');
            await page.fill('[data-testid="phone-input"]', '+2222222222');
            await page.click('[data-testid="save-patient-btn"]');

            // Search for specific patient
            await page.fill('[data-testid="patient-search"]', 'Alice');
            await page.press('[data-testid="patient-search"]', 'Enter');

            // Verify only Alice is shown
            await expect(page.locator('[data-testid="patient-item"]')).toHaveCount(1);
            await expect(page.locator('[data-testid="patient-name"]')).toContainText('Alice Johnson');

            // Clear search
            await page.fill('[data-testid="patient-search"]', '');
            await page.press('[data-testid="patient-search"]', 'Enter');

            // Verify all patients are shown
            await expect(page.locator('[data-testid="patient-item"]')).toHaveCount(2);
        });
    });

    test.describe('Appointment CRUD Workflow', () => {
        test('should complete full appointment CRUD lifecycle', async ({ page }) => {
            // First create a patient
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            await page.click('[data-testid="create-patient-btn"]');
            await page.fill('[data-testid="first-name-input"]', 'Jane');
            await page.fill('[data-testid="last-name-input"]', 'Doe');
            await page.fill('[data-testid="email-input"]', 'jane.doe@example.com');
            await page.fill('[data-testid="phone-input"]', '+1234567890');
            await page.click('[data-testid="save-patient-btn"]');

            // Navigate to appointments
            await page.click('[data-testid="appointments-nav"]');
            await page.waitForSelector('[data-testid="appointment-list"]');

            // CREATE: Schedule a new appointment
            await page.click('[data-testid="create-appointment-btn"]');
            await page.waitForSelector('[data-testid="appointment-form"]');

            // Fill appointment form
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="appointment-date"]', '2024-02-15');
            await page.fill('[data-testid="appointment-time"]', '10:00');
            await page.selectOption('[data-testid="appointment-type"]', 'consultation');
            await page.fill('[data-testid="appointment-reason"]', 'Annual checkup');
            await page.fill('[data-testid="appointment-notes"]', 'Patient feels well');

            // Submit form
            await page.click('[data-testid="save-appointment-btn"]');

            // Verify appointment was created
            await page.waitForSelector('[data-testid="appointment-item"]');
            await expect(page.locator('[data-testid="appointment-patient"]')).toContainText('Jane Doe');
            await expect(page.locator('[data-testid="appointment-date"]')).toContainText('Feb 15, 2024');

            // READ: View appointment details
            await page.click('[data-testid="view-appointment-btn"]');
            await page.waitForSelector('[data-testid="appointment-details"]');

            await expect(page.locator('[data-testid="appointment-details-patient"]')).toContainText('Jane Doe');
            await expect(page.locator('[data-testid="appointment-details-doctor"]')).toContainText('Dr. Smith');
            await expect(page.locator('[data-testid="appointment-details-reason"]')).toContainText('Annual checkup');

            // UPDATE: Reschedule appointment
            await page.click('[data-testid="edit-appointment-btn"]');
            await page.waitForSelector('[data-testid="appointment-form"]');

            // Update appointment
            await page.fill('[data-testid="appointment-date"]', '2024-02-16');
            await page.fill('[data-testid="appointment-time"]', '14:00');
            await page.fill('[data-testid="appointment-notes"]', 'Rescheduled due to patient request');

            // Submit updated form
            await page.click('[data-testid="save-appointment-btn"]');

            // Verify appointment was updated
            await page.waitForSelector('[data-testid="appointment-item"]');
            await expect(page.locator('[data-testid="appointment-date"]')).toContainText('Feb 16, 2024');
            await expect(page.locator('[data-testid="appointment-time"]')).toContainText('2:00 PM');

            // UPDATE: Mark appointment as completed
            await page.click('[data-testid="complete-appointment-btn"]');

            // Verify status changed
            await expect(page.locator('[data-testid="appointment-status"]')).toContainText('completed');

            // DELETE: Cancel appointment
            await page.click('[data-testid="cancel-appointment-btn"]');

            // Confirm cancellation
            await page.waitForSelector('[data-testid="confirm-cancel-dialog"]');
            await page.click('[data-testid="confirm-cancel-btn"]');

            // Verify appointment was cancelled
            await page.waitForSelector('[data-testid="appointment-list"]');
            await expect(page.locator('[data-testid="appointment-item"]')).not.toBeVisible();
        });

        test('should handle appointment scheduling conflicts', async ({ page }) => {
            // Create two appointments for the same doctor at the same time
            await page.click('[data-testid="appointments-nav"]');
            await page.waitForSelector('[data-testid="appointment-list"]');

            // First appointment
            await page.click('[data-testid="create-appointment-btn"]');
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="appointment-date"]', '2024-02-15');
            await page.fill('[data-testid="appointment-time"]', '10:00');
            await page.click('[data-testid="save-appointment-btn"]');

            // Second appointment (conflict)
            await page.click('[data-testid="create-appointment-btn"]');
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="appointment-date"]', '2024-02-15');
            await page.fill('[data-testid="appointment-time"]', '10:00');
            await page.click('[data-testid="save-appointment-btn"]');

            // Verify conflict error
            await expect(page.locator('[data-testid="appointment-error"]')).toBeVisible();
            await expect(page.locator('[data-testid="appointment-error"]')).toContainText('Time slot already booked');
        });
    });

    test.describe('Prescription CRUD Workflow', () => {
        test('should complete full prescription CRUD lifecycle', async ({ page }) => {
            // Navigate to prescriptions
            await page.click('[data-testid="prescriptions-nav"]');
            await page.waitForSelector('[data-testid="prescription-list"]');

            // CREATE: Add a new prescription
            await page.click('[data-testid="create-prescription-btn"]');
            await page.waitForSelector('[data-testid="prescription-form"]');

            // Fill prescription form
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="medication-input"]', 'Lisinopril');
            await page.fill('[data-testid="dosage-input"]', '10mg');
            await page.fill('[data-testid="instructions-input"]', 'Take once daily with food');
            await page.fill('[data-testid="start-date"]', '2024-01-01');
            await page.fill('[data-testid="end-date"]', '2024-04-01');
            await page.fill('[data-testid="refills-input"]', '3');
            await page.fill('[data-testid="pharmacy-notes"]', 'Generic available');

            // Submit form
            await page.click('[data-testid="save-prescription-btn"]');

            // Verify prescription was created
            await page.waitForSelector('[data-testid="prescription-item"]');
            await expect(page.locator('[data-testid="prescription-medication"]')).toContainText('Lisinopril');
            await expect(page.locator('[data-testid="prescription-dosage"]')).toContainText('10mg');

            // READ: View prescription details
            await page.click('[data-testid="view-prescription-btn"]');
            await page.waitForSelector('[data-testid="prescription-details"]');

            await expect(page.locator('[data-testid="prescription-details-medication"]')).toContainText('Lisinopril');
            await expect(page.locator('[data-testid="prescription-details-instructions"]')).toContainText('Take once daily with food');

            // UPDATE: Modify prescription
            await page.click('[data-testid="edit-prescription-btn"]');
            await page.waitForSelector('[data-testid="prescription-form"]');

            // Update prescription
            await page.fill('[data-testid="dosage-input"]', '20mg');
            await page.fill('[data-testid="instructions-input"]', 'Take once daily in the morning');
            await page.fill('[data-testid="pharmacy-notes"]', 'Dosage increased per doctor recommendation');

            // Submit updated form
            await page.click('[data-testid="save-prescription-btn"]');

            // Verify prescription was updated
            await page.waitForSelector('[data-testid="prescription-item"]');
            await expect(page.locator('[data-testid="prescription-dosage"]')).toContainText('20mg');

            // UPDATE: Discontinue prescription
            await page.click('[data-testid="discontinue-prescription-btn"]');

            // Confirm discontinuation
            await page.waitForSelector('[data-testid="confirm-discontinue-dialog"]');
            await page.fill('[data-testid="discontinue-reason"]', 'Patient no longer needs medication');
            await page.click('[data-testid="confirm-discontinue-btn"]');

            // Verify prescription was discontinued
            await expect(page.locator('[data-testid="prescription-status"]')).toContainText('discontinued');

            // DELETE: Remove prescription
            await page.click('[data-testid="delete-prescription-btn"]');

            // Confirm deletion
            await page.waitForSelector('[data-testid="confirm-delete-dialog"]');
            await page.click('[data-testid="confirm-delete-btn"]');

            // Verify prescription was deleted
            await page.waitForSelector('[data-testid="prescription-list"]');
            await expect(page.locator('[data-testid="prescription-item"]')).not.toBeVisible();
        });

        test('should handle drug interaction warnings', async ({ page }) => {
            await page.click('[data-testid="prescriptions-nav"]');
            await page.waitForSelector('[data-testid="prescription-list"]');

            await page.click('[data-testid="create-prescription-btn"]');
            await page.waitForSelector('[data-testid="prescription-form"]');

            // Try to prescribe a medication that conflicts with existing ones
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="medication-input"]', 'Warfarin');
            await page.fill('[data-testid="dosage-input"]', '5mg');
            await page.click('[data-testid="save-prescription-btn"]');

            // Verify drug interaction warning
            await expect(page.locator('[data-testid="drug-interaction-warning"]')).toBeVisible();
            await expect(page.locator('[data-testid="drug-interaction-warning"]')).toContainText('Drug interaction detected');
        });
    });

    test.describe('Lab Order CRUD Workflow', () => {
        test('should complete full lab order CRUD lifecycle', async ({ page }) => {
            // Navigate to lab orders
            await page.click('[data-testid="lab-orders-nav"]');
            await page.waitForSelector('[data-testid="lab-order-list"]');

            // CREATE: Order a new lab test
            await page.click('[data-testid="create-lab-order-btn"]');
            await page.waitForSelector('[data-testid="lab-order-form"]');

            // Fill lab order form
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="test-name-input"]', 'Complete Blood Count');
            await page.selectOption('[data-testid="test-type-select"]', 'blood');
            await page.fill('[data-testid="order-date"]', '2024-01-15');
            await page.fill('[data-testid="lab-notes"]', 'Routine screening');
            await page.selectOption('[data-testid="lab-location-select"]', 'Main Lab');
            await page.selectOption('[data-testid="priority-select"]', 'normal');

            // Submit form
            await page.click('[data-testid="save-lab-order-btn"]');

            // Verify lab order was created
            await page.waitForSelector('[data-testid="lab-order-item"]');
            await expect(page.locator('[data-testid="lab-order-test"]')).toContainText('Complete Blood Count');
            await expect(page.locator('[data-testid="lab-order-status"]')).toContainText('pending');

            // READ: View lab order details
            await page.click('[data-testid="view-lab-order-btn"]');
            await page.waitForSelector('[data-testid="lab-order-details"]');

            await expect(page.locator('[data-testid="lab-order-details-test"]')).toContainText('Complete Blood Count');
            await expect(page.locator('[data-testid="lab-order-details-patient"]')).toContainText('Jane Doe');

            // UPDATE: Add lab results
            await page.click('[data-testid="add-results-btn"]');
            await page.waitForSelector('[data-testid="lab-results-form"]');

            // Fill lab results
            await page.fill('[data-testid="hemoglobin-input"]', '14.2');
            await page.fill('[data-testid="hematocrit-input"]', '42.1');
            await page.fill('[data-testid="wbc-input"]', '7.2');
            await page.fill('[data-testid="platelets-input"]', '285');
            await page.fill('[data-testid="results-notes"]', 'All values within normal range');

            // Submit results
            await page.click('[data-testid="save-results-btn"]');

            // Verify lab order was updated with results
            await page.waitForSelector('[data-testid="lab-order-item"]');
            await expect(page.locator('[data-testid="lab-order-status"]')).toContainText('completed');
            await expect(page.locator('[data-testid="lab-order-results"]')).toBeVisible();

            // DELETE: Remove lab order
            await page.click('[data-testid="delete-lab-order-btn"]');

            // Confirm deletion
            await page.waitForSelector('[data-testid="confirm-delete-dialog"]');
            await page.click('[data-testid="confirm-delete-btn"]');

            // Verify lab order was deleted
            await page.waitForSelector('[data-testid="lab-order-list"]');
            await expect(page.locator('[data-testid="lab-order-item"]')).not.toBeVisible();
        });
    });

    test.describe('Billing CRUD Workflow', () => {
        test('should complete full billing CRUD lifecycle', async ({ page }) => {
            // Navigate to billing
            await page.click('[data-testid="billing-nav"]');
            await page.waitForSelector('[data-testid="billing-list"]');

            // CREATE: Create a new billing record
            await page.click('[data-testid="create-billing-btn"]');
            await page.waitForSelector('[data-testid="billing-form"]');

            // Fill billing form
            await page.selectOption('[data-testid="patient-select"]', 'jane.doe@example.com');
            await page.selectOption('[data-testid="appointment-select"]', 'appointment-1');
            await page.fill('[data-testid="amount-input"]', '150.00');
            await page.fill('[data-testid="due-date"]', '2024-02-15');
            await page.fill('[data-testid="insurance-info"]', 'Blue Cross - BC123456');
            await page.fill('[data-testid="billing-notes"]', 'Routine consultation');
            await page.fill('[data-testid="invoice-number"]', 'INV-2024-001');

            // Submit form
            await page.click('[data-testid="save-billing-btn"]');

            // Verify billing record was created
            await page.waitForSelector('[data-testid="billing-item"]');
            await expect(page.locator('[data-testid="billing-amount"]')).toContainText('$150.00');
            await expect(page.locator('[data-testid="billing-status"]')).toContainText('pending');

            // READ: View billing details
            await page.click('[data-testid="view-billing-btn"]');
            await page.waitForSelector('[data-testid="billing-details"]');

            await expect(page.locator('[data-testid="billing-details-amount"]')).toContainText('$150.00');
            await expect(page.locator('[data-testid="billing-details-patient"]')).toContainText('Jane Doe');

            // UPDATE: Process payment
            await page.click('[data-testid="process-payment-btn"]');
            await page.waitForSelector('[data-testid="payment-form"]');

            // Fill payment form
            await page.selectOption('[data-testid="payment-method-select"]', 'credit_card');
            await page.fill('[data-testid="payment-amount"]', '150.00');
            await page.fill('[data-testid="payment-notes"]', 'Payment received via credit card');

            // Submit payment
            await page.click('[data-testid="save-payment-btn"]');

            // Verify billing record was updated
            await page.waitForSelector('[data-testid="billing-item"]');
            await expect(page.locator('[data-testid="billing-status"]')).toContainText('paid');
            await expect(page.locator('[data-testid="billing-payment-method"]')).toContainText('credit_card');

            // DELETE: Remove billing record
            await page.click('[data-testid="delete-billing-btn"]');

            // Confirm deletion
            await page.waitForSelector('[data-testid="confirm-delete-dialog"]');
            await page.click('[data-testid="confirm-delete-btn"]');

            // Verify billing record was deleted
            await page.waitForSelector('[data-testid="billing-list"]');
            await expect(page.locator('[data-testid="billing-item"]')).not.toBeVisible();
        });
    });

    test.describe('Cross-Entity CRUD Workflows', () => {
        test('should handle related entity operations', async ({ page }) => {
            // Create a patient
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            await page.click('[data-testid="create-patient-btn"]');
            await page.fill('[data-testid="first-name-input"]', 'Alice');
            await page.fill('[data-testid="last-name-input"]', 'Johnson');
            await page.fill('[data-testid="email-input"]', 'alice@example.com');
            await page.fill('[data-testid="phone-input"]', '+1234567890');
            await page.click('[data-testid="save-patient-btn"]');

            // Create an appointment for the patient
            await page.click('[data-testid="appointments-nav"]');
            await page.waitForSelector('[data-testid="appointment-list"]');

            await page.click('[data-testid="create-appointment-btn"]');
            await page.selectOption('[data-testid="patient-select"]', 'alice@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="appointment-date"]', '2024-02-15');
            await page.fill('[data-testid="appointment-time"]', '10:00');
            await page.click('[data-testid="save-appointment-btn"]');

            // Create a prescription for the patient
            await page.click('[data-testid="prescriptions-nav"]');
            await page.waitForSelector('[data-testid="prescription-list"]');

            await page.click('[data-testid="create-prescription-btn"]');
            await page.selectOption('[data-testid="patient-select"]', 'alice@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="medication-input"]', 'Metformin');
            await page.fill('[data-testid="dosage-input"]', '500mg');
            await page.click('[data-testid="save-prescription-btn"]');

            // Create a lab order for the patient
            await page.click('[data-testid="lab-orders-nav"]');
            await page.waitForSelector('[data-testid="lab-order-list"]');

            await page.click('[data-testid="create-lab-order-btn"]');
            await page.selectOption('[data-testid="patient-select"]', 'alice@example.com');
            await page.selectOption('[data-testid="doctor-select"]', 'Dr. Smith');
            await page.fill('[data-testid="test-name-input"]', 'Blood Glucose');
            await page.click('[data-testid="save-lab-order-btn"]');

            // Verify all related records were created
            await expect(page.locator('[data-testid="prescription-item"]')).toBeVisible();
            await expect(page.locator('[data-testid="lab-order-item"]')).toBeVisible();

            // Test cascade operations - try to delete patient with related records
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            await page.click('[data-testid="delete-patient-btn"]');

            // Should show warning about related records
            await expect(page.locator('[data-testid="cascade-warning"]')).toBeVisible();
            await expect(page.locator('[data-testid="cascade-warning"]')).toContainText('Cannot delete patient with existing appointments');
        });
    });

    test.describe('CRUD Performance and Error Handling', () => {
        test('should handle large datasets efficiently', async ({ page }) => {
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            // Create multiple patients
            for (let i = 0; i < 10; i++) {
                await page.click('[data-testid="create-patient-btn"]');
                await page.fill('[data-testid="first-name-input"]', `Patient${i}`);
                await page.fill('[data-testid="last-name-input"]', 'Test');
                await page.fill('[data-testid="email-input"]', `patient${i}@example.com`);
                await page.fill('[data-testid="phone-input"]', `+123456789${i}`);
                await page.click('[data-testid="save-patient-btn"]');

                // Wait for patient to be created
                await page.waitForSelector('[data-testid="patient-item"]');
            }

            // Verify all patients are displayed
            await expect(page.locator('[data-testid="patient-item"]')).toHaveCount(10);

            // Test pagination
            await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible();
            await page.click('[data-testid="pagination-next"]');

            // Verify pagination works
            await expect(page.locator('[data-testid="pagination-current"]')).toContainText('Page 2');
        });

        test('should handle network errors gracefully', async ({ page }) => {
            // Simulate network error
            await page.route('**/api/patients', route => route.abort());

            await page.click('[data-testid="patients-nav"]');

            // Should show error message
            await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
            await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load patients');
        });

        test('should handle concurrent operations', async ({ page }) => {
            await page.click('[data-testid="patients-nav"]');
            await page.waitForSelector('[data-testid="patient-list"]');

            // Start multiple create operations
            const createPromises = [];
            for (let i = 0; i < 3; i++) {
                createPromises.push(
                    page.click('[data-testid="create-patient-btn"]').then(() => {
                        page.fill('[data-testid="first-name-input"]', `Concurrent${i}`);
                        page.fill('[data-testid="last-name-input"]', 'Test');
                        page.fill('[data-testid="email-input"]', `concurrent${i}@example.com`);
                        page.fill('[data-testid="phone-input"]', `+123456789${i}`);
                        return page.click('[data-testid="save-patient-btn"]');
                    })
                );
            }

            // Wait for all operations to complete
            await Promise.all(createPromises);

            // Verify all patients were created
            await expect(page.locator('[data-testid="patient-item"]')).toHaveCount(3);
        });
    });
});
