import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Printer, Search, Pill, Clock, Calendar, User, Phone, Sparkles } from "lucide-react";
import { EnhancedInputField, MedicationField, ConditionField } from "@/components/forms/EnhancedFormFields";
import { getSmartSuggestions } from "@/data/autocompleteData";

interface PrescriptionFormData {
    medication_name: string;
    dosage: string;
    dosage_unit: string;
    frequency: string;
    frequency_unit: string;
    quantity: string;
    refills: number;
    start_date: string;
    end_date: string;
    prescribing_doctor: string;
    pharmacy_name: string;
    pharmacy_phone: string;
    status: string;
    notes: string;
    special_instructions: string;
    indication: string;
    route: string;
    duration_days: string;
    monitoring_required: boolean;
    lab_monitoring: string;
    side_effects_to_watch: string;
}

interface PrescriptionFormProps {
    prescription?: PrescriptionFormData;
    onSubmit: (data: PrescriptionFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    patient?: any;
}

export default function EnhancedPrescriptionFormWithAutocomplete({
    prescription,
    onSubmit,
    onCancel,
    isSubmitting,
    patient
}: PrescriptionFormProps) {
    const [formData, setFormData] = useState<PrescriptionFormData>(prescription || {
        medication_name: "",
        dosage: "",
        dosage_unit: "mg",
        frequency: "",
        frequency_unit: "times per day",
        quantity: "",
        refills: 0,
        start_date: "",
        end_date: "",
        prescribing_doctor: "",
        pharmacy_name: "",
        pharmacy_phone: "",
        status: "active",
        notes: "",
        special_instructions: "",
        indication: "",
        route: "oral",
        duration_days: "",
        monitoring_required: false,
        lab_monitoring: "",
        side_effects_to_watch: ""
    });

    const [drugInteractions, setDrugInteractions] = useState([]);
    const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

    const handleInputChange = (field: keyof PrescriptionFormData, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMedicationSelect = (medication: any) => {
        if (medication) {
            setFormData(prev => ({
                ...prev,
                medication_name: medication.label,
                dosage: medication.dosage || "",
                indication: medication.category || ""
            }));

            // Check for drug interactions
            checkDrugInteractions(medication.label);
        }
    };

    const checkDrugInteractions = async (medicationName: string) => {
        if (!patient?.medications?.length) return;

        setIsCheckingInteractions(true);
        // Simulate API call for drug interaction checking
        setTimeout(() => {
            const interactions = [
                {
                    severity: "moderate",
                    message: `Potential interaction between ${medicationName} and patient's current medications`,
                    recommendation: "Monitor patient closely for adverse effects"
                }
            ];
            setDrugInteractions(interactions);
            setIsCheckingInteractions(false);
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const commonDosages = ["5", "10", "20", "25", "50", "100", "250", "500", "1000"];
    const commonFrequencies = ["1", "2", "3", "4", "6", "8", "12"];
    const commonRoutes = ["oral", "topical", "injection", "inhalation", "sublingual", "rectal"];
    const commonDosageUnits = ["mg", "g", "ml", "mcg", "units", "tablets", "capsules"];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Enhanced Prescription Form</h2>
                    <p className="text-gray-600">Smart autocomplete for medications, dosages, and indications</p>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">AI-Powered</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medication Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="w-5 h-5" />
                            Medication Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MedicationField
                                name="medication_name"
                                label="Medication Name *"
                                placeholder="Enter medication name (e.g., Metformin, Lisinopril)"
                                value={formData.medication_name}
                                onChange={(value) => handleInputChange('medication_name', value)}
                                onSelect={handleMedicationSelect}
                                required
                                helpText="Smart suggestions with dosages and categories"
                            />

                            <ConditionField
                                name="indication"
                                label="Indication *"
                                placeholder="Enter indication (e.g., Hypertension, Diabetes)"
                                value={formData.indication}
                                onChange={(value) => handleInputChange('indication', value)}
                                required
                                helpText="Smart suggestions for common medical conditions"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="dosage">Dosage</Label>
                                <Select value={formData.dosage} onValueChange={(value) => handleInputChange('dosage', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select dosage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commonDosages.map(dosage => (
                                            <SelectItem key={dosage} value={dosage}>{dosage}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="dosage_unit">Unit</Label>
                                <Select value={formData.dosage_unit} onValueChange={(value) => handleInputChange('dosage_unit', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commonDosageUnits.map(unit => (
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="route">Route</Label>
                                <Select value={formData.route} onValueChange={(value) => handleInputChange('route', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select route" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commonRoutes.map(route => (
                                            <SelectItem key={route} value={route}>{route}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="frequency">Frequency</Label>
                                <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commonFrequencies.map(freq => (
                                            <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="frequency_unit">Frequency Unit</Label>
                                <Select value={formData.frequency_unit} onValueChange={(value) => handleInputChange('frequency_unit', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="times per day">times per day</SelectItem>
                                        <SelectItem value="times per week">times per week</SelectItem>
                                        <SelectItem value="times per month">times per month</SelectItem>
                                        <SelectItem value="as needed">as needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prescription Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Prescription Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="30"
                                />
                            </div>

                            <div>
                                <Label htmlFor="refills">Refills</Label>
                                <input
                                    type="number"
                                    id="refills"
                                    value={formData.refills}
                                    onChange={(e) => handleInputChange('refills', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                    max="5"
                                />
                            </div>

                            <div>
                                <Label htmlFor="duration_days">Duration (days)</Label>
                                <input
                                    type="number"
                                    id="duration_days"
                                    value={formData.duration_days}
                                    onChange={(e) => handleInputChange('duration_days', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Start Date</Label>
                                <input
                                    type="date"
                                    id="start_date"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <Label htmlFor="end_date">End Date</Label>
                                <input
                                    type="date"
                                    id="end_date"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prescriber & Pharmacy Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Prescriber & Pharmacy Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EnhancedInputField
                                name="prescribing_doctor"
                                label="Prescribing Doctor"
                                placeholder="Enter doctor name"
                                value={formData.prescribing_doctor}
                                onChange={(value) => handleInputChange('prescribing_doctor', value)}
                            />

                            <EnhancedInputField
                                name="pharmacy_name"
                                label="Pharmacy Name"
                                placeholder="Enter pharmacy name"
                                value={formData.pharmacy_name}
                                onChange={(value) => handleInputChange('pharmacy_name', value)}
                            />
                        </div>

                        <EnhancedInputField
                            name="pharmacy_phone"
                            label="Pharmacy Phone"
                            placeholder="Enter pharmacy phone number"
                            type="tel"
                            autocompleteType="phoneFormats"
                            value={formData.pharmacy_phone}
                            onChange={(value) => handleInputChange('pharmacy_phone', value)}
                            helpText="Smart suggestions for phone number formats"
                        />
                    </CardContent>
                </Card>

                {/* Instructions & Monitoring */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Instructions & Monitoring
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="special_instructions">Special Instructions</Label>
                            <Textarea
                                id="special_instructions"
                                value={formData.special_instructions}
                                onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                placeholder="Enter special instructions for the patient..."
                                rows={3}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Enter additional notes..."
                                rows={2}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="lab_monitoring">Lab Monitoring Required</Label>
                                <Textarea
                                    id="lab_monitoring"
                                    value={formData.lab_monitoring}
                                    onChange={(e) => handleInputChange('lab_monitoring', e.target.value)}
                                    placeholder="e.g., Monitor liver function, check blood glucose"
                                    rows={2}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <Label htmlFor="side_effects_to_watch">Side Effects to Watch</Label>
                                <Textarea
                                    id="side_effects_to_watch"
                                    value={formData.side_effects_to_watch}
                                    onChange={(e) => handleInputChange('side_effects_to_watch', e.target.value)}
                                    placeholder="e.g., Nausea, dizziness, rash"
                                    rows={2}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Drug Interactions Alert */}
                {drugInteractions.length > 0 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <p className="font-medium">Drug Interaction Alert</p>
                                {drugInteractions.map((interaction: any, index) => (
                                    <div key={index} className="text-sm">
                                        <Badge variant={interaction.severity === 'severe' ? 'destructive' : 'secondary'} className="mr-2">
                                            {interaction.severity}
                                        </Badge>
                                        {interaction.message}
                                        {interaction.recommendation && (
                                            <p className="mt-1 text-xs text-gray-600">{interaction.recommendation}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Prescription"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
