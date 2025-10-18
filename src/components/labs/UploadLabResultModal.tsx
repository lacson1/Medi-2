import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { LabResult } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText, Calendar, User, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export default function UploadLabResultModal({ isOpen, onClose, patientId }: any) {
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    test_name: '',
    test_date: new Date().toISOString().split('T')[0],
    result_value: '',
    reference_range: '',
    units: '',
    interpretation: '',
    notes: '',
    status: 'completed'
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    enabled: !patientId
  });

  // Create lab result mutation
  const createLabResultMutation = useMutation({
    mutationFn: (data: any) => LabResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labResults'] });
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      toast.success('Lab result uploaded successfully');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to upload lab result');
      console.error('Error creating lab result:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      patient_id: patientId || '',
      test_name: '',
      test_date: new Date().toISOString().split('T')[0],
      result_value: '',
      reference_range: '',
      units: '',
      interpretation: '',
      notes: '',
      status: 'completed'
    });
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!formData.test_name) {
      toast.error('Please enter test name');
      return;
    }

    let submissionData = { ...formData };
    
    // Upload file if provided
    if (file) {
      setIsUploading(true);
      try {
        const { file_url } = await mockApiClient.integrations.Core.UploadFile({ file });
        submissionData.file_url = file_url;
        submissionData.has_attachment = true;
      } catch (error) {
        console.error('File upload failed:', error);
        toast.error('Failed to upload file');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    createLabResultMutation.mutate(submissionData);
  };

  const handleFileChange = (e: React.FormEvent) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a PDF or image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Existing Lab Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Patient *
            </Label>
            {patientId ? (
              <div className="p-3 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-600">Patient ID: {patientId}</span>
              </div>
            ) : (
              <Select 
                value={formData.patient_id} 
                onValueChange={(value) => setFormData({...formData, patient_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} - {patient.date_of_birth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Test Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Test Name *
              </Label>
              <Input
                value={formData.test_name}
                onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                placeholder="e.g., Complete Blood Count"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Test Date *
              </Label>
              <Input
                type="date"
                value={formData.test_date}
                onChange={(e) => setFormData({...formData, test_date: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Result Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{"Result Value"}</Label>
              <Input
                value={formData.result_value}
                onChange={(e) => setFormData({...formData, result_value: e.target.value})}
                placeholder="e.g., 4.5"
              />
            </div>

            <div className="space-y-2">
              <Label>{"Reference Range"}</Label>
              <Input
                value={formData.reference_range}
                onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
                placeholder="e.g., 4.0-5.5"
              />
            </div>

            <div className="space-y-2">
              <Label>{"Units"}</Label>
              <Input
                value={formData.units}
                onChange={(e) => setFormData({...formData, units: e.target.value})}
                placeholder="e.g., mg/dL"
              />
            </div>
          </div>

          {/* Interpretation */}
          <div className="space-y-2">
            <Label>{"Interpretation"}</Label>
            <Select 
              value={formData.interpretation} 
              onValueChange={(value) => setFormData({...formData, interpretation: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interpretation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{"Notes"}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes or comments..."
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Attach Result File (PDF, Images)
            </Label>
            <div className="flex items-center gap-2">
              <Input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Upload className="w-4 h-4" />
                  {file.name}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, JPG, PNG. Max size: 10MB
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createLabResultMutation.isPending || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(createLabResultMutation.isPending || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploading ? 'Uploading...' : createLabResultMutation.isPending ? 'Saving...' : 'Upload Result'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
