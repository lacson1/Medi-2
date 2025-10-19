import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Loader2,
    Beaker,
    Calendar,
    User,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
    Eye,
    Download,
    Plus,
    TestTube,
    Microscope,
    Activity,
    Camera,
    Image as ImageIcon,
    Sparkles,
    Search,
    Zap
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { EnhancedInputField, LabTestField, ConditionField } from "@/components/forms/EnhancedFormFields";
import { getSmartSuggestions } from "@/data/autocompleteData";

const TEST_CATEGORIES = {
    hematology: { label: 'Hematology', icon: TestTube, color: 'bg-red-100 text-red-800' },
    chemistry: { label: 'Chemistry', icon: Beaker, color: 'bg-blue-100 text-blue-800' },
    microbiology: { label: 'Microbiology', icon: Microscope, color: 'bg-green-100 text-green-800' },
    immunology: { label: 'Immunology', icon: Activity, color: 'bg-purple-100 text-purple-800' },
    pathology: { label: 'Pathology', icon: Eye, color: 'bg-orange-100 text-orange-800' },
    imaging: { label: 'Imaging', icon: Camera, color: 'bg-cyan-100 text-cyan-800' },
    other: { label: 'Other', icon: FileText, color: 'bg-gray-100 text-gray-800' }
};

const PRIORITY_LEVELS = {
    stat: { label: 'STAT', color: 'bg-red-200 text-red-900', description: 'Immediate - Results needed within 1 hour' },
    urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-800', description: 'High priority - Results needed within 4 hours' },
    routine: { label: 'Routine', color: 'bg-blue-100 text-blue-800', description: 'Standard priority - Results within 24 hours' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800', description: 'Low priority - Results within 48 hours' }
};

const WORKFLOW_STAGES = {
    requested: { label: 'Requested', color: 'bg-blue-100 text-blue-800', icon: Clock },
    ordered: { label: 'Ordered', color: 'bg-gray-100 text-gray-800', icon: FileText },
    specimen_collected: { label: 'Specimen Collected', color: 'bg-purple-100 text-purple-800', icon: TestTube },
    in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Activity },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    reviewed: { label: 'Reviewed', color: 'bg-indigo-100 text-indigo-800', icon: Eye }
};

