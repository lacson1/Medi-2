import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Workflow,
    FileText,
    Zap,
    Clock,
    Users,
    Calendar,
    Copy,
    Download,
    Upload,
    Settings,
    Brain,
    Target,
    CheckCircle,
    ArrowRight,
    RefreshCw
} from 'lucide-react';

interface PrescriptionTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        indication: string;
    }>;
    instructions: string;
    monitoring: string[];
    followUp: string;
    usageCount: number;
    lastUsed?: string;
}

interface EncounterNote {
    id: string;
    date: string;
    chiefComplaint: string;
    diagnosis: string;
    notes: string;
    medications?: string[];
}

interface WorkflowAutomation {
    id: string;
    name: string;
    trigger: string;
    actions: string[];
    isActive: boolean;
}

interface PrescriptionWorkflowProps {
    encounterId?: string;
    templates: PrescriptionTemplate[];
    autoRefill?: boolean;
    labIntegration?: boolean;
    onTemplateSelect: (template: PrescriptionTemplate) => void;
    onBulkPrescribe: (patients: string[], template: PrescriptionTemplate) => void;
}

export default function PrescriptionWorkflow({
    encounterId,
    templates,
    autoRefill = false,
    labIntegration = false,
    onTemplateSelect,
    onBulkPrescribe
}: PrescriptionWorkflowProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null);
    const [encounterNotes, setEncounterNotes] = useState<EncounterNote | null>(null);
    const [workflowAutomations, setWorkflowAutomations] = useState<WorkflowAutomation[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [bulkPatients, setBulkPatients] = useState<string[]>([]);

    useEffect(() => {
        if (encounterId) {
            loadEncounterNotes();
        }
        loadWorkflowAutomations();
    }, [encounterId]);

    const loadEncounterNotes = async () => {
        // Mock encounter notes loading
        await new Promise(resolve => setTimeout(resolve, 500));
        setEncounterNotes({
            id: encounterId!,
            date: '2024-01-15',
            chiefComplaint: 'Chest pain and shortness of breath',
            diagnosis: 'Acute coronary syndrome',
            notes: 'Patient presents with chest pain radiating to left arm. ECG shows ST elevation. Troponin levels elevated.',
            medications: ['Aspirin', 'Clopidogrel', 'Atorvastatin']
        });
    };

    const loadWorkflowAutomations = () => {
        const automations: WorkflowAutomation[] = [
            {
                id: '1',
                name: 'Auto-refill for Chronic Conditions',
                trigger: 'Prescription expires in 7 days',
                actions: ['Send refill reminder', 'Auto-generate prescription', 'Notify pharmacy'],
                isActive: autoRefill
            },
            {
                id: '2',
                name: 'Lab Monitoring Integration',
                trigger: 'Lab results available',
                actions: ['Check medication levels', 'Adjust dosage if needed', 'Notify prescriber'],
                isActive: labIntegration
            },
            {
                id: '3',
                name: 'Drug Interaction Alerts',
                trigger: 'New medication added',
                actions: ['Check interactions', 'Send alert if critical', 'Suggest alternatives'],
                isActive: true
            }
        ];
        setWorkflowAutomations(automations);
    };

    const generateFromEncounter = async () => {
        if (!encounterNotes) return;

        setIsGenerating(true);

        // Simulate AI processing of encounter notes
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Find matching template based on diagnosis
        const matchingTemplate = templates.find(template =>
            template.category.toLowerCase().includes(encounterNotes.diagnosis.toLowerCase()) ||
            encounterNotes.diagnosis.toLowerCase().includes(template.category.toLowerCase())
        );

        if (matchingTemplate) {
            setSelectedTemplate(matchingTemplate);
        }

        setIsGenerating(false);
    };

    const handleTemplateSelect = (template: PrescriptionTemplate) => {
        setSelectedTemplate(template);
        onTemplateSelect(template);
    };

    const handleBulkPrescribe = () => {
        if (selectedTemplate && bulkPatients.length > 0) {
            onBulkPrescribe(bulkPatients, selectedTemplate);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Cardiology': 'bg-red-100 text-red-800',
            'Endocrinology': 'bg-blue-100 text-blue-800',
            'Infectious Disease': 'bg-green-100 text-green-800',
            'Neurology': 'bg-purple-100 text-purple-800',
            'Oncology': 'bg-pink-100 text-pink-800',
            'Pediatrics': 'bg-yellow-100 text-yellow-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Workflow Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-blue-600" />
                        Prescription Workflow Automation
                        <Badge variant="outline" className="ml-2">
                            <Zap className="w-3 h-3 mr-1" />
                            Smart
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">Templates: {templates.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">Bulk Patients: {bulkPatients.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">Automations: {workflowAutomations.filter(a => a.isActive).length}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="templates" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="encounter">Encounter AI</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Prescribe</TabsTrigger>
                    <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((template) => (
                            <Card
                                key={template.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                    }`}
                                onClick={() => handleTemplateSelect(template)}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">{template.name}</CardTitle>
                                        <Badge className={getCategoryColor(template.category)}>
                                            {template.category}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                                    <div className="space-y-2">
                                        <div className="text-xs">
                                            <strong>Medications:</strong> {template.medications.length}
                                        </div>
                                        <div className="text-xs">
                                            <strong>Used:</strong> {template.usageCount} times
                                        </div>
                                        {template.lastUsed && (
                                            <div className="text-xs text-gray-500">
                                                Last used: {new Date(template.lastUsed).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full mt-3"
                                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                                    >
                                        {selectedTemplate?.id === template.id ? 'Selected' : 'Select Template'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Encounter AI Tab */}
                <TabsContent value="encounter" className="space-y-4">
                    {encounterNotes ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-purple-600" />
                                    AI-Powered Prescription Generation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Encounter Summary</h4>
                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                            <p><strong>Chief Complaint:</strong> {encounterNotes.chiefComplaint}</p>
                                            <p><strong>Diagnosis:</strong> {encounterNotes.diagnosis}</p>
                                            <p><strong>Notes:</strong> {encounterNotes.notes}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            onClick={generateFromEncounter}
                                            disabled={isGenerating}
                                            className="flex items-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Brain className="w-4 h-4" />
                                                    Generate Prescription
                                                </>
                                            )}
                                        </Button>

                                        {selectedTemplate && (
                                            <Alert className="border-green-200 bg-green-50">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <AlertDescription className="text-green-800">
                                                    <strong>Template Found:</strong> {selectedTemplate.name}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p>No encounter notes available</p>
                                <p className="text-sm">Select an encounter to enable AI-powered prescription generation</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Bulk Prescribe Tab */}
                <TabsContent value="bulk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600" />
                                Bulk Prescription Generation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Select Patients
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Patient A', 'Patient B', 'Patient C', 'Patient D'].map((patient, index) => (
                                            <label key={index} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkPatients.includes(patient)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setBulkPatients([...bulkPatients, patient]);
                                                        } else {
                                                            setBulkPatients(bulkPatients.filter(p => p !== patient));
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm">{patient}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {selectedTemplate && (
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Selected Template</h4>
                                        <div className="bg-blue-50 p-3 rounded">
                                            <p className="text-sm font-medium">{selectedTemplate.name}</p>
                                            <p className="text-xs text-gray-600">{selectedTemplate.description}</p>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleBulkPrescribe}
                                    disabled={!selectedTemplate || bulkPatients.length === 0}
                                    className="w-full"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Generate {bulkPatients.length} Prescriptions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Automation Tab */}
                <TabsContent value="automation" className="space-y-4">
                    <div className="space-y-4">
                        {workflowAutomations.map((automation) => (
                            <Card key={automation.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            {automation.name}
                                        </CardTitle>
                                        <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                                            {automation.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <strong>Trigger:</strong> {automation.trigger}
                                        </div>
                                        <div className="text-sm">
                                            <strong>Actions:</strong>
                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                {automation.actions.map((action, index) => (
                                                    <li key={index} className="text-xs text-gray-600">{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm">
                                    <Download className="w-3 h-3 mr-1" />
                                    Export Templates
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Upload className="w-3 h-3 mr-1" />
                                    Import Templates
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-3 h-3 mr-1" />
                                    Configure Automation
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Schedule Refills
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Selected Template Preview */}
            {selectedTemplate && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <CheckCircle className="w-5 h-5" />
                            Selected Template Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Medications</h4>
                                <div className="space-y-2">
                                    {selectedTemplate.medications.map((med, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                            <div>
                                                <span className="font-medium text-sm">{med.name}</span>
                                                <span className="text-xs text-gray-500 ml-2">{med.dosage} {med.frequency}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {med.duration}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Instructions</h4>
                                <p className="text-sm text-gray-600">{selectedTemplate.instructions}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Monitoring Required</h4>
                                <div className="flex flex-wrap gap-1">
                                    {selectedTemplate.monitoring.map((item, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
