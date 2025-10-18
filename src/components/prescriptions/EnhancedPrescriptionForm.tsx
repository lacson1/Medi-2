import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pill,
  User,
  Brain,
  Shield,
  Workflow,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Zap,
  Save,
  Send
} from 'lucide-react';

// Import all the enhanced components
import PatientSelector from './PatientSelector';
import MedicationIntelligence from './MedicationIntelligence';
import SafetyComplianceChecker from './SafetyComplianceChecker';
import PrescriptionWorkflow from './PrescriptionWorkflow';
import MobileOptimizedForm from './MobileOptimizedForm';

// Import templates and enhanced patient data
import { prescriptionTemplates, enhancedPatients } from '@/data/prescriptionTemplates';

interface EnhancedPrescriptionFormProps {
  prescription?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  patient?: any;
}

export default function EnhancedPrescriptionForm({
  prescription,
  onSubmit,
  onCancel,
  isSubmitting,
  patient
}: EnhancedPrescriptionFormProps) {
  const [activeTab, setActiveTab] = useState('patient');
  const [selectedPatient, setSelectedPatient] = useState<any>(patient || null);
  const [selectedMedication, setSelectedMedication] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    medication_name: prescription?.medication_name || '',
    dosage: prescription?.dosage || '',
    dosage_unit: prescription?.dosage_unit || 'mg',
    frequency: prescription?.frequency || '',
    frequency_unit: prescription?.frequency_unit || 'daily',
    quantity: prescription?.quantity || '',
    refills: prescription?.refills || 0,
    start_date: prescription?.start_date || new Date().toISOString().split('T')[0],
    end_date: prescription?.end_date || '',
    prescribing_doctor: prescription?.prescribing_doctor || '',
    pharmacy_name: prescription?.pharmacy_name || '',
    pharmacy_phone: prescription?.pharmacy_phone || '',
    status: prescription?.status || 'active',
    notes: prescription?.notes || '',
    special_instructions: prescription?.special_instructions || '',
    indication: prescription?.indication || '',
    route: prescription?.route || 'oral',
    duration_days: prescription?.duration_days || '',
    monitoring_required: prescription?.monitoring_required || false,
    lab_monitoring: prescription?.lab_monitoring || '',
    side_effects_to_watch: prescription?.side_effects_to_watch || ''
  });

  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle voice input
  const handleVoiceInput = (text: string) => {
    setFormData(prev => ({
      ...prev,
      medication_name: text,
      indication: text.includes('infection') ? 'Upper respiratory infection' : prev.indication
    }));
  };

  // Handle barcode scan
  const handleBarcodeScan = (code: string) => {
    // Mock medication lookup by barcode
    const medicationLookup: { [key: string]: string } = {
      '123456789': 'Amoxicillin 500mg',
      '987654321': 'Lisinopril 10mg',
      '456789123': 'Metformin 500mg'
    };

    const medication = medicationLookup[code];
    if (medication) {
      const [name, dosage] = medication.split(' ');
      setFormData(prev => ({
        ...prev,
        medication_name: name,
        dosage: dosage.replace('mg', ''),
        dosage_unit: 'mg'
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    // In a real app, this would process the file (e.g., extract medication info from PDF)
  };

  // Handle auto-save
  const handleAutoSave = (data: any) => {
    console.log('Auto-saved:', data);
    // In a real app, this would save to local storage or send to server
  };

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    if (template.medications.length > 0) {
      const firstMed = template.medications[0];
      setFormData(prev => ({
        ...prev,
        medication_name: firstMed.name,
        dosage: firstMed.dosage.replace('mg', ''),
        dosage_unit: 'mg',
        frequency: firstMed.frequency,
        indication: firstMed.indication,
        special_instructions: template.instructions,
        lab_monitoring: template.monitoring.join(', '),
        duration_days: firstMed.duration.replace(' days', '')
      }));
    }
  };

  // Handle bulk prescribe
  const handleBulkPrescribe = (patients: string[], template: any) => {
    console.log('Bulk prescribing to:', patients, 'using template:', template.name);
    // In a real app, this would generate multiple prescriptions
  };

  // Handle medication selection from AI suggestions
  const handleMedicationSelect = (medication: any) => {
    setSelectedMedication(medication);
    setFormData(prev => ({
      ...prev,
      medication_name: medication.name,
      dosage: medication.dosage.replace('mg', ''),
      dosage_unit: 'mg',
      frequency: medication.frequency,
      indication: medication.indication,
      special_instructions: medication.sideEffects.join(', '),
      notes: `AI Suggested: ${medication.confidence * 100}% confidence match`
    }));
  };

  // Handle safety alert resolution
  const handleAlertResolve = (alertId: string) => {
    setSafetyAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      patient_id: selectedPatient?.id,
      patient_name: selectedPatient?.name,
      template_used: selectedTemplate?.name,
      ai_suggested: !!selectedMedication,
      safety_score: 100 - (safetyAlerts.length * 10)
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-600" />
            Enhanced Prescription Form
            <Badge variant="outline" className="ml-2">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Intelligent prescription management with AI assistance, safety checks, and workflow automation
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Prescription'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="patient" className="flex items-center gap-1">
            <User className="w-3 h-3" />
            Patient
          </TabsTrigger>
          <TabsTrigger value="medication" className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            AI Meds
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <Workflow className="w-3 h-3" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            Mobile
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-1">
            <Pill className="w-3 h-3" />
            Form
          </TabsTrigger>
        </TabsList>

        {/* Patient Selection Tab */}
        <TabsContent value="patient">
          <PatientSelector
            patients={enhancedPatients}
            onSelect={setSelectedPatient}
            selectedPatient={selectedPatient}
            showCurrentMedications={true}
            showAllergies={true}
            showMedicalHistory={true}
          />
        </TabsContent>

        {/* AI Medication Intelligence Tab */}
        <TabsContent value="medication">
          <MedicationIntelligence
            indication={formData.indication}
            patientWeight={selectedPatient?.weight}
            patientAge={selectedPatient?.age}
            currentMedications={selectedPatient?.currentMedications || []}
            insuranceProvider={selectedPatient?.insuranceProvider}
            onMedicationSelect={handleMedicationSelect}
          />
        </TabsContent>

        {/* Safety & Compliance Tab */}
        <TabsContent value="safety">
          <SafetyComplianceChecker
            medication={formData.medication_name}
            patient={selectedPatient}
            prescriber={{ deaNumber: 'AB1234567', name: 'Dr. Smith' }}
            onAlertResolve={handleAlertResolve}
          />
        </TabsContent>

        {/* Workflow Automation Tab */}
        <TabsContent value="workflow">
          <PrescriptionWorkflow
            encounterId="enc-123"
            templates={prescriptionTemplates}
            autoRefill={true}
            labIntegration={true}
            onTemplateSelect={handleTemplateSelect}
            onBulkPrescribe={handleBulkPrescribe}
          />
        </TabsContent>

        {/* Mobile Optimization Tab */}
        <TabsContent value="mobile">
          <MobileOptimizedForm
            voiceInput={true}
            barcodeScanner={true}
            dragAndDrop={true}
            autoSave={true}
            offlineMode={true}
            onVoiceInput={handleVoiceInput}
            onBarcodeScan={handleBarcodeScan}
            onFileUpload={handleFileUpload}
            onAutoSave={handleAutoSave}
          />
        </TabsContent>

        {/* Traditional Form Tab */}
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="medication_name">Medication Name</Label>
                    <Input
                      id="medication_name"
                      value={formData.medication_name}
                      onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                      placeholder="Enter medication name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="indication">Indication</Label>
                    <Input
                      id="indication"
                      value={formData.indication}
                      onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                      placeholder="Reason for prescription"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dosage_unit">Unit</Label>
                    <Select value={formData.dosage_unit} onValueChange={(value) => setFormData({ ...formData, dosage_unit: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="tablet">tablet</SelectItem>
                        <SelectItem value="capsule">capsule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="3 times daily"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refills">Refills</Label>
                    <Input
                      id="refills"
                      type="number"
                      value={formData.refills}
                      onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea
                    id="special_instructions"
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Enter special instructions..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Prescription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {selectedPatient ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm">
                Patient: {selectedPatient ? 'Selected' : 'Not Selected'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {formData.medication_name ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm">
                Medication: {formData.medication_name || 'Not Specified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedTemplate ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm">
                Template: {selectedTemplate ? 'Applied' : 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {safetyAlerts.length === 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">
                Safety: {safetyAlerts.length === 0 ? 'Clear' : `${safetyAlerts.length} alerts`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}