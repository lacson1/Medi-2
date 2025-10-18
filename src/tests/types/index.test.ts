/**
 * Type-safe tests for type definitions
 */

import { describe, it, expect } from 'vitest';
import type {
    BaseEntity,
    Patient,
    Appointment,
    User,
    Organization,
    Billing,
    // ConsultationTemplate,
    // MedicalDocumentTemplate,
    // Prescription,
    // LabOrder,
    // Encounter,
    RequestOptions,
    ListOptions,
    GetOptions,
    EntityType,
    ValidationResult,
    FormErrors,
    FormValidator,
    FormValidators,
    ErrorInfo,
    HealthCheckResult,
    BatchOperation,
    BatchResult,
    ApiErrorContext,
} from '@/types';

describe('Type Definitions', () => {
    describe('BaseEntity', () => {
        it('should have required properties', () => {
            const entity: BaseEntity = {
                id: 'test-id',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(entity.id).toBe('test-id');
            expect(entity.created_at).toBe('2024-01-01T00:00:00Z');
            expect(entity.updated_at).toBe('2024-01-01T00:00:00Z');
        });

        it('should allow additional properties', () => {
            const entity: BaseEntity & { custom_property?: string } = {
                id: 'test-id',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                custom_property: 'custom-value',
            };

            expect(entity.custom_property).toBe('custom-value');
        });
    });

    describe('Patient', () => {
        it('should have all required properties', () => {
            const patient: Patient = {
                id: 'patient-1',
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-01-01',
                gender: 'male',
                status: 'active',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(patient.first_name).toBe('John');
            expect(patient.last_name).toBe('Doe');
            expect(patient.date_of_birth).toBe('1990-01-01');
            expect(patient.gender).toBe('male');
            expect(patient.status).toBe('active');
        });

        it('should allow optional properties', () => {
            const patient: Patient = {
                id: 'patient-1',
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-01-01',
                gender: 'male',
                status: 'active',
                phone: '+1234567890',
                email: 'john.doe@example.com',
                address: '123 Main St',
                city: 'Anytown',
                state: 'NY',
                zip_code: '12345',
                blood_type: 'O+',
                allergies: ['Penicillin'],
                medical_history: ['Hypertension'],
                medications: ['Lisinopril'],
                emergency_contact_name: 'Jane Doe',
                emergency_contact_phone: '+1234567891',
                insurance_provider: 'Blue Cross',
                insurance_number: 'BC123456',
                organization_id: 'org-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(patient.phone).toBe('+1234567890');
            expect(patient.email).toBe('john.doe@example.com');
            expect(patient.allergies).toEqual(['Penicillin']);
            expect(patient.medical_history).toEqual(['Hypertension']);
        });

        it('should allow string or array for allergies', () => {
            const patient1: Patient = {
                id: 'patient-1',
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-01-01',
                gender: 'male',
                status: 'active',
                allergies: 'Penicillin',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            const patient2: Patient = {
                id: 'patient-2',
                first_name: 'Jane',
                last_name: 'Smith',
                date_of_birth: '1985-05-15',
                gender: 'female',
                status: 'active',
                allergies: ['Penicillin', 'Aspirin'],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(typeof patient1.allergies).toBe('string');
            expect(Array.isArray(patient2.allergies)).toBe(true);
        });

        it('should allow string or array for medical_history', () => {
            const patient1: Patient = {
                id: 'patient-1',
                first_name: 'John',
                last_name: 'Doe',
                date_of_birth: '1990-01-01',
                gender: 'male',
                status: 'active',
                medical_history: 'Hypertension',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            const patient2: Patient = {
                id: 'patient-2',
                first_name: 'Jane',
                last_name: 'Smith',
                date_of_birth: '1985-05-15',
                gender: 'female',
                status: 'active',
                medical_history: ['Hypertension', 'Diabetes'],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(typeof patient1.medical_history).toBe('string');
            expect(Array.isArray(patient2.medical_history)).toBe(true);
        });
    });

    describe('Appointment', () => {
        it('should have all required properties', () => {
            const appointment: Appointment = {
                id: 'appointment-1',
                patient_id: 'patient-1',
                doctor_id: 'doctor-1',
                appointment_date: '2024-02-01T10:00:00Z',
                duration: 30,
                type: 'consultation',
                status: 'scheduled',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(appointment.patient_id).toBe('patient-1');
            expect(appointment.doctor_id).toBe('doctor-1');
            expect(appointment.appointment_date).toBe('2024-02-01T10:00:00Z');
            expect(appointment.duration).toBe(30);
            expect(appointment.type).toBe('consultation');
            expect(appointment.status).toBe('scheduled');
        });

        it('should allow optional properties', () => {
            const appointment: Appointment = {
                id: 'appointment-1',
                patient_id: 'patient-1',
                patient_name: 'John Doe',
                doctor_id: 'doctor-1',
                appointment_date: '2024-02-01T10:00:00Z',
                duration: 30,
                type: 'consultation',
                status: 'scheduled',
                notes: 'Regular checkup',
                reason: 'Follow-up visit',
                provider: 'Dr. Smith',
                is_recurring: false,
                recurring_pattern: 'weekly',
                recurring_end_date: '2024-12-31',
                reminder_sent: false,
                priority: 'normal',
                organization_id: 'org-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(appointment.patient_name).toBe('John Doe');
            expect(appointment.notes).toBe('Regular checkup');
            expect(appointment.is_recurring).toBe(false);
            expect(appointment.priority).toBe('normal');
        });
    });

    describe('User', () => {
        it('should have all required properties', () => {
            const user: User = {
                id: 'user-1',
                first_name: 'Dr. Jane',
                last_name: 'Smith',
                email: 'jane.smith@clinic.com',
                role: 'Doctor',
                permissions: ['read_patients', 'write_patients'],
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(user.first_name).toBe('Dr. Jane');
            expect(user.last_name).toBe('Smith');
            expect(user.email).toBe('jane.smith@clinic.com');
            expect(user.role).toBe('Doctor');
            expect(user.is_active).toBe(true);
        });
    });

    describe('Organization', () => {
        it('should have all required properties', () => {
            const organization: Organization = {
                id: 'org-1',
                name: 'Test Clinic',
                type: 'clinic',
                address: '123 Main St',
                city: 'Anytown',
                state: 'NY',
                zip_code: '12345',
                phone: '+1234567890',
                email: 'info@testclinic.com',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(organization.name).toBe('Test Clinic');
            expect(organization.is_active).toBe(true);
        });

        it('should allow optional properties', () => {
            const organization: Organization = {
                id: 'org-1',
                name: 'Test Clinic',
                address: '123 Main St',
                city: 'Anytown',
                state: 'NY',
                zip_code: '12345',
                phone: '+1234567890',
                email: 'info@testclinic.com',
                website: 'https://testclinic.com',
                type: 'clinic',
                is_active: true,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(organization.address).toBe('123 Main St');
            expect(organization.website).toBe('https://testclinic.com');
        });
    });

    describe('Billing', () => {
        it('should have all required properties', () => {
            const billing: Billing = {
                id: 'billing-1',
                patient_id: 'patient-1',
                amount: 100.50,
                billing_date: '2024-01-01',
                due_date: '2024-01-31',
                status: 'pending',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(billing.patient_id).toBe('patient-1');
            expect(billing.amount).toBe(100.50);
            expect(billing.billing_date).toBe('2024-01-01');
            expect(billing.due_date).toBe('2024-01-31');
            expect(billing.status).toBe('pending');
        });

        it('should allow optional properties', () => {
            const billing: Billing = {
                id: 'billing-1',
                patient_id: 'patient-1',
                patient_name: 'John Doe',
                encounter_id: 'encounter-1',
                appointment_id: 'appointment-1',
                amount: 100.50,
                currency: 'USD',
                billing_date: '2024-01-01',
                due_date: '2024-01-31',
                status: 'pending',
                payment_method: 'credit_card',
                payment_date: '2024-01-15',
                insurance_claim_id: 'claim-1',
                insurance_claim_number: 'CLM-001',
                insurance_coverage: 80,
                invoice_number: 'INV-001',
                invoice_date: '2024-01-01',
                service_date: '2024-01-01',
                service_type: 'consultation',
                description: 'Regular checkup',
                line_items: [
                    {
                        item: 'Consultation',
                        quantity: 1,
                        unit_price: 100.50,
                        total: 100.50,
                    },
                ],
                subtotal: 100.50,
                tax: 8.50,
                discount: 0,
                total_amount: 109.00,
                amount_paid: 0,
                balance: 109.00,
                notes: 'Payment due in 30 days',
                organization_id: 'org-1',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(billing.patient_name).toBe('John Doe');
            expect(billing.currency).toBe('USD');
            expect(billing.line_items).toHaveLength(1);
            expect(billing.total_amount).toBe(109.00);
        });
    });

    describe('RequestOptions', () => {
        it('should allow additional properties', () => {
            const options: RequestOptions = {
                timeout: 5000,
                retries: 3,
                ['custom_property']: 'custom-value',
            };

            expect(options.timeout).toBe(5000);
            expect(options.retries).toBe(3);
            expect(options['custom_property']).toBe('custom-value');
        });
    });

    describe('ListOptions', () => {
        it('should allow additional properties', () => {
            const options: ListOptions = {
                page: 1,
                limit: 20,
                search: 'test',
                custom_filter: 'custom-value',
            };

            expect(options.page).toBe(1);
            expect(options.limit).toBe(20);
            expect(options.search).toBe('test');
            expect(options['custom_filter']).toBe('custom-value');
        });
    });

    describe('GetOptions', () => {
        it('should allow additional properties', () => {
            const options: GetOptions = {
                include: ['related_data'],
                custom_option: 'custom-value',
            };

            expect(options.include).toEqual(['related_data']);
            expect(options['custom_option']).toBe('custom-value');
        });
    });

    describe('EntityType', () => {
        it('should accept valid entity types', () => {
            const types: EntityType[] = [
                'Patient',
                'Appointment',
                'User',
                'Organization',
                'Billing',
                'ConsultationTemplate',
                'MedicalDocumentTemplate',
                'Prescription',
                'LabOrder',
                'Encounter',
            ];

            types.forEach(type => {
                expect(typeof type).toBe('string');
            });
        });
    });

    describe('ValidationResult', () => {
        it('should have isValid property', () => {
            const result: ValidationResult = {
                isValid: true,
            };

            expect(result.isValid).toBe(true);
        });

        it('should allow error property', () => {
            const result: ValidationResult = {
                isValid: false,
                error: 'Validation failed',
            };

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Validation failed');
        });

        it('should allow errors property', () => {
            const result: ValidationResult = {
                isValid: false,
                errors: {
                    field1: 'Error 1',
                    field2: 'Error 2',
                },
            };

            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual({
                field1: 'Error 1',
                field2: 'Error 2',
            });
        });
    });

    describe('FormErrors', () => {
        it('should allow string values', () => {
            const errors: FormErrors = {
                field1: 'Error 1',
                field2: 'Error 2',
            };

            expect(errors['field1']).toBe('Error 1');
            expect(errors['field2']).toBe('Error 2');
        });

        it('should allow null values', () => {
            const errors: FormErrors = {
                field1: 'Error 1',
                field2: null,
            };

            expect(errors['field1']).toBe('Error 1');
            expect(errors['field2']).toBeNull();
        });
    });

    describe('FormValidator', () => {
        it('should be a function that returns string or null', () => {
            const validator: FormValidator = (value: unknown) => {
                if (!value) return 'Value is required';
                return null;
            };

            expect(validator('test')).toBeNull();
            expect(validator('')).toBe('Value is required');
        });
    });

    describe('FormValidators', () => {
        it('should allow FormValidator values', () => {
            const validators: FormValidators = {
                field1: (value: unknown) => value ? null : 'Required',
                field2: (value: unknown) => value ? null : 'Required',
            };

            expect(typeof validators['field1']).toBe('function');
            expect(typeof validators['field2']).toBe('function');
        });
    });

    describe('ErrorInfo', () => {
        it('should have required properties', () => {
            const errorInfo: ErrorInfo = {
                message: 'Test error',
                stack: 'Error stack trace',
                timestamp: '2024-01-01T00:00:00Z',
                context: { component: 'test' },
                userAgent: 'Mozilla/5.0',
                url: 'https://example.com',
            };

            expect(errorInfo.message).toBe('Test error');
            expect(errorInfo.timestamp).toBe('2024-01-01T00:00:00Z');
            expect(errorInfo.context).toEqual({ component: 'test' });
            expect(errorInfo.userAgent).toBe('Mozilla/5.0');
            expect(errorInfo.url).toBe('https://example.com');
        });

        it('should allow optional stack property', () => {
            const errorInfo: ErrorInfo = {
                message: 'Test error',
                timestamp: '2024-01-01T00:00:00Z',
                context: { component: 'test' },
                userAgent: 'Mozilla/5.0',
                url: 'https://example.com',
                stack: 'Error stack trace',
            };

            expect(errorInfo.stack).toBe('Error stack trace');
        });
    });

    describe('HealthCheckResult', () => {
        it('should have required properties', () => {
            const result: HealthCheckResult = {
                status: 'healthy',
                timestamp: '2024-01-01T00:00:00Z',
            };

            expect(result.status).toBe('healthy');
            expect(result.timestamp).toBe('2024-01-01T00:00:00Z');
        });

        it('should allow optional properties', () => {
            const result: HealthCheckResult = {
                status: 'unhealthy',
                statusCode: 500,
                error: 'Service unavailable',
                timestamp: '2024-01-01T00:00:00Z',
            };

            expect(result.status).toBe('unhealthy');
            expect(result.statusCode).toBe(500);
            expect(result.error).toBe('Service unavailable');
        });
    });

    describe('BatchOperation', () => {
        it('should have required properties', () => {
            const operation: BatchOperation = {
                type: 'create',
                entityType: 'Patient',
                data: { first_name: 'John', last_name: 'Doe' },
            };

            expect(operation.type).toBe('create');
            expect(operation.entityType).toBe('Patient');
            expect(operation.data).toEqual({ first_name: 'John', last_name: 'Doe' });
        });

        it('should allow optional properties', () => {
            const operation: BatchOperation = {
                type: 'get',
                entityType: 'Patient',
                id: 'patient-1',
                options: { include: ['related_data'] },
            };

            expect(operation.id).toBe('patient-1');
            expect(operation.options).toEqual({ include: ['related_data'] });
        });
    });

    describe('BatchResult', () => {
        it('should have required properties', () => {
            const result: BatchResult = {
                operation: {
                    type: 'create',
                    entityType: 'Patient',
                    data: { first_name: 'John', last_name: 'Doe' },
                },
                success: true,
                data: { id: 'patient-1' },
                error: null,
            };

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 'patient-1' });
            expect(result.error).toBeNull();
        });

        it('should handle error case', () => {
            const result: BatchResult = {
                operation: {
                    type: 'create',
                    entityType: 'Patient',
                    data: { first_name: 'John', last_name: 'Doe' },
                },
                success: false,
                data: null,
                error: new Error('Creation failed'),
            };

            expect(result.success).toBe(false);
            expect(result.data).toBeNull();
            expect(result.error).toBeInstanceOf(Error);
        });
    });

    describe('ApiErrorContext', () => {
        it('should have required properties', () => {
            const context: ApiErrorContext = {
                requestId: 'req-1',
                timestamp: '2024-01-01T00:00:00Z',
                url: 'https://api.example.com/patients',
                method: 'GET',
                status: 404,
                response: 'Not Found',
                options: { timeout: 5000 },
            };

            expect(context.requestId).toBe('req-1');
            expect(context.timestamp).toBe('2024-01-01T00:00:00Z');
            expect(context.url).toBe('https://api.example.com/patients');
            expect(context.method).toBe('GET');
        });

        it('should allow optional properties', () => {
            const context: ApiErrorContext = {
                requestId: 'req-1',
                timestamp: '2024-01-01T00:00:00Z',
                url: 'https://api.example.com/patients',
                method: 'GET',
                status: 404,
                response: { error: 'Not found' },
                options: { timeout: 5000 },
                ['custom_property']: 'custom-value',
            };

            expect(context.status).toBe(404);
            expect(context.response).toEqual({ error: 'Not found' });
            expect(context.options).toEqual({ timeout: 5000 });
            expect(context['custom_property']).toBe('custom-value');
        });
    });
});