export default function EnhancedLabOrderFormWithAutocomplete({
    labOrder,
    onSubmit,
    onCancel,
    isSubmitting,
    patientId,
    encounterId
}: any) {
    const [formData, setFormData] = useState(labOrder || {
        test_name: "",
        test_category: "",
        test_code: "",
        date_ordered: new Date().toISOString().split('T')[0],
        ordering_doctor: "",
        priority: "routine",
        status: "requested",
        results_summary: "",
        result_file_url: "",
        clinical_indication: "",
        special_instructions: "",
        due_date: "",
        patient_id: patientId || "",
        encounter_id: encounterId || "",
        workflow_notes: "",
        estimated_completion: "",
        imaging_required: false,
        imaging_type: "",
        contrast_required: false,
        sedation_required: false
    });

    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [testSuggestions, setTestSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Auto-calculate due date based on priority
    useEffect(() => {
        if (formData.priority && formData.date_ordered) {
            const orderDate = parseISO(formData.date_ordered);
            let daysToAdd = 1;

            switch (formData.priority) {
                case 'stat':
                    daysToAdd = 0;
                    break;
                case 'urgent':
                    daysToAdd = 1;
                    break;
                case 'routine':
                    daysToAdd = 2;
                    break;
                case 'low':
                    daysToAdd = 3;
                    break;
            }

            const dueDate = addDays(orderDate, daysToAdd);
            setFormData(prev => ({
                ...prev,
                due_date: format(dueDate, 'yyyy-MM-dd')
            }));
        }
    }, [formData.priority, formData.date_ordered]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTestSelect = (test: any) => {
        if (test) {
            setFormData(prev => ({
                ...prev,
                test_name: test.label,
                test_code: test.code || "",
                test_category: test.category || ""
            }));
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Simulate file upload
        setTimeout(() => {
            setFile(file);
            setIsUploading(false);
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getPriorityColor = (priority: string) => {
        return PRIORITY_LEVELS[priority]?.color || 'bg-gray-100 text-gray-800';
    };

    const getPriorityDescription = (priority: string) => {
        return PRIORITY_LEVELS[priority]?.description || '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Enhanced Lab Order Form</h2>
                    <p className="text-gray-600">Smart autocomplete for lab tests, indications, and instructions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">AI-Powered</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="clinical">Clinical</TabsTrigger>
                        <TabsTrigger value="workflow">Workflow</TabsTrigger>
                        <TabsTrigger value="imaging">Imaging</TabsTrigger>
                    </TabsList>

                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TestTube className="w-5 h-5" />
                                    Test Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <LabTestField
                                        name="test_name"
                                        label="Test Name *"
                                        placeholder="Enter test name (e.g., Complete Blood Count)"
                                        value={formData.test_name}
                                        onChange={(value) => handleInputChange('test_name', value)}
                                        onSelect={handleTestSelect}
                                        required
                                        helpText="Smart suggestions for common lab tests with codes"
                                    />

                                    <div>
                                        <Label htmlFor="test_code">Test Code</Label>
                                        <input
                                            type="text"
                                            id="test_code"
                                            value={formData.test_code}
                                            onChange={(e) => handleInputChange('test_code', e.target.value)}
                                            placeholder="e.g., CBC, BMP"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="test_category">Test Category</Label>
                                        <Select value={formData.test_category} onValueChange={(value) => handleInputChange('test_category', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(TEST_CATEGORIES).map(([key, category]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <category.icon className="w-4 h-4" />
                                                            {category.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={priority.color}>{priority.label}</Badge>
                                                            <span className="text-sm text-gray-500">{priority.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_ordered">Order Date</Label>
                                        <input
                                            type="date"
                                            id="date_ordered"
                                            value={formData.date_ordered}
                                            onChange={(e) => handleInputChange('date_ordered', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="due_date">Due Date</Label>
                                        <input
                                            type="date"
                                            id="due_date"
                                            value={formData.due_date}
                                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <EnhancedInputField
                                    name="ordering_doctor"
                                    label="Ordering Doctor"
                                    placeholder="Enter doctor name"
                                    value={formData.ordering_doctor}
                                    onChange={(value) => handleInputChange('ordering_doctor', value)}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Clinical Information Tab */}
                    <TabsContent value="clinical" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Clinical Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ConditionField
                                    name="clinical_indication"
                                    label="Clinical Indication *"
                                    placeholder="Enter clinical indication (e.g., Hypertension, Diabetes screening)"
                                    value={formData.clinical_indication}
                                    onChange={(value) => handleInputChange('clinical_indication', value)}
                                    required
                                    helpText="Smart suggestions for common clinical indications"
                                />

                                <div>
                                    <Label htmlFor="special_instructions">Special Instructions</Label>
                                    <Textarea
                                        id="special_instructions"
                                        value={formData.special_instructions}
                                        onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                                        placeholder="Enter any special instructions for the lab..."
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="results_summary">Results Summary</Label>
                                    <Textarea
                                        id="results_summary"
                                        value={formData.results_summary}
                                        onChange={(e) => handleInputChange('results_summary', e.target.value)}
                                        placeholder="Enter results summary..."
                                        rows={4}
                                        className="w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Workflow Tab */}
                    <TabsContent value="workflow" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Workflow Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(WORKFLOW_STAGES).map(([key, stage]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center gap-2">
                                                            <stage.icon className="w-4 h-4" />
                                                            <Badge className={stage.color}>{stage.label}</Badge>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="estimated_completion">Estimated Completion</Label>
                                        <input
                                            type="datetime-local"
                                            id="estimated_completion"
                                            value={formData.estimated_completion}
                                            onChange={(e) => handleInputChange('estimated_completion', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="workflow_notes">Workflow Notes</Label>
                                    <Textarea
                                        id="workflow_notes"
                                        value={formData.workflow_notes}
                                        onChange={(e) => handleInputChange('workflow_notes', e.target.value)}
                                        placeholder="Enter workflow notes..."
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Imaging Tab */}
                    <TabsContent value="imaging" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5" />
                                    Imaging Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="imaging_required"
                                            checked={formData.imaging_required}
                                            onChange={(e) => handleInputChange('imaging_required', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="imaging_required">Imaging Required</Label>
                                    </div>

                                    {formData.imaging_required && (
                                        <>
                                            <EnhancedInputField
                                                name="imaging_type"
                                                label="Imaging Type"
                                                placeholder="Enter imaging type (e.g., X-Ray, CT Scan, MRI)"
                                                autocompleteType="procedures"
                                                value={formData.imaging_type}
                                                onChange={(value) => handleInputChange('imaging_type', value)}
                                                helpText="Smart suggestions for common imaging procedures"
                                            />

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="contrast_required"
                                                        checked={formData.contrast_required}
                                                        onChange={(e) => handleInputChange('contrast_required', e.target.checked)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="contrast_required">Contrast Required</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id="sedation_required"
                                                        checked={formData.sedation_required}
                                                        onChange={(e) => handleInputChange('sedation_required', e.target.checked)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <Label htmlFor="sedation_required">Sedation Required</Label>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* File Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    File Upload
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="file_upload">Upload Result File</Label>
                                        <input
                                            type="file"
                                            id="file_upload"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {isUploading && (
                                        <div className="flex items-center gap-2 text-blue-600">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Uploading file...
                                        </div>
                                    )}

                                    {file && (
                                        <Alert>
                                            <CheckCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                File uploaded successfully: {file.name}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Priority Alert */}
                {formData.priority === 'stat' && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-red-600" />
                                <span className="font-medium">STAT Priority Selected</span>
                            </div>
                            <p className="mt-1 text-sm">This test requires immediate attention and results within 1 hour.</p>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Lab Order"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
