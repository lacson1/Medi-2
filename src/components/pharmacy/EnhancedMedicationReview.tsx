import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
import { MedicationReview, Prescription, Medication } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Brain,
  FileText,
  Activity,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const REVIEW_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  requires_followup: { label: 'Requires Follow-up', color: 'bg-red-100 text-red-800' }
};

export default function EnhancedMedicationReview() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    date_range: '30d',
    search: ''
  });
  const queryClient = useQueryClient();

  // Fetch medication reviews
  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['medicationReviews', filters],
    queryFn: () => MedicationReview.list(),
  });

  // Fetch prescriptions for selection
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => Prescription.list(),
  });

  // Fetch medications for reference
  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => Medication.list(),
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (data: any) => MedicationReview.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicationReviews'] });
      toast.success('Medication review completed successfully');
      setIsFormOpen(false);
      setSelectedReview(null);
    },
    onError: (error: any) => {
      toast.error('Failed to complete medication review');
      console.error('Error creating review:', error);
    }
  });

  // Filter reviews
  const filteredReviews = React.useMemo(() => {
    return reviews.filter(review => {
      // Status filter
      if (filters.status !== 'all' && review.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search && !review.clinical_assessment.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.date_range !== 'all') {
        const reviewDate = parseISO(review.review_date);
        const now = new Date();
        const daysAgo = parseInt(filters.date_range.replace('d', ''));
        
        if (daysAgo && (now - reviewDate) > (daysAgo * 24 * 60 * 60 * 1000)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, filters]);

  const handleFormSubmit = (data: any) => {
    createReviewMutation.mutate(data);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedReview(null);
  };

  const getStatusConfig = (status: any) => {
    return REVIEW_STATUS[status] || REVIEW_STATUS.pending;
  };

  if (loadingReviews) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-600" />
            Enhanced Medication Review
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive medication reviews with AI-powered interaction checking</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Review
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{"Status"}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(REVIEW_STATUS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{"Date Range"}</Label>
              <Select value={filters.date_range} onValueChange={(value) => setFilters({...filters, date_range: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{"Search"}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: 'all', date_range: '30d', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Medication Reviews ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review: any) => {
                const statusConfig = getStatusConfig(review.status);
                const prescription = prescriptions.find(p => p.id === review.prescription_id);
                
                return (
                  <div key={review.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(review.review_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">{review.clinical_assessment}</p>
                          
                          {prescription && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Pill className="w-4 h-4" />
                              <span><strong>Prescription:</strong> {prescription.medication_name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span><strong>Reviewed by:</strong> {review.reviewed_by || 'N/A'}</span>
                          </div>
                          
                          {review.ai_recommendations && (
                            <div className="flex items-start gap-2 text-sm">
                              <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                              <div>
                                <span className="font-medium text-purple-600">AI Recommendations:</span>
                                <p className="text-gray-700">{review.ai_recommendations}</p>
                              </div>
                            </div>
                          )}
                          
                          {review.recommendations && (
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                              <div>
                                <span className="font-medium text-blue-600">Recommendations:</span>
                                <p className="text-gray-700">{review.recommendations}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No medication reviews found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medication Review Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Comprehensive Medication Review
            </DialogTitle>
          </DialogHeader>
          <MedicationReviewForm
            review={selectedReview}
            prescriptions={prescriptions}
            medications={medications}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isSubmitting={createReviewMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Medication Review Form Component
function MedicationReviewForm({ review, prescriptions, medications, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(review || {
    prescription_id: '',
    review_date: new Date().toISOString().split('T')[0],
    medications_reviewed: [],
    clinical_assessment: '',
    recommendations: '',
    ai_recommendations: '',
    status: 'pending',
    reviewed_by: '',
    notes: ''
  });
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prescription_id) {
      toast.error('Please select a prescription');
      return;
    }

    if (!formData.clinical_assessment) {
      toast.error('Please enter clinical assessment');
      return;
    }

    onSubmit(formData);
  };

  const checkInteractions = async () => {
    if (!formData.prescription_id) {
      toast.error('Please select a prescription first');
      return;
    }

    setIsCheckingInteractions(true);
    
    try {
      const prescription = prescriptions.find(p => p.id === formData.prescription_id);
      const medication = medications.find(m => m.name === prescription?.medication_name);
      
      const prompt = `Analyze potential drug interactions and contraindications for the following medication:
      
Medication: ${prescription?.medication_name || 'Unknown'}
Dosage: ${prescription?.dosage || 'Unknown'}
Frequency: ${prescription?.frequency || 'Unknown'}
Patient Age: ${prescription?.patient_age || 'Unknown'}
Patient Conditions: ${prescription?.patient_conditions || 'Unknown'}

Please provide:
1. Potential drug interactions
2. Contraindications
3. Dosing recommendations
4. Monitoring requirements
5. Any warnings or precautions

Format your response in a clear, clinical manner suitable for healthcare professionals.`;

      const response = await mockApiClient.integrations.Core.InvokeLLM({
        prompt: prompt,
        model: 'gpt-4',
        max_tokens: 1000
      });

      setFormData({
        ...formData,
        ai_recommendations: response.response,
        status: 'completed'
      });

      toast.success('AI interaction analysis completed');
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast.error('Failed to check interactions');
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prescription Selection */}
      <div className="space-y-2">
        <Label>{"Prescription *"}</Label>
        <Select 
          value={formData.prescription_id} 
          onValueChange={(value) => setFormData({...formData, prescription_id: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select prescription to review" />
          </SelectTrigger>
          <SelectContent>
            {prescriptions.map((prescription: any) => (
              <SelectItem key={prescription.id} value={prescription.id}>
                {prescription.medication_name} - {prescription.patient_name} ({prescription.date_prescribed})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Review Date */}
      <div className="space-y-2">
        <Label>{"Review Date *"}</Label>
        <Input
          type="date"
          value={formData.review_date}
          onChange={(e) => setFormData({...formData, review_date: e.target.value})}
          required
        />
      </div>

      {/* Clinical Assessment */}
      <div className="space-y-2">
        <Label>{"Clinical Assessment *"}</Label>
        <Textarea
          value={formData.clinical_assessment}
          onChange={(e) => setFormData({...formData, clinical_assessment: e.target.value})}
          placeholder="Describe the clinical assessment, patient condition, medication effectiveness..."
          rows={4}
          required
        />
      </div>

      {/* AI Interaction Check */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{"AI Interaction Analysis"}</Label>
          <Button
            type="button"
            variant="outline"
            onClick={checkInteractions}
            disabled={isCheckingInteractions || !formData.prescription_id}
            className="flex items-center gap-2"
          >
            {isCheckingInteractions ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {isCheckingInteractions ? 'Analyzing...' : 'Check Interactions'}
          </Button>
        </div>
        {formData.ai_recommendations && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
              <span className="font-medium text-purple-800">AI Recommendations</span>
            </div>
            <p className="text-sm text-purple-700 whitespace-pre-wrap">{formData.ai_recommendations}</p>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <Label>{"Clinical Recommendations"}</Label>
        <Textarea
          value={formData.recommendations}
          onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
          placeholder="Enter clinical recommendations based on the review..."
          rows={3}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>{"Review Status"}</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({...formData, status: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REVIEW_STATUS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviewed By */}
      <div className="space-y-2">
        <Label>{"Reviewed By"}</Label>
        <Input
          value={formData.reviewed_by}
          onChange={(e) => setFormData({...formData, reviewed_by: e.target.value})}
          placeholder="Enter reviewer name or ID"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{"Additional Notes"}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Any additional notes or observations..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Completing Review...' : 'Complete Review'}
        </Button>
      </div>
    </form>
  );
}
