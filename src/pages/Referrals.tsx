import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
// import { Referral } from '@/types';

// Local interface definition
interface Referral {
  id: string;
  patient_id: string;
  referring_provider_id: string;
  referred_to_provider_id: string;
  referral_reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  referral_date: string;
  appointment_date?: string;
  notes?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowUpRightSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const REFERRAL_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
};

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'Hematology',
  'Infectious Disease', 'Nephrology', 'Neurology', 'Oncology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology',
  'Urology', 'General Surgery', 'Plastic Surgery', 'Neurosurgery', 'Other'
];

export default function Referrals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    specialty: 'all',
    date_range: '30d',
    search: ''
  });
  const queryClient = useQueryClient();

  // Fetch referrals
  const { data: referrals = [], isLoading: loadingReferrals } = useQuery({
    queryKey: ['referrals', filters],
    queryFn: () => Referral.list(),
  });

  // Fetch patients for selection
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
  });

  // Create referral mutation
  const createReferralMutation = useMutation({
    mutationFn: (data: any) => Referral.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('Referral created successfully');
      setIsFormOpen(false);
      setSelectedReferral(null);
    },
    onError: (error: any) => {
      toast.error('Failed to create referral');
      console.error('Error creating referral:', error);
    }
  });

  // Update referral mutation
  const updateReferralMutation = useMutation({
    mutationFn: (data: any) => Referral.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('Referral updated successfully');
      setIsFormOpen(false);
      setSelectedReferral(null);
    },
    onError: (error: any) => {
      toast.error('Failed to update referral');
      console.error('Error updating referral:', error);
    }
  });

  // Delete referral mutation
  const deleteReferralMutation = useMutation({
    mutationFn: (id: any) => Referral.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      toast.success('Referral deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete referral');
      console.error('Error deleting referral:', error);
    }
  });

  // Filter referrals
  const filteredReferrals = React.useMemo(() => {
    return referrals.filter(referral => {
      // Status filter
      if (filters.status !== 'all' && referral.status !== filters.status) {
        return false;
      }

      // Specialty filter
      if (filters.specialty !== 'all' && referral.specialty !== filters.specialty) {
        return false;
      }

      // Search filter
      if (filters.search && !referral.referred_to.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.date_range !== 'all') {
        const referralDate = parseISO(referral.date_referred);
        const now = new Date();
        const daysAgo = parseInt(filters.date_range.replace('d', ''));

        if (daysAgo && (now - referralDate) > (daysAgo * 24 * 60 * 60 * 1000)) {
          return false;
        }
      }

      return true;
    });
  }, [referrals, filters]);

  const handleFormSubmit = (data: any) => {
    if (selectedReferral) {
      updateReferralMutation.mutate({ ...data, id: selectedReferral.id });
    } else {
      createReferralMutation.mutate(data);
    }
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      deleteReferralMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedReferral(null);
  };

  const openEditModal = (referral: any) => {
    setSelectedReferral(referral);
    setIsFormOpen(true);
  };

  const getStatusConfig = (status: any) => {
    return REFERRAL_STATUS[status] || REFERRAL_STATUS.pending;
  };

  if (loadingReferrals) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpRightSquare className="w-8 h-8 text-blue-600" />
              Patient Referrals
            </h1>
            <p className="text-gray-600 mt-1">Manage patient referrals between departments and specialists</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Referral
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>{"Status"}</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(REFERRAL_STATUS).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{"Specialty"}</Label>
                <Select value={filters.specialty} onValueChange={(value) => setFilters({ ...filters, specialty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {SPECIALTIES.map((specialty: any) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{"Date Range"}</Label>
                <Select value={filters.date_range} onValueChange={(value) => setFilters({ ...filters, date_range: value })}>
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
                    placeholder="Search referrals..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: 'all', specialty: 'all', date_range: '30d', search: '' })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRightSquare className="w-5 h-5" />
              Referrals ({filteredReferrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredReferrals.length > 0 ? (
              <div className="space-y-4">
                {filteredReferrals.map((referral: any) => {
                  const statusConfig = getStatusConfig(referral.status);
                  const patient = patients.find(p => p.id === referral.patient_id);

                  return (
                    <div key={referral.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{referral.referred_to}</h4>
                            <Badge className={statusConfig.color}>
                              <statusConfig.icon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            {referral.specialty && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {referral.specialty}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span><strong>Patient:</strong> {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span><strong>Referred:</strong> {format(parseISO(referral.date_referred), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span><strong>Referring Dr:</strong> {referral.referring_doctor || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span><strong>Urgency:</strong> {referral.urgency || 'Routine'}</span>
                            </div>
                          </div>

                          {referral.reason && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Reason:</span> {referral.reason}
                              </p>
                            </div>
                          )}

                          {referral.notes && (
                            <p className="text-sm text-gray-600 italic">
                              <span className="font-medium">Notes:</span> {referral.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(referral)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/patients/${referral.patient_id}?tab=referrals`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(referral.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ArrowUpRightSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No referrals found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Form Modal */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                {selectedReferral ? 'Edit Referral' : 'New Referral'}
              </DialogTitle>
            </DialogHeader>
            <ReferralForm
              referral={selectedReferral}
              patients={patients}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
              isSubmitting={createReferralMutation.isPending || updateReferralMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Referral Form Component
function ReferralForm({ referral, patients, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(referral || {
    patient_id: '',
    referred_to: '',
    specialty: '',
    reason: '',
    date_referred: new Date().toISOString().split('T')[0],
    referring_doctor: '',
    urgency: 'routine',
    status: 'pending',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.referred_to) {
      toast.error('Please enter who the patient is being referred to');
      return;
    }

    if (!formData.reason) {
      toast.error('Please enter the reason for referral');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection */}
      <div className="space-y-2">
        <Label>{"Patient *"}</Label>
        <Select
          value={formData.patient_id}
          onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
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
      </div>

      {/* Referred To */}
      <div className="space-y-2">
        <Label>{"Referred To *"}</Label>
        <Input
          value={formData.referred_to}
          onChange={(e) => setFormData({ ...formData, referred_to: e.target.value })}
          placeholder="e.g., Dr. Smith, Cardiology Department"
          required
        />
      </div>

      {/* Specialty */}
      <div className="space-y-2">
        <Label>{"Specialty"}</Label>
        <Select
          value={formData.specialty}
          onValueChange={(value) => setFormData({ ...formData, specialty: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select specialty" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((specialty: any) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label>{"Reason for Referral *"}</Label>
        <Textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Describe the reason for referral..."
          rows={3}
          required
        />
      </div>

      {/* Date and Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{"Referral Date *"}</Label>
          <Input
            type="date"
            value={formData.date_referred}
            onChange={(e) => setFormData({ ...formData, date_referred: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{"Referring Doctor"}</Label>
          <Input
            value={formData.referring_doctor}
            onChange={(e) => setFormData({ ...formData, referring_doctor: e.target.value })}
            placeholder="Referring doctor name"
          />
        </div>
      </div>

      {/* Urgency */}
      <div className="space-y-2">
        <Label>{"Urgency"}</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="stat">STAT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>{"Status"}</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REFERRAL_STATUS).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{"Notes"}</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? 'Saving...' : 'Save Referral'}
        </Button>
      </div>
    </form>
  );
}
