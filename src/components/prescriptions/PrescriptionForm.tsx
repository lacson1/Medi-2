import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, Printer, Search } from "lucide-react";
import { medications, commonIndications, commonDosages, commonFrequencies } from "@/data/medications";
import { useAuth } from "@/contexts/AuthContext";

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

interface DrugInteraction {
  severity: string;
  message: string;
  recommendation?: string;
}

interface PrescriptionFormProps {
  prescription?: PrescriptionFormData;
  onSubmit: (data: PrescriptionFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patient?: any;
}

export default function PrescriptionForm({ prescription, onSubmit, onCancel, isSubmitting, patient }: PrescriptionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PrescriptionFormData>(prescription || {
    medication_name: "",
    dosage: "",
    dosage_unit: "mg",
    frequency: "",
    frequency_unit: "daily",
    quantity: "",
    refills: 0,
    start_date: new Date().toISOString().split('T')[0] || "",
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

  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [allergyAlerts, setAllergyAlerts] = useState<DrugInteraction[]>([]);
  const [dosageAlerts, setDosageAlerts] = useState<DrugInteraction[]>([]);

  // Auto-complete states
  const [medicationSuggestions, setMedicationSuggestions] = useState<any[]>([]);
  const [indicationSuggestions, setIndicationSuggestions] = useState<string[]>([]);
  const [dosageSuggestions, setDosageSuggestions] = useState<string[]>([]);
  const [frequencySuggestions, setFrequencySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState({
    medication: false,
    indication: false,
    dosage: false,
    frequency: false
  });

  const checkDrugInteractions = useCallback(() => {
    try {
      const commonInteractions: Record<string, string[]> = {
        'warfarin': ['aspirin', 'ibuprofen', 'acetaminophen'],
        'digoxin': ['furosemide', 'hydrochlorothiazide'],
        'metformin': ['alcohol', 'contrast dye'],
        'lithium': ['diuretics', 'nsaids'],
        'phenytoin': ['warfarin', 'oral contraceptives'],
        'carbamazepine': ['warfarin', 'oral contraceptives'],
        'cyclosporine': ['grapefruit', 'st johns wort'],
        'theophylline': ['cimetidine', 'ciprofloxacin'],
        'methotrexate': ['nsaids', 'aspirin'],
        'allopurinol': ['warfarin', 'azathioprine']
      };

      const interactions: DrugInteraction[] = [];
      const medication = formData.medication_name.toLowerCase();

      if (!medication) {
        setDrugInteractions([]);
        return;
      }

      Object.keys(commonInteractions).forEach(drug => {
        if (medication.includes(drug) && patient?.current_medications) {
          const patientMeds = patient.current_medications.map((med: any) => med.toLowerCase());
          commonInteractions[drug].forEach(interactingDrug => {
            if (patientMeds.some((med: any) => med.includes(interactingDrug))) {
              interactions.push({
                severity: 'moderate',
                message: `${drug} may interact with ${interactingDrug}. Monitor closely.`,
                recommendation: 'Consider alternative medication or close monitoring'
              });
            }
          });
        }
      });

      setDrugInteractions(interactions);
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      setDrugInteractions([{
        severity: 'warning',
        message: 'Unable to check drug interactions. Please verify manually.',
        recommendation: 'Consult drug interaction database'
      }]);
    }
  }, [formData.medication_name, patient]);

  const checkAllergies = useCallback(() => {
    const alerts: DrugInteraction[] = [];
    if (patient?.allergies && formData.medication_name) {
      const medication = formData.medication_name.toLowerCase();
      patient.allergies.forEach((allergy: any) => {
        if (medication.includes(allergy.toLowerCase())) {
          alerts.push({
            severity: 'critical',
            message: `Patient has documented allergy to ${allergy}`
          });
        }
      });
    }
    setAllergyAlerts(alerts);
  }, [formData.medication_name, patient]);

  const checkDosageGuidelines = useCallback(() => {
    const alerts: DrugInteraction[] = [];
    const dosage = parseFloat(formData.dosage);
    const age = patient?.age;

    // Geriatric dosing alerts
    if (age > 65 && dosage > 0) {
      const geriatricMedications = ['digoxin', 'warfarin', 'metformin'];
      const medication = formData.medication_name.toLowerCase();

      geriatricMedications.forEach(med => {
        if (medication.includes(med)) {
          alerts.push({
            severity: 'warning',
            message: `Consider reduced dosing for geriatric patient (age ${age})`
          });
        }
      });
    }

    setDosageAlerts(alerts);
  }, [formData.dosage, formData.medication_name, patient]);

  // Check for drug interactions and allergies
  useEffect(() => {
    if (formData.medication_name && patient) {
      checkDrugInteractions();
      checkAllergies();
      checkDosageGuidelines();
    }
  }, [formData.medication_name, formData.dosage, patient, checkDrugInteractions, checkAllergies, checkDosageGuidelines]);

  // Auto-complete functions
  const handleMedicationInput = (value: string) => {
    setFormData({ ...formData, medication_name: value });

    if (value.length > 1) {
      const suggestions = medications.filter(med =>
        med.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setMedicationSuggestions(suggestions);
      setShowSuggestions({ ...showSuggestions, medication: true });
    } else {
      setShowSuggestions({ ...showSuggestions, medication: false });
    }
  };

  const handleIndicationInput = (value: string) => {
    setFormData({ ...formData, indication: value });

    if (value.length > 1) {
      const suggestions = commonIndications.filter(indication =>
        indication.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setIndicationSuggestions(suggestions);
      setShowSuggestions({ ...showSuggestions, indication: true });
    } else {
      setShowSuggestions({ ...showSuggestions, indication: false });
    }
  };

  const handleDosageInput = (value: string) => {
    setFormData({ ...formData, dosage: value });

    if (value.length > 0) {
      const suggestions = commonDosages.filter(dosage =>
        dosage.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setDosageSuggestions(suggestions);
      setShowSuggestions({ ...showSuggestions, dosage: true });
    } else {
      setShowSuggestions({ ...showSuggestions, dosage: false });
    }
  };

  const handleFrequencyInput = (value: string) => {
    setFormData({ ...formData, frequency: value });

    if (value.length > 1) {
      const suggestions = commonFrequencies.filter(frequency =>
        frequency.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6);
      setFrequencySuggestions(suggestions);
      setShowSuggestions({ ...showSuggestions, frequency: true });
    } else {
      setShowSuggestions({ ...showSuggestions, frequency: false });
    }
  };

  const selectSuggestion = (type: string, suggestion: any) => {
    if (type === 'medication') {
      setFormData({ ...formData, medication_name: suggestion.name });
      // Auto-fill related fields if available
      if (suggestion.dosage) {
        setFormData(prev => ({ ...prev, dosage: suggestion.dosage.split(',')[0] }));
      }
      if (suggestion.frequency) {
        setFormData(prev => ({ ...prev, frequency: suggestion.frequency }));
      }
      if (suggestion.indication) {
        setFormData(prev => ({ ...prev, indication: suggestion.indication }));
      }
    } else {
      setFormData({ ...formData, [type]: suggestion });
    }
    setShowSuggestions({ ...showSuggestions, [type]: false });
  };

  // Print prescription function
  const printPrescription = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .patient-info { margin-bottom: 20px; }
              .prescription-details { margin-bottom: 20px; }
              .signature { margin-top: 50px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>PRESCRIPTION</h2>
            </div>
            <div class="patient-info">
              <p><strong>Patient:</strong> ${patient?.first_name || ''} ${patient?.last_name || ''}</p>
              <p><strong>DOB:</strong> ${patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : ''}</p>
              <p><strong>Address:</strong> ${patient?.address || ''}</p>
              <p><strong>Phone:</strong> ${patient?.phone || ''}</p>
            </div>
            <div class="prescription-details">
              <p><strong>Medication:</strong> ${formData.medication_name}</p>
              <p><strong>Dosage:</strong> ${formData.dosage} ${formData.dosage_unit}</p>
              <p><strong>Frequency:</strong> ${formData.frequency}</p>
              <p><strong>Quantity:</strong> ${formData.quantity}</p>
              <p><strong>Refills:</strong> ${formData.refills}</p>
              <p><strong>Instructions:</strong> ${formData.special_instructions}</p>
            </div>
            <div class="signature">
              <p><strong>Prescribed by:</strong> ${user?.first_name || 'Dr. Smith'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Prescription Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drug Interaction and Allergy Alerts */}
            {(drugInteractions.length > 0 || allergyAlerts.length > 0 || dosageAlerts.length > 0) && (
              <div className="space-y-3">
                {drugInteractions.map((interaction, index) => (
                  <Alert key={index} variant={interaction.severity === 'severe' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{interaction.severity.toUpperCase()}:</strong> {interaction.message}
                      {interaction.recommendation && (
                        <div className="mt-1 text-sm">
                          <strong>Recommendation:</strong> {interaction.recommendation}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
                {allergyAlerts.map((alert, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>ALLERGY ALERT:</strong> {alert.message}
                    </AlertDescription>
                  </Alert>
                ))}
                {dosageAlerts.map((alert, index) => (
                  <Alert key={index} variant="default">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>DOSING ALERT:</strong> {alert.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Medication Name with Auto-complete */}
            <div className="space-y-2">
              <Label htmlFor="medication_name">Medication Name *</Label>
              <div className="relative">
                <Input
                  id="medication_name"
                  value={formData.medication_name}
                  onChange={(e) => handleMedicationInput(e.target.value)}
                  placeholder="Start typing medication name..."
                  className="w-full"
                />
                {showSuggestions.medication && medicationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {medicationSuggestions.map((med, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                        onClick={() => selectSuggestion('medication', med)}
                      >
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-gray-600">{med.category} - {med.dosage}</div>
                        <div className="text-sm text-gray-500">{med.indication}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dosage with Auto-complete */}
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <div className="relative">
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleDosageInput(e.target.value)}
                  placeholder="Enter dosage..."
                  className="w-full"
                />
                {showSuggestions.dosage && dosageSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {dosageSuggestions.map((dosage, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectSuggestion('dosage', dosage)}
                      >
                        {dosage}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Frequency with Auto-complete */}
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <div className="relative">
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => handleFrequencyInput(e.target.value)}
                  placeholder="Enter frequency..."
                  className="w-full"
                />
                {showSuggestions.frequency && frequencySuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {frequencySuggestions.map((frequency, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectSuggestion('frequency', frequency)}
                      >
                        {frequency}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Indication with Auto-complete */}
            <div className="space-y-2">
              <Label htmlFor="indication">Indication</Label>
              <div className="relative">
                <Input
                  id="indication"
                  value={formData.indication}
                  onChange={(e) => handleIndicationInput(e.target.value)}
                  placeholder="Enter indication..."
                  className="w-full"
                />
                {showSuggestions.indication && indicationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {indicationSuggestions.map((indication, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectSuggestion('indication', indication)}
                      >
                        {indication}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refills">Refills</Label>
                <Input
                  id="refills"
                  type="number"
                  value={formData.refills}
                  onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="5"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                value={formData.special_instructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Enter special instructions..."
                rows={3}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter additional notes..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={printPrescription}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Prescription'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}