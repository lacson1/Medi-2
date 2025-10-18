import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LabResult } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText, TestTube, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AddLabResultModal({ isOpen, onClose, labOrder, testName }: any) {
  const [formData, setFormData] = useState({
    lab_order_id: labOrder?.id || '',
    test_name: testName || '',
    result_value: '',
    reference_range: '',
    units: '',
    interpretation: '',
    notes: '',
    status: 'completed',
    performed_by: '',
    result_date: new Date().toISOString().split('T')[0]
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  // Create lab result mutation
  const createLabResultMutation = useMutation({
    mutationFn: (data: any) => LabResult.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labResults'] });
      queryClient.invalidateQueries({ queryKey: ['labOrders'] });
      toast.success('Lab result added successfully');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Failed to add lab result');
      console.error('Error creating lab result:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      lab_order_id: labOrder?.id || '',
      test_name: testName || '',
      result_value: '',
      reference_range: '',
      units: '',
      interpretation: '',
      notes: '',
      status: 'completed',
      performed_by: '',
      result_date: new Date().toISOString().split('T')[0]
    });
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

  const getInterpretationColor = (interpretation: any) => {
    switch (interpretation) {
      case 'normal': return 'text-green-600';
      case 'abnormal': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-600" />
            Add Lab Result
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lab Order Context */}
          {labOrder && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Lab Order Context</span>
              </div>
              <div className="text-sm text-blue-700">
                <p><strong>Order ID:</strong> {labOrder.id}</p>
                <p><strong>Patient:</strong> {labOrder.patient_name || 'N/A'}</p>
                <p><strong>Order Date:</strong> {labOrder.date_ordered || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Test Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Test Name *"}</Label>
              <Input
                value={formData.test_name}
                onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                placeholder="e.g., Hemoglobin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{"Result Date *"}</Label>
              <Input
                type="date"
                value={formData.result_date}
                onChange={(e) => setFormData({...formData, result_date: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Result Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{"Result Value *"}</Label>
              <Input
                value={formData.result_value}
                onChange={(e) => setFormData({...formData, result_value: e.target.value})}
                placeholder="e.g., 12.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{"Reference Range"}</Label>
              <Input
                value={formData.reference_range}
                onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
                placeholder="e.g., 12.0-15.5"
              />
            </div>

            <div className="space-y-2">
              <Label>{"Units"}</Label>
              <Input
                value={formData.units}
                onChange={(e) => setFormData({...formData, units: e.target.value})}
                placeholder="e.g., g/dL"
              />
            </div>
          </div>

          {/* Interpretation */}
          <div className="space-y-2">
            <Label>{"Interpretation *"}</Label>
            <Select 
              value={formData.interpretation} 
              onValueChange={(value) => setFormData({...formData, interpretation: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select interpretation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">
                  <span className="text-green-600">Normal</span>
                </SelectItem>
                <SelectItem value="abnormal">
                  <span className="text-yellow-600">Abnormal</span>
                </SelectItem>
                <SelectItem value="critical">
                  <span className="text-red-600">Critical</span>
                </SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
            {formData.interpretation && (
              <p className={`text-sm ${getInterpretationColor(formData.interpretation)}`}>
                Result interpretation: {formData.interpretation.charAt(0).toUpperCase() + formData.interpretation.slice(1)}
              </p>
            )}
          </div>

          {/* Performed By */}
          <div className="space-y-2">
            <Label>{"Performed By"}</Label>
            <Input
              value={formData.performed_by}
              onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
              placeholder="Lab technician name"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{"Notes"}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes, comments, or observations..."
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
              {isUploading ? 'Uploading...' : createLabResultMutation.isPending ? 'Saving...' : 'Save Result'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
