import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash2, MapPin, AlertTriangle, Stethoscope, Scissors, Sparkles, User, Phone, Mail, Calendar, Heart, Pill, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    EnhancedInputField,
    SpecialtyField,
    MedicationField,
    ConditionField,
    AllergyField,
    InsuranceField
} from "@/components/forms/EnhancedFormFields";
import { getSmartSuggestions } from "@/data/autocompleteData";

export default function EnhancedPatientFormWithAutocomplete({ patient, onSubmit, onCancel, isSubmitting }: any) {
    const [formData, setFormData] = useState(patient || {
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        blood_type: "unknown",
        allergies: [],
        medical_conditions: [],
        surgical_history: [],
        medications: [],
        emergency_contact: {
            name: "",
            phone: "",
            relationship: ""
        },
        insurance_provider: "",
        insurance_id: "",
        status: "active"
    });

    const [newAllergy, setNewAllergy] = useState("");
    const [newCondition, setNewCondition] = useState("");
    const [newMedication, setNewMedication] = useState("");
    const [newSurgicalHistory, setNewSurgicalHistory] = useState("");

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addItemToList = (listName: string, value: string, setter: (value: string) => void) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [listName]: [...prev[listName], { id: Date.now().toString(), name: value.trim() }]
            }));
            setter("");
        }
    };

    const removeItemFromList = (listName: string, id: string) => {
        setFormData(prev => ({
            ...prev,
            [listName]: prev[listName].filter((item: any) => item.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Enhanced Patient Form</h2>
                    <p className="text-gray-600">Smart autocomplete makes form filling faster and more accurate</p>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">AI-Powered</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EnhancedInputField
                                name="first_name"
                                label="First Name"
                                placeholder="Enter first name"
                                value={formData.first_name}
                                onChange={(value) => handleInputChange('first_name', value)}
                                required
                            />
                            <EnhancedInputField
                                name="last_name"
                                label="Last Name"
                                placeholder="Enter last name"
                                value={formData.last_name}
                                onChange={(value) => handleInputChange('last_name', value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <input
                                    type="date"
                                    id="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="blood_type">Blood Type</Label>
                                <Select value={formData.blood_type} onValueChange={(value) => handleInputChange('blood_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                        <SelectItem value="unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EnhancedInputField
                                name="phone"
                                label="Phone Number"
                                placeholder="Enter phone number"
                                type="tel"
                                autocompleteType="phoneFormats"
                                value={formData.phone}
                                onChange={(value) => handleInputChange('phone', value)}
                                helpText="Smart suggestions for common phone formats"
                            />
                            <EnhancedInputField
                                name="email"
                                label="Email Address"
                                placeholder="Enter email address"
                                type="email"
                                value={formData.email}
                                onChange={(value) => handleInputChange('email', value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <EnhancedInputField
                                name="address"
                                label="Street Address"
                                placeholder="Enter street address"
                                autocompleteType="addresses"
                                value={formData.address}
                                onChange={(value) => handleInputChange('address', value)}
                                helpText="Smart address suggestions for faster entry"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <EnhancedInputField
                                    name="city"
                                    label="City"
                                    placeholder="Enter city"
                                    autocompleteType="addresses"
                                    value={formData.city}
                                    onChange={(value) => handleInputChange('city', value)}
                                />
                                <EnhancedInputField
                                    name="state"
                                    label="State"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChange={(value) => handleInputChange('state', value)}
                                />
                                <EnhancedInputField
                                    name="zip_code"
                                    label="ZIP Code"
                                    placeholder="Enter ZIP code"
                                    value={formData.zip_code}
                                    onChange={(value) => handleInputChange('zip_code', value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5" />
                            Medical Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Allergies */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                Allergies
                            </Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <AllergyField
                                        name="new_allergy"
                                        placeholder="Enter allergy (e.g., Penicillin, Shellfish)"
                                        value={newAllergy}
                                        onChange={setNewAllergy}
                                        className="flex-1"
                                        helpText="Smart suggestions for common allergies"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addItemToList('allergies', newAllergy, setNewAllergy)}
                                        disabled={!newAllergy.trim()}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.allergies.map((allergy: any) => (
                                        <Badge key={allergy.id} variant="destructive" className="flex items-center gap-1">
                                            {allergy.name}
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromList('allergies', allergy.id)}
                                                className="ml-1 hover:bg-red-600 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Medical Conditions */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                <Heart className="w-4 h-4 inline mr-1" />
                                Medical Conditions
                            </Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <ConditionField
                                        name="new_condition"
                                        placeholder="Enter medical condition (e.g., Hypertension, Diabetes)"
                                        value={newCondition}
                                        onChange={setNewCondition}
                                        className="flex-1"
                                        helpText="Smart suggestions for common medical conditions"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addItemToList('medical_conditions', newCondition, setNewCondition)}
                                        disabled={!newCondition.trim()}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.medical_conditions.map((condition: any) => (
                                        <Badge key={condition.id} variant="secondary" className="flex items-center gap-1">
                                            {condition.name}
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromList('medical_conditions', condition.id)}
                                                className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                <Pill className="w-4 h-4 inline mr-1" />
                                Current Medications
                            </Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <MedicationField
                                        name="new_medication"
                                        placeholder="Enter medication (e.g., Metformin, Lisinopril)"
                                        value={newMedication}
                                        onChange={setNewMedication}
                                        className="flex-1"
                                        helpText="Smart suggestions for common medications with dosages"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addItemToList('medications', newMedication, setNewMedication)}
                                        disabled={!newMedication.trim()}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.medications.map((medication: any) => (
                                        <Badge key={medication.id} variant="outline" className="flex items-center gap-1">
                                            {medication.name}
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromList('medications', medication.id)}
                                                className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Surgical History */}
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                <Scissors className="w-4 h-4 inline mr-1" />
                                Surgical History
                            </Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <EnhancedInputField
                                        name="new_surgical"
                                        placeholder="Enter surgical procedure (e.g., Appendectomy, Colonoscopy)"
                                        autocompleteType="procedures"
                                        value={newSurgicalHistory}
                                        onChange={setNewSurgicalHistory}
                                        className="flex-1"
                                        helpText="Smart suggestions for common surgical procedures"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addItemToList('surgical_history', newSurgicalHistory, setNewSurgicalHistory)}
                                        disabled={!newSurgicalHistory.trim()}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.surgical_history.map((surgery: any) => (
                                        <Badge key={surgery.id} variant="outline" className="flex items-center gap-1">
                                            {surgery.name}
                                            <button
                                                type="button"
                                                onClick={() => removeItemFromList('surgical_history', surgery.id)}
                                                className="ml-1 hover:bg-gray-600 rounded-full p-0.5"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Insurance Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Insurance Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InsuranceField
                                name="insurance_provider"
                                label="Insurance Provider"
                                placeholder="Enter insurance provider"
                                value={formData.insurance_provider}
                                onChange={(value) => handleInputChange('insurance_provider', value)}
                                helpText="Smart suggestions for common insurance providers"
                            />
                            <EnhancedInputField
                                name="insurance_id"
                                label="Insurance ID"
                                placeholder="Enter insurance ID"
                                value={formData.insurance_id}
                                onChange={(value) => handleInputChange('insurance_id', value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EnhancedInputField
                                name="emergency_name"
                                label="Contact Name"
                                placeholder="Enter emergency contact name"
                                value={formData.emergency_contact.name}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    emergency_contact: { ...prev.emergency_contact, name: value }
                                }))}
                            />
                            <EnhancedInputField
                                name="emergency_phone"
                                label="Contact Phone"
                                placeholder="Enter emergency contact phone"
                                type="tel"
                                autocompleteType="phoneFormats"
                                value={formData.emergency_contact.phone}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    emergency_contact: { ...prev.emergency_contact, phone: value }
                                }))}
                            />
                            <EnhancedInputField
                                name="emergency_relationship"
                                label="Relationship"
                                placeholder="Enter relationship (e.g., Spouse, Parent)"
                                value={formData.emergency_contact.relationship}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    emergency_contact: { ...prev.emergency_contact, relationship: value }
                                }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Patient"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
