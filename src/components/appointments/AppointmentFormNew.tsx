/**
 * Standardized AppointmentForm using react-hook-form + zod validation
 * Replaces the old AppointmentForm with proper validation and error handling
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { isAfter, parseISO } from 'date-fns';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useForm } from '@/hooks/useForm';
import { Form, InputField, TextareaField, SelectField, SwitchField } from '@/components/forms/FormFields';
import type { Appointment, Patient } from '@/types';

// Zod schema for appointment validation
const appointmentSchema = z.object({
    patient_id: z.string().min(1, 'Please select a patient'),
    patient_name: z.string().optional(),
    appointment_date: z.string().min(1, 'Appointment date is required').refine(
        (date) => {
            try {
                const appointmentDate = parseISO(date);
                const now = new Date();
                // Allow appointments up to 1 year in the future
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(now.getFullYear() + 1);

                return isAfter(appointmentDate, now) && isAfter(oneYearFromNow, appointmentDate);
            } catch {
                return false;
            }
        },
        'Appointment date must be in the future and within the next year'
    ),
    duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
    type: z.enum(['consultation', 'follow_up', 'procedure', 'emergency', 'checkup', 'telemedicine'], {
        required_error: 'Appointment type is required'
    }),
    status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
    reason: z.string().min(3, 'Reason must be at least 3 characters').max(500, 'Reason must be less than 500 characters'),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    provider: z.string().min(1, 'Provider is required'),
    is_recurring: z.boolean(),
    recurring_pattern: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
    recurring_end_date: z.string().optional(),
    reminder_sent: z.boolean().default(false),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
}).refine(
    (data) => {
        if (data.is_recurring && data.recurring_pattern !== 'none') {
            if (!data.recurring_end_date || data.recurring_end_date.length === 0) {
                return false;
            }
            try {
                const endDate = parseISO(data.recurring_end_date);
                const appointmentDate = parseISO(data.appointment_date);
                return isAfter(endDate, appointmentDate);
            } catch {
                return false;
            }
        }
        return true;
    },
    {
        message: 'Recurring end date must be after the appointment date',
        path: ['recurring_end_date'],
    }
);

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
    appointment?: Appointment | null;
    patients: Patient[];
    onSubmit: (data: AppointmentFormData) => Promise<void> | void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function AppointmentForm({ appointment, patients, onSubmit, onCancel, isSubmitting = false }: AppointmentFormProps) {
    // Convert appointment data to form format
    const getDefaultValues = (): Partial<AppointmentFormData> => {
        if (!appointment) {
            return {
                duration: 30,
                type: 'checkup',
                status: 'scheduled',
                is_recurring: false,
                recurring_pattern: 'none',
                reminder_sent: false,
                priority: 'normal',
            };
        }

        return {
            patient_id: appointment.patient_id || '',
            patient_name: appointment.patient_name || '',
            appointment_date: appointment.appointment_date || '',
            duration: appointment.duration || 30,
            type: appointment.type || 'checkup',
            status: appointment.status || 'scheduled',
            reason: appointment.reason || '',
            notes: appointment.notes || '',
            provider: appointment.provider || '',
            is_recurring: appointment.is_recurring || false,
            recurring_pattern: (appointment.recurring_pattern as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly') || 'none',
            recurring_end_date: appointment.recurring_end_date || '',
            reminder_sent: appointment.reminder_sent || false,
            priority: (appointment.priority as 'low' | 'normal' | 'high' | 'urgent') || 'normal',
        };
    };

    const form = useForm({
        schema: appointmentSchema,
        onSubmit,
        defaultValues: getDefaultValues(),
    });

    const { watch, formState } = form;
    const watchedIsRecurring = watch('is_recurring');
    const watchedRecurringPattern = watch('recurring_pattern');

    // Update patient name when patient is selected
    // Remove unused function
    // const handlePatientChange = (patientId: string) => {
    //     const selectedPatient = patients.find(p => p.id === patientId);
    //     if (selectedPatient) {
    //         setValue('patient_name', `${selectedPatient.first_name} ${selectedPatient.last_name}`);
    //     }
    // };

    return (
        <FormProvider {...form.form}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-semibold">
                            {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={form.handleSubmit}>
                            <div className="space-y-6">
                                {/* Patient Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>

                                    <SelectField
                                        name="patient_id"
                                        label="Select Patient"
                                        placeholder="Choose a patient"
                                        required
                                        options={patients.map(patient => ({
                                            value: patient.id,
                                            label: `${patient.first_name} ${patient.last_name}`,
                                        }))}
                                    />
                                </div>

                                {/* Appointment Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="appointment_date"
                                            label="Date & Time"
                                            type="datetime-local"
                                            required
                                        />
                                        <InputField
                                            name="duration"
                                            label="Duration (minutes)"
                                            type="number"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="type"
                                            label="Appointment Type"
                                            placeholder="Select type"
                                            required
                                            options={[
                                                { value: 'consultation', label: 'Consultation' },
                                                { value: 'follow_up', label: 'Follow-up' },
                                                { value: 'procedure', label: 'Procedure' },
                                                { value: 'emergency', label: 'Emergency' },
                                                { value: 'checkup', label: 'Checkup' },
                                                { value: 'telemedicine', label: 'Telemedicine' },
                                            ]}
                                        />
                                        <SelectField
                                            name="priority"
                                            label="Priority"
                                            placeholder="Select priority"
                                            options={[
                                                { value: 'low', label: 'Low' },
                                                { value: 'normal', label: 'Normal' },
                                                { value: 'high', label: 'High' },
                                                { value: 'urgent', label: 'Urgent' },
                                            ]}
                                        />
                                    </div>

                                    <TextareaField
                                        name="reason"
                                        label="Reason for Appointment"
                                        placeholder="Describe the reason for this appointment"
                                        required
                                        rows={3}
                                    />

                                    <TextareaField
                                        name="notes"
                                        label="Additional Notes"
                                        placeholder="Any additional notes or special instructions"
                                        rows={2}
                                    />

                                    <InputField
                                        name="provider"
                                        label="Provider"
                                        placeholder="Enter provider name"
                                    />
                                </div>

                                {/* Recurring Appointment */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Recurring Appointment</h3>

                                    <SwitchField
                                        name="is_recurring"
                                        text="This is a recurring appointment"
                                    />

                                    {watchedIsRecurring && (
                                        <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                                            <SelectField
                                                name="recurring_pattern"
                                                label="Recurring Pattern"
                                                placeholder="Select pattern"
                                                options={[
                                                    { value: 'none', label: 'None' },
                                                    { value: 'daily', label: 'Daily' },
                                                    { value: 'weekly', label: 'Weekly' },
                                                    { value: 'monthly', label: 'Monthly' },
                                                    { value: 'yearly', label: 'Yearly' },
                                                ]}
                                            />

                                            {watchedRecurringPattern !== 'none' && (
                                                <InputField
                                                    name="recurring_end_date"
                                                    label="End Date"
                                                    type="date"
                                                    required
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Status and Reminders */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Status & Reminders</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="status"
                                            label="Status"
                                            placeholder="Select status"
                                            options={[
                                                { value: 'scheduled', label: 'Scheduled' },
                                                { value: 'confirmed', label: 'Confirmed' },
                                                { value: 'in_progress', label: 'In Progress' },
                                                { value: 'completed', label: 'Completed' },
                                                { value: 'cancelled', label: 'Cancelled' },
                                                { value: 'no_show', label: 'No Show' },
                                            ]}
                                        />

                                        <div className="flex items-center space-x-2">
                                            <SwitchField
                                                name="reminder_sent"
                                                text="Reminder sent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end space-x-4 pt-6 border-t">
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={formState.isSubmitting || isSubmitting}
                                    >
                                        {formState.isSubmitting || isSubmitting ? 'Saving...' : (appointment ? 'Update Appointment' : 'Schedule Appointment')}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </FormProvider>
    );
}
