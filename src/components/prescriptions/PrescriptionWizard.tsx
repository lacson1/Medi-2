import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Pill,
  ClipboardCheck,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { medications } from '@/data/medications';
import { toast } from 'sonner';

interface PrescriptionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  patients: any[];
  initialData?: any;
}

const steps = [
  { id: 'patient', title: 'Patient Info', icon: User },
  { id: 'medication', title: 'Medication', icon: Pill },
  { id: 'review', title: 'Review', icon: ClipboardCheck },
];

export default function PrescriptionWizard({
  open,
  onOpenChange,
  onSubmit,
  patients,
  initialData,
}: PrescriptionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    patient_id: initialData?.patient_id || '',
    medication_name: initialData?.medication_name || '',
    dosage: initialData?.dosage || '',
    dosage_unit: initialData?.dosage_unit || 'mg',
    frequency: initialData?.frequency || '',
    frequency_unit: initialData?.frequency_unit || 'daily',
    quantity: initialData?.quantity || '',
    refills: initialData?.refills || 0,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    duration_days: initialData?.duration_days || '',
    indication: initialData?.indication || '',
    special_instructions: initialData?.special_instructions || '',
    notes: initialData?.notes || '',
  });

  const [medicationSuggestions, setMedicationSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [drugInteractions, setDrugInteractions] = useState<string[]>([]);
  const [allergyAlerts, setAllergyAlerts] = useState<string[]>([]);

  const selectedPatient = patients.find(p => p.id === formData.patient_id);
  const selectedMedication = medications.find(
    m => m.name.toLowerCase() === formData.medication_name.toLowerCase()
  );

  // Medication search
  const handleMedicationSearch = (value: string) => {
    setFormData({ ...formData, medication_name: value });

    if (value.length > 1) {
      const suggestions = medications
        .filter(med => med.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setMedicationSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Check for drug interactions and allergies
    if (selectedPatient) {
      checkSafetyAlerts(value);
    }
  };

  const checkSafetyAlerts = (medicationName: string) => {
    const alerts: string[] = [];
    const allergies: string[] = [];

    // Mock drug interaction check
    if (medicationName.toLowerCase().includes('warfarin')) {
      alerts.push('Potential interaction with aspirin');
    }

    // Mock allergy check
    if (selectedPatient?.allergies) {
      selectedPatient.allergies.forEach((allergy: string) => {
        if (medicationName.toLowerCase().includes(allergy.toLowerCase())) {
          allergies.push(`Patient has documented allergy to ${allergy}`);
        }
      });
    }

    setDrugInteractions(alerts);
    setAllergyAlerts(allergies);
  };

  const selectMedication = (medication: any) => {
    setFormData({
      ...formData,
      medication_name: medication.name,
      dosage: medication.dosage?.split(',')[0] || '',
      frequency: medication.frequency || '',
      indication: medication.indication || '',
    });
    setShowSuggestions(false);
    if (selectedPatient) {
      checkSafetyAlerts(medication.name);
    }
  };

  const handleNext = () => {
    // Validation
    if (currentStep === 0 && !formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (currentStep === 1 && !formData.medication_name) {
      toast.error('Please enter a medication');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      status: 'active',
      prescribing_doctor: 'Dr. Smith', // In real app, get from auth context
    });
    toast.success('Prescription created successfully');
    onOpenChange(false);
    setCurrentStep(0);
    setFormData({
      patient_id: '',
      medication_name: '',
      dosage: '',
      dosage_unit: 'mg',
      frequency: '',
      frequency_unit: 'daily',
      quantity: '',
      refills: 0,
      start_date: new Date().toISOString().split('T')[0],
      duration_days: '',
      indication: '',
      special_instructions: '',
      notes: '',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Patient Info
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Select Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - DOB: {patient.date_of_birth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPatient && (
              <Card className="mt-4">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Patient Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span> {selectedPatient.age || 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span> {selectedPatient.gender || 'N/A'}
                    </div>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div className="col-span-2 mt-2">
                        <span className="text-gray-600">Allergies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.allergies.map((allergy: string, idx: number) => (
                            <Badge key={idx} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1: // Medication Selection
        return (
          <div className="space-y-4">
            {(drugInteractions.length > 0 || allergyAlerts.length > 0) && (
              <div className="space-y-2">
                {allergyAlerts.map((alert, idx) => (
                  <Alert key={idx} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{alert}</AlertDescription>
                  </Alert>
                ))}
                {drugInteractions.map((interaction, idx) => (
                  <Alert key={idx}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{interaction}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="medication">Medication Name *</Label>
              <div className="relative">
                <Input
                  id="medication"
                  value={formData.medication_name}
                  onChange={(e) => handleMedicationSearch(e.target.value)}
                  placeholder="Search medication..."
                  className="pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                {showSuggestions && medicationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {medicationSuggestions.map((med, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectMedication(med)}
                      >
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-gray-600">{med.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500"
                  />
                  <Select
                    value={formData.dosage_unit}
                    onValueChange={(value) => setFormData({ ...formData, dosage_unit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg">mg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="units">units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="e.g., Once daily"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refills">Refills</Label>
                <Input
                  id="refills"
                  type="number"
                  min="0"
                  max="5"
                  value={formData.refills}
                  onChange={(e) =>
                    setFormData({ ...formData, refills: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="indication">Indication</Label>
              <Input
                id="indication"
                value={formData.indication}
                onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                placeholder="e.g., Hypertension"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.special_instructions}
                onChange={(e) =>
                  setFormData({ ...formData, special_instructions: e.target.value })
                }
                placeholder="Patient instructions..."
                rows={3}
              />
            </div>
          </div>
        );

      case 2: // Review
        return (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-3">Review Prescription</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">
                      {selectedPatient
                        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                        : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medication:</span>
                    <span className="font-medium">{formData.medication_name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dosage:</span>
                    <span className="font-medium">
                      {formData.dosage} {formData.dosage_unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium">{formData.frequency}</span>
                  </div>
                  {formData.quantity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{formData.quantity}</span>
                    </div>
                  )}
                  {formData.refills > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Refills:</span>
                      <span className="font-medium">{formData.refills}</span>
                    </div>
                  )}
                  {formData.indication && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Indication:</span>
                      <span className="font-medium">{formData.indication}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {allergyAlerts.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please review allergy alerts before submitting.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Prescription</DialogTitle>
          <DialogDescription>
            Create a new prescription in {steps.length} simple steps
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full mx-2 ${
                      index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={allergyAlerts.length > 0}>
                Submit Prescription
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

