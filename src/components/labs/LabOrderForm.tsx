import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutoComplete from "@/components/ui/auto-complete";
import { mockApiClient } from "@/api/mockApiClient";
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
  Image as ImageIcon
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import {
  getAllTests,
  getIndicationSuggestions,
  getInstructionSuggestions,
  getDoctorSuggestions,
  LAB_TEST_DATABASE
} from "@/data/labTestDatabase";

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

export default function LabOrderForm({ labOrder, onSubmit, onCancel, isSubmitting, patientId, encounterId }: any) {
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

  // Auto-suggest states
  const [testSuggestions, setTestSuggestions] = useState([]);
  const [indicationSuggestions, setIndicationSuggestions] = useState([]);
  const [instructionSuggestions, setInstructionSuggestions] = useState([]);
  const [doctorSuggestions, setDoctorSuggestions] = useState([]);

  // Auto-calculate due date based on priority
  useEffect(() => {
    if (formData.priority && formData.date_ordered) {
      const orderDate = parseISO(formData.date_ordered);
      let dueDate;

      switch (formData.priority) {
        case 'stat':
          dueDate = addDays(orderDate, 0); // Same day
          break;
        case 'urgent':
          dueDate = addDays(orderDate, 0); // Same day
          break;
        case 'routine':
          dueDate = addDays(orderDate, 1); // Next day
          break;
        case 'low':
          dueDate = addDays(orderDate, 2); // 2 days
          break;
        default:
          dueDate = addDays(orderDate, 1);
      }

      setFormData(prev => ({
        ...prev,
        due_date: format(dueDate, 'yyyy-MM-dd')
      }));
    }
  }, [formData.priority, formData.date_ordered]);

  // Auto-suggest handlers
  const handleTestNameChange = (value: any) => {
    setFormData(prev => ({ ...prev, test_name: value }));

    // Get suggestions from database
    const suggestions = getAllTests().filter(test =>
      test.name.toLowerCase().includes(value.toLowerCase()) ||
      test.code.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 10);

    setTestSuggestions(suggestions);
  };

  const handleTestSelect = (test: any) => {
    if (typeof test === 'string') {
      setFormData(prev => ({ ...prev, test_name: test }));
    } else {
      setFormData(prev => ({
        ...prev,
        test_name: test.name,
        test_code: test.code,
        test_category: test.category
      }));
    }
    setTestSuggestions([]);
  };

  const handleIndicationChange = (value: any) => {
    setFormData(prev => ({ ...prev, clinical_indication: value }));
    setIndicationSuggestions(getIndicationSuggestions(value));
  };

  const handleInstructionChange = (value: any) => {
    setFormData(prev => ({ ...prev, special_instructions: value }));
    setInstructionSuggestions(getInstructionSuggestions(value));
  };

  const handleDoctorChange = (value: any) => {
    setFormData(prev => ({ ...prev, ordering_doctor: value }));
    setDoctorSuggestions(getDoctorSuggestions(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let submissionData = { ...formData };

    // Add workflow tracking
    submissionData.workflow_history = [
      ...(formData.workflow_history || []),
      {
        stage: formData.status,
        timestamp: new Date().toISOString(),
        updated_by: 'current_user', // This should come from auth context
        notes: formData.workflow_notes
      }
    ];

    if (file) {
      setIsUploading(true);
      try {
        // Mock file upload - Base44 integration removed
        console.warn('Mock file upload - Base44 integration removed');
        submissionData.result_file_url = 'mock-file-url';
        submissionData.status = 'completed';
      } catch (error) {
        console.error("File upload failed", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    onSubmit(submissionData);
  };

  const getPriorityConfig = (priority: any) => {
    return PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.routine;
  };

  const getTestCategoryConfig = (category: any) => {
    return TEST_CATEGORIES[category] || TEST_CATEGORIES.other;
  };

  const getWorkflowStageConfig = (stage: any) => {
    return WORKFLOW_STAGES[stage] || WORKFLOW_STAGES.requested;
  };

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-blue-600" />
              {labOrder ? 'Edit Lab Order' : 'New Lab Order'}
            </CardTitle>
            <div className="flex gap-2">
              {formData.priority && (
                <Badge className={getPriorityConfig(formData.priority).color}>
                  {getPriorityConfig(formData.priority).label}
                </Badge>
              )}
              {formData.status && (
                <Badge className={getWorkflowStageConfig(formData.status).color}>
                  {React.createElement(getWorkflowStageConfig(formData.status).icon, { className: "w-3 h-3 mr-1" })}
                  {getWorkflowStageConfig(formData.status).label}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="clinical">Clinical Details</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AutoComplete
                      label="Test Name *"
                      placeholder="Enter test name (e.g., Complete Blood Count)"
                      value={formData.test_name}
                      onChange={handleTestNameChange}
                      onSelect={handleTestSelect}
                      suggestions={testSuggestions}
                      allowCustom={true}
                      required={true}
                      renderSuggestion={(test, index, isHighlighted) => (
                        <div className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{test.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {test.code}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">{test.category}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <Label htmlFor="test_code">Test Code</Label>
                    <Input
                      id="test_code"
                      value={formData.test_code}
                      onChange={e => setFormData({ ...formData, test_code: e.target.value })}
                      placeholder="e.g., CBC, BMP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="test_category">Test Category</Label>
                  <Select value={formData.test_category} onValueChange={v => setFormData({ ...formData, test_category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEST_CATEGORIES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_ordered">Date Ordered *</Label>
                    <Input
                      id="date_ordered"
                      type="date"
                      required
                      value={formData.date_ordered}
                      onChange={e => setFormData({ ...formData, date_ordered: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AutoComplete
                      label="Ordering Doctor"
                      placeholder="Enter doctor name (e.g., Dr. Smith)"
                      value={formData.ordering_doctor}
                      onChange={handleDoctorChange}
                      onSelect={(doctor) => setFormData({ ...formData, ordering_doctor: doctor })}
                      suggestions={doctorSuggestions}
                      allowCustom={true}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LEVELS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Badge className={config.color}>{config.label}</Badge>
                              <span className="text-sm text-gray-500">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Details Tab */}
          <TabsContent value="clinical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clinical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <AutoComplete
                    label="Clinical Indication"
                    placeholder="Reason for ordering this test (e.g., Routine screening)"
                    value={formData.clinical_indication}
                    onChange={handleIndicationChange}
                    onSelect={(indication) => setFormData({ ...formData, clinical_indication: indication })}
                    suggestions={indicationSuggestions}
                    allowCustom={true}
                    renderSuggestion={(indication, index, isHighlighted) => (
                      <div className={`px-3 py-2 cursor-pointer transition-colors ${isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"}`}>
                        <span className="text-sm">{indication}</span>
                      </div>
                    )}
                  />
                </div>

                <div>
                  <AutoComplete
                    label="Special Instructions"
                    placeholder="Any special handling or processing instructions (e.g., Patient fasting required)"
                    value={formData.special_instructions}
                    onChange={handleInstructionChange}
                    onSelect={(instruction) => setFormData({ ...formData, special_instructions: instruction })}
                    suggestions={instructionSuggestions}
                    allowCustom={true}
                    renderSuggestion={(instruction, index, isHighlighted) => (
                      <div className={`px-3 py-2 cursor-pointer transition-colors ${isHighlighted ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50"}`}>
                        <span className="text-sm">{instruction}</span>
                      </div>
                    )}
                  />
                </div>

                {/* Imaging-specific fields */}
                {formData.test_category === 'imaging' && (
                  <div className="space-y-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="w-5 h-5 text-cyan-600" />
                      <h4 className="font-medium text-cyan-800">Imaging Requirements</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <AutoComplete
                          label="Imaging Type"
                          placeholder="Select imaging type (e.g., Chest X-Ray)"
                          value={formData.imaging_type}
                          onChange={(value) => setFormData({ ...formData, imaging_type: value })}
                          onSelect={(type) => setFormData({ ...formData, imaging_type: type })}
                          suggestions={LAB_TEST_DATABASE.imaging.map(test => test.name)}
                          allowCustom={true}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="contrast_required"
                            checked={formData.contrast_required}
                            onChange={e => setFormData({ ...formData, contrast_required: e.target.checked })}
                            className="rounded"
                            aria-label="Contrast required for imaging"
                          />
                          <Label htmlFor="contrast_required" className="text-sm">Contrast Required</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sedation_required"
                            checked={formData.sedation_required}
                            onChange={e => setFormData({ ...formData, sedation_required: e.target.checked })}
                            className="rounded"
                            aria-label="Sedation required for imaging"
                          />
                          <Label htmlFor="sedation_required" className="text-sm">Sedation Required</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_id">Patient ID</Label>
                    <Input
                      id="patient_id"
                      value={formData.patient_id}
                      onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
                      placeholder="Patient identifier"
                    />
                  </div>
                  <div>
                    <Label htmlFor="encounter_id">Encounter ID</Label>
                    <Input
                      id="encounter_id"
                      value={formData.encounter_id}
                      onChange={e => setFormData({ ...formData, encounter_id: e.target.value })}
                      placeholder="Visit/encounter identifier"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Current Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WORKFLOW_STAGES).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="w-4 h-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workflow_notes">Workflow Notes</Label>
                  <Textarea
                    id="workflow_notes"
                    value={formData.workflow_notes}
                    onChange={e => setFormData({ ...formData, workflow_notes: e.target.value })}
                    placeholder="Notes about current workflow status..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_completion">Estimated Completion</Label>
                  <Input
                    id="estimated_completion"
                    type="datetime-local"
                    value={formData.estimated_completion}
                    onChange={e => setFormData({ ...formData, estimated_completion: e.target.value })}
                  />
                </div>

                {/* Workflow History */}
                {formData.workflow_history && formData.workflow_history.length > 0 && (
                  <div>
                    <Label>{"Workflow History"}</Label>
                    <div className="space-y-2 mt-2">
                      {formData.workflow_history.map((entry, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <span className="font-medium">{entry.stage}</span>
                            <span className="text-gray-500 ml-2">
                              {format(parseISO(entry.timestamp), 'MMM d, HH:mm')}
                            </span>
                          </div>
                          <span className="text-gray-500">{entry.updated_by}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="results_summary">Results Summary</Label>
                  <Textarea
                    id="results_summary"
                    value={formData.results_summary}
                    onChange={e => setFormData({ ...formData, results_summary: e.target.value })}
                    placeholder="Enter test results summary..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="result_file">Result File</Label>
                  <Input
                    id="result_file"
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                  />
                  {formData.result_file_url && !file && (
                    <div className="mt-2">
                      <a
                        href={formData.result_file_url}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        View current file
                      </a>
                    </div>
                  )}
                </div>

                {file && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Selected file: {file.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Save Lab Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}