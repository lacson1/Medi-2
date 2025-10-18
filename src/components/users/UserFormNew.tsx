/**
 * Standardized UserForm using react-hook-form + zod validation
 * Replaces the old UserForm with proper validation and error handling
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useForm } from '@/hooks/useForm';
import { Form, InputField, TextareaField, SelectField, CheckboxField } from '@/components/forms/FormFields';
import type { User } from '@/types';

// Zod schema for user validation
const userSchema = z.object({
    first_name: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    last_name: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional().refine((val) => !val || /^[+]?[1-9][\d]{0,15}$/.test(val), 'Invalid phone number'),
    mobile: z.string().optional().refine((val) => !val || /^[+]?[1-9][\d]{0,15}$/.test(val), 'Invalid mobile number'),
    job_title: z.string().optional(),
    user_role: z.enum(['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'LabTech', 'Billing', 'Receptionist'], {
        required_error: 'User role is required'
    }),
    department: z.string().optional(),
    specialization: z.string().optional(),
    license_number: z.string().optional(),
    license_expiry: z.string().optional(),
    qualifications: z.array(z.string()).default([]),
    certifications: z.array(z.string()).default([]),
    years_of_experience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
    languages: z.array(z.string()).default([]),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
    emergency_contact: z.object({
        name: z.string().optional(),
        relationship: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
    employment_type: z.enum(['full_time', 'part_time', 'contract', 'consultant']).default('full_time'),
    date_of_joining: z.string().optional(),
    shift: z.enum(['day', 'night', 'rotating']),
    availability: z.object({
        monday: z.boolean().default(true),
        tuesday: z.boolean().default(true),
        wednesday: z.boolean().default(true),
        thursday: z.boolean().default(true),
        friday: z.boolean().default(true),
        saturday: z.boolean().default(false),
        sunday: z.boolean().default(false),
    }).optional(),
    status: z.enum(['active', 'inactive', 'suspended']),
    profile_picture_url: z.string().optional(),
    bio: z.string().optional(),
    consultation_fee: z.number().min(0, 'Consultation fee cannot be negative').optional(),
    npi_number: z.string().optional(),
    dea_number: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    user?: User | null;
    onSubmit: (data: UserFormData) => Promise<void> | void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function UserForm({ user, onSubmit, onCancel, isSubmitting = false }: UserFormProps) {
    // Convert user data to form format
    const getDefaultValues = (): Partial<UserFormData> => {
        if (!user) {
            return {
                user_role: 'Doctor',
                department: 'medical',
                employment_type: 'full_time',
                date_of_joining: new Date().toISOString().split('T')[0],
                shift: 'day',
                status: 'active',
                years_of_experience: 0,
                qualifications: [],
                certifications: [],
                languages: [],
                availability: {
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: false,
                    sunday: false,
                },
                address: {
                    street: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: '',
                },
                emergency_contact: {
                    name: '',
                    relationship: '',
                    phone: '',
                },
            };
        }

        return {
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            mobile: user.mobile || '',
            job_title: user.job_title || '',
            user_role: user.role || 'Doctor',
            department: user.department || 'medical',
            specialization: user.specialization || '',
            license_number: user.license_number || '',
            license_expiry: user.license_expiry || '',
            qualifications: user.qualifications || [],
            certifications: user.certifications || [],
            years_of_experience: user.years_of_experience || 0,
            languages: user.languages || [],
            address: user.address || {
                street: '',
                city: '',
                state: '',
                postal_code: '',
                country: '',
            },
            emergency_contact: user.emergency_contact || {
                name: '',
                relationship: '',
                phone: '',
            },
            employment_type: user.employment_type || 'full_time',
            date_of_joining: user.date_of_joining || new Date().toISOString().split('T')[0],
            shift: user.shift || 'day',
            availability: user.availability || {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false,
            },
            status: user.status || 'active',
            profile_picture_url: user.profile_picture_url || '',
            bio: user.bio || '',
            consultation_fee: user.consultation_fee || 0,
            npi_number: user.npi_number || '',
            dea_number: user.dea_number || '',
        };
    };

    const form = useForm({
        schema: userSchema,
        onSubmit,
        defaultValues: getDefaultValues() as z.infer<typeof userSchema>,
    });

    const { watch, setValue, formState } = form;
    const watchedQualifications = watch('qualifications');
    const watchedCertifications = watch('certifications');
    const watchedLanguages = watch('languages');

    // Helper functions for managing arrays
    const addItem = (field: 'qualifications' | 'certifications' | 'languages', value: string) => {
        if (value.trim()) {
            const currentItems = watch(field);
            setValue(field, [...currentItems, value.trim()]);
        }
    };

    const removeItem = (field: 'qualifications' | 'certifications' | 'languages', index: number) => {
        const currentItems = watch(field);
        setValue(field, currentItems.filter((_, i) => i !== index));
    };

    // Remove unused function
    // const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;

    //     try {
    //         const { file_url } = await (mockApiClient.integrations as any).Core.UploadFile({ file });
    //         setValue('profile_picture_url', file_url);
    //     } catch (error) {
    //         console.error('Failed to upload photo:', error);
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
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-semibold">
                            {user ? 'Edit User' : 'Add New User'}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={form.handleSubmit}>
                            <Tabs defaultValue="basic" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                    <TabsTrigger value="professional">Professional</TabsTrigger>
                                    <TabsTrigger value="contact">Contact</TabsTrigger>
                                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                </TabsList>

                                {/* Basic Information Tab */}
                                <TabsContent value="basic" className="space-y-6">
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

                                    <InputField
                                        name="email"
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter email address"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="phone"
                                            label="Phone Number"
                                            type="tel"
                                            placeholder="Enter phone number"
                                        />
                                        <InputField
                                            name="mobile"
                                            label="Mobile Number"
                                            type="tel"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="user_role"
                                            label="User Role"
                                            placeholder="Select role"
                                            required
                                            options={[
                                                { value: 'SuperAdmin', label: 'Super Admin' },
                                                { value: 'Admin', label: 'Admin' },
                                                { value: 'Doctor', label: 'Doctor' },
                                                { value: 'Nurse', label: 'Nurse' },
                                                { value: 'LabTech', label: 'Lab Technician' },
                                                { value: 'Billing', label: 'Billing' },
                                                { value: 'Receptionist', label: 'Receptionist' },
                                            ]}
                                        />
                                        <SelectField
                                            name="status"
                                            label="Status"
                                            placeholder="Select status"
                                            options={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'inactive', label: 'Inactive' },
                                                { value: 'suspended', label: 'Suspended' },
                                            ]}
                                        />
                                    </div>

                                    <TextareaField
                                        name="bio"
                                        label="Bio"
                                        placeholder="Enter user bio"
                                        rows={3}
                                    />
                                </TabsContent>

                                {/* Professional Information Tab */}
                                <TabsContent value="professional" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="job_title"
                                            label="Job Title"
                                            placeholder="Enter job title"
                                        />
                                        <InputField
                                            name="department"
                                            label="Department"
                                            placeholder="Enter department"
                                        />
                                    </div>

                                    <InputField
                                        name="specialization"
                                        label="Specialization"
                                        placeholder="Enter specialization"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="license_number"
                                            label="License Number"
                                            placeholder="Enter license number"
                                        />
                                        <InputField
                                            name="license_expiry"
                                            label="License Expiry"
                                            type="date"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="years_of_experience"
                                            label="Years of Experience"
                                            type="number"
                                            placeholder="Enter years of experience"
                                        />
                                        <InputField
                                            name="consultation_fee"
                                            label="Consultation Fee"
                                            type="number"
                                            placeholder="Enter consultation fee"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            name="npi_number"
                                            label="NPI Number"
                                            placeholder="Enter NPI number"
                                        />
                                        <InputField
                                            name="dea_number"
                                            label="DEA Number"
                                            placeholder="Enter DEA number"
                                        />
                                    </div>

                                    {/* Qualifications */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Qualifications</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add qualification"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addItem('qualifications', e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const input = document.querySelector('input[placeholder="Add qualification"]') as HTMLInputElement;
                                                    if (input) {
                                                        addItem('qualifications', input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {watchedQualifications.map((qualification, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {qualification}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem('qualifications', index)}
                                                        className="ml-1 hover:text-red-600"
                                                        title="Remove qualification"
                                                        aria-label={`Remove ${qualification} qualification`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Certifications */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Certifications</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add certification"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addItem('certifications', e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const input = document.querySelector('input[placeholder="Add certification"]') as HTMLInputElement;
                                                    if (input) {
                                                        addItem('certifications', input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {watchedCertifications.map((certification, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {certification}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem('certifications', index)}
                                                        className="ml-1 hover:text-red-600"
                                                        title="Remove certification"
                                                        aria-label={`Remove ${certification} certification`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Languages */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700">Languages</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add language"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addItem('languages', e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const input = document.querySelector('input[placeholder="Add language"]') as HTMLInputElement;
                                                    if (input) {
                                                        addItem('languages', input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {watchedLanguages.map((language, index) => (
                                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                    {language}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem('languages', index)}
                                                        className="ml-1 hover:text-red-600"
                                                        title="Remove language"
                                                        aria-label={`Remove ${language} language`}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Contact Information Tab */}
                                <TabsContent value="contact" className="space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900">Address</h4>
                                        <TextareaField
                                            name="address.street"
                                            label="Street Address"
                                            placeholder="Enter street address"
                                            rows={2}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                name="address.city"
                                                label="City"
                                                placeholder="Enter city"
                                            />
                                            <InputField
                                                name="address.state"
                                                label="State"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                name="address.postal_code"
                                                label="Postal Code"
                                                placeholder="Enter postal code"
                                            />
                                            <InputField
                                                name="address.country"
                                                label="Country"
                                                placeholder="Enter country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900">Emergency Contact</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                name="emergency_contact.name"
                                                label="Contact Name"
                                                placeholder="Enter contact name"
                                            />
                                            <InputField
                                                name="emergency_contact.relationship"
                                                label="Relationship"
                                                placeholder="Enter relationship"
                                            />
                                        </div>
                                        <InputField
                                            name="emergency_contact.phone"
                                            label="Contact Phone"
                                            type="tel"
                                            placeholder="Enter contact phone"
                                        />
                                    </div>
                                </TabsContent>

                                {/* Schedule Tab */}
                                <TabsContent value="schedule" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="employment_type"
                                            label="Employment Type"
                                            placeholder="Select employment type"
                                            options={[
                                                { value: 'full_time', label: 'Full Time' },
                                                { value: 'part_time', label: 'Part Time' },
                                                { value: 'contract', label: 'Contract' },
                                                { value: 'consultant', label: 'Consultant' },
                                            ]}
                                        />
                                        <SelectField
                                            name="shift"
                                            label="Shift"
                                            placeholder="Select shift"
                                            options={[
                                                { value: 'day', label: 'Day' },
                                                { value: 'night', label: 'Night' },
                                                { value: 'rotating', label: 'Rotating' },
                                            ]}
                                        />
                                    </div>

                                    <InputField
                                        name="date_of_joining"
                                        label="Date of Joining"
                                        type="date"
                                    />

                                    <div className="space-y-4">
                                        <h4 className="text-md font-medium text-gray-900">Weekly Availability</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day: any) => (
                                                <CheckboxField
                                                    key={day}
                                                    name={`availability.${day}`}
                                                    text={day.charAt(0).toUpperCase() + day.slice(1)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Form Actions */}
                            <div className="mt-8 flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formState.isSubmitting || isSubmitting}
                                >
                                    {formState.isSubmitting || isSubmitting ? 'Saving...' : (user ? 'Update User' : 'Create User')}
                                </Button>
                            </div>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </FormProvider>
    );
}
