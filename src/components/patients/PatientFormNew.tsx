/**
 * Standardized PatientForm using react-hook-form + zod validation
 * Replaces the old PatientForm with proper validation and error handling
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useForm } from '@/hooks/useForm';
import { Form, InputField, TextareaField, SelectField } from '@/components/forms/FormFields';
import type { Patient } from '@/types';

// Zod schema for patient validation
const patientSchema = z.object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
    phone: z.string().optional().refine((val) => !val || /^[+]?[1-9][\d]{0,15}$/.test(val), 'Invalid phone number'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).default('unknown'),
    allergies: z.array(z.string()).default([]),
    medical_history: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([]),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    insurance_provider: z.string().optional(),
    insurance_number: z.string().optional(),
    status: z.enum(['active', 'inactive', 'archived']),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
    patient?: Patient | null;
    onSubmit: (data: PatientFormData) => Promise<void> | void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function PatientForm({ patient, onSubmit, onCancel, isSubmitting = false }: PatientFormProps) {
    // Convert patient data to form format
    const getDefaultValues = (): Partial<PatientFormData> => {
        if (!patient) {
            return {
                blood_type: 'unknown',
                status: 'active',
                allergies: [],
                medical_history: [],
                medications: [],
            };
        }

        return {
            first_name: patient.first_name || '',
            last_name: patient.last_name || '',
            date_of_birth: patient.date_of_birth || '',
            gender: patient.gender || 'other',
            phone: patient.phone || '',
            email: patient.email || '',
            address: patient.address || '',
            city: patient.city || '',
            state: patient.state || '',
            zip_code: patient.zip_code || '',
            blood_type: (patient.blood_type as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown') || 'unknown',
            allergies: Array.isArray(patient.allergies)
                ? patient.allergies
                : (typeof patient.allergies === 'string' ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : []),
            medical_history: Array.isArray(patient.medical_history)
                ? patient.medical_history
                : (typeof patient.medical_history === 'string' ? patient.medical_history.split(',').map(c => c.trim()).filter(Boolean) : []),
            medications: Array.isArray(patient.medications)
                ? patient.medications
                : (typeof patient.medications === 'string' ? patient.medications.split(',').map(m => m.trim()).filter(Boolean) : []),
            emergency_contact_name: patient.emergency_contact_name || '',
            emergency_contact_phone: patient.emergency_contact_phone || '',
            insurance_provider: patient.insurance_provider || '',
            insurance_number: patient.insurance_number || '',
            status: patient.status || 'active',
        };
    };

    const form = useForm({
        schema: patientSchema,
        onSubmit,
        defaultValues: getDefaultValues(),
    });

    const { watch, setValue, formState } = form;
    const watchedAllergies = watch('allergies');
    const watchedMedicalHistory = watch('medical_history');
    const watchedMedications = watch('medications');

    // Helper functions for managing arrays
    const addItem = (field: 'allergies' | 'medical_history' | 'medications', value: string) => {
        if (value.trim()) {
            const currentItems = watch(field);
            setValue(field, [...currentItems, value.trim()]);
        }
    };

    const removeItem = (field: 'allergies' | 'medical_history' | 'medications', index: number) => {
        const currentItems = watch(field);
        setValue(field, currentItems.filter((_: unknown, i: number) => i !== index));
    };

    return (
        <FormProvider {...form.form}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-semibold">
                            {patient ? 'Edit Patient' : 'Add New Patient'}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={form.handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="first_name"
                                            label="First Name"
                                            placeholder="Enter first name"
                                            required
                                        />
                                        <InputField
                                            name="last_name"
                                            label="Last Name"
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="date_of_birth"
                                            label="Date of Birth"
                                            type="date"
                                            required
                                        />
                                        <SelectField
                                            name="gender"
                                            label="Gender"
                                            placeholder="Select gender"
                                            required
                                            options={[
                                                { value: 'male', label: 'Male' },
                                                { value: 'female', label: 'Female' },
                                                { value: 'other', label: 'Other' },
                                            ]}
                                        />
                                    </div>

                                    <SelectField
                                        name="blood_type"
                                        label="Blood Type"
                                        placeholder="Select blood type"
                                        options={[
                                            { value: 'unknown', label: 'Unknown' },
                                            { value: 'A+', label: 'A+' },
                                            { value: 'A-', label: 'A-' },
                                            { value: 'B+', label: 'B+' },
                                            { value: 'B-', label: 'B-' },
                                            { value: 'AB+', label: 'AB+' },
                                            { value: 'AB-', label: 'AB-' },
                                            { value: 'O+', label: 'O+' },
                                            { value: 'O-', label: 'O-' },
                                        ]}
                                    />
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

                                    <InputField
                                        name="phone"
                                        label="Phone Number"
                                        type="tel"
                                        placeholder="Enter phone number"
                                    />

                                    <InputField
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter email address"
                                    />

                                    <TextareaField
                                        name="address"
                                        label="Address"
                                        placeholder="Enter full address"
                                        rows={2}
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <InputField
                                            name="city"
                                            label="City"
                                            placeholder="Enter city"
                                        />
                                        <InputField
                                            name="state"
                                            label="State"
                                            placeholder="Enter state"
                                        />
                                        <InputField
                                            name="zip_code"
                                            label="ZIP Code"
                                            placeholder="Enter ZIP code"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div className="mt-8 space-y-6">
                                <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>

                                {/* Allergies */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Allergies</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add allergy"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addItem('allergies', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Add allergy"]') as HTMLInputElement;
                                                if (input) {
                                                    addItem('allergies', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {watchedAllergies.map((allergy: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {allergy}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('allergies', index)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Medical History */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Medical History</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add medical condition"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addItem('medical_history', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Add medical condition"]') as HTMLInputElement;
                                                if (input) {
                                                    addItem('medical_history', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {watchedMedicalHistory.map((condition: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {condition}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('medical_history', index)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Medications */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700">Current Medications</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add medication"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addItem('medications', e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.querySelector('input[placeholder="Add medication"]') as HTMLInputElement;
                                                if (input) {
                                                    addItem('medications', input.value);
                                                    input.value = '';
                                                }
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {watchedMedications.map((medication: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                {medication}
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem('medications', index)}
                                                    className="ml-1 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        name="emergency_contact_name"
                                        label="Emergency Contact Name"
                                        placeholder="Enter contact name"
                                    />
                                    <InputField
                                        name="emergency_contact_phone"
                                        label="Emergency Contact Phone"
                                        type="tel"
                                        placeholder="Enter contact phone"
                                    />
                                </div>
                            </div>

                            {/* Insurance Information */}
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField
                                        name="insurance_provider"
                                        label="Insurance Provider"
                                        placeholder="Enter insurance provider"
                                    />
                                    <InputField
                                        name="insurance_number"
                                        label="Insurance Number"
                                        placeholder="Enter insurance number"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mt-8">
                                <SelectField
                                    name="status"
                                    label="Patient Status"
                                    placeholder="Select status"
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' },
                                        { value: 'archived', label: 'Archived' },
                                    ]}
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="mt-8 flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formState.isSubmitting || isSubmitting}
                                >
                                    {formState.isSubmitting || isSubmitting ? 'Saving...' : (patient ? 'Update Patient' : 'Create Patient')}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </FormProvider>
    );
}
