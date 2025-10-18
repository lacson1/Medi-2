import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApiClient } from "@/api/mockApiClient";
// import { PharmacyActivity, Medication } from '@/types/index';

// Local interface definitions
interface PharmacyActivity {
  id: string;
  medication_id: string;
  patient_id: string;
  activity_type: 'dispensed' | 'returned' | 'refill_requested' | 'interaction_check' | 'counseling';
  quantity?: number;
  dosage?: string;
  pharmacist_id?: string;
  notes?: string;
  timestamp: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

interface Medication {
  id: string;
  name: string;
  generic_name?: string;
  dosage_form: string;
  strength?: string;
  manufacturer?: string;
  ndc_code?: string;
  description?: string;
  side_effects?: string[];
  contraindications?: string[];
  interactions?: string[];
  storage_instructions?: string;
  cost?: number;
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
  Activity,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const ACTIVITY_TYPES = {
  restock: { label: 'Restock', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  dispense: { label: 'Dispense', color: 'bg-blue-100 text-blue-800', icon: Package },
  adjustment: { label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  expiry: { label: 'Expiry Check', color: 'bg-red-100 text-red-800', icon: Clock },
  audit: { label: 'Audit', color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
  transfer: { label: 'Transfer', color: 'bg-cyan-100 text-cyan-800', icon: Activity },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-800', icon: Activity }
};

export default function PharmacyActivityLog() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filters, setFilters] = useState({
    activity_type: 'all',
    date_range: '7d',
    search: ''
  });
  const queryClient = useQueryClient();

  // Fetch pharmacy activities
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['pharmacyActivities', filters],
    queryFn: () => PharmacyActivity.list(),
  });

  // Fetch medications for selection
  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => Medication.list(),
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: (data: any) => PharmacyActivity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacyActivities'] });
      toast.success('Activity logged successfully');
      setIsFormOpen(false);
      setSelectedActivity(null);
    },
    onError: (error: any) => {
      toast.error('Failed to log activity');
      console.error('Error creating activity:', error);
    }
  });

  // Filter activities
  const filteredActivities = React.useMemo(() => {
    return activities.filter(activity => {
      // Activity type filter
      if (filters.activity_type !== 'all' && activity.activity_type !== filters.activity_type) {
        return false;
      }

      // Search filter
      if (filters.search && !activity.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (filters.date_range !== 'all') {
        const activityDate = parseISO(activity.timestamp);
        const now = new Date();
        const daysAgo = parseInt(filters.date_range.replace('d', ''));

        if (daysAgo && (now - activityDate) > (daysAgo * 24 * 60 * 60 * 1000)) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filters]);

  const handleFormSubmit = (data: any) => {
    createActivityMutation.mutate(data);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedActivity(null);
  };

  const getActivityTypeConfig = (type: any) => {
    return ACTIVITY_TYPES[type] || ACTIVITY_TYPES.other;
  };

  if (loadingActivities) {
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
            <Activity className="w-6 h-6 text-blue-600" />
            Pharmacy Activity Log
          </h2>
          <p className="text-gray-600 mt-1">Track all pharmacy activities and inventory changes</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Log Activity
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
              <Label>{"Activity Type"}</Label>
              <Select value={filters.activity_type} onValueChange={(value) => setFilters({ ...filters, activity_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
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
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
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
                  placeholder="Search activities..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ activity_type: 'all', date_range: '7d', search: '' })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activities ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity: any) => {
                const typeConfig = getActivityTypeConfig(activity.activity_type);
                const medication = medications.find(m => m.id === activity.medication_id);

                return (
                  <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={typeConfig.color}>
                            <typeConfig.icon className="w-3 h-3 mr-1" />
                            {typeConfig.label}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(activity.timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">{activity.description}</p>

                          {medication && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Package className="w-4 h-4" />
                              <span><strong>Medication:</strong> {medication.name}</span>
                              {activity.quantity && (
                                <span><strong>Quantity:</strong> {activity.quantity}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span><strong>Performed by:</strong> {activity.performed_by || 'System'}</span>
                          </div>

                          {activity.notes && (
                            <p className="text-sm text-gray-600 italic">{activity.notes}</p>
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
              <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No activities found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Activity Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Log Pharmacy Activity
            </DialogTitle>
          </DialogHeader>
          <PharmacyActivityForm
            activity={selectedActivity}
            medications={medications}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isSubmitting={createActivityMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pharmacy Activity Form Component
function PharmacyActivityForm({ activity, medications, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(activity || {
    activity_type: 'restock',
    description: '',
    medication_id: '',
    quantity: '',
    performed_by: '',
    notes: '',
    timestamp: new Date().toISOString()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      toast.error('Please enter activity description');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Activity Type */}
      <div className="space-y-2">
        <Label>{"Activity Type *"}</Label>
        <Select
          value={formData.activity_type}
          onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
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

      {/* Description */}
      <div className="space-y-2">
        <Label>{"Description *"}</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the activity..."
          required
        />
      </div>

      {/* Medication */}
      <div className="space-y-2">
        <Label>{"Medication"}</Label>
        <Select
          value={formData.medication_id}
          onValueChange={(value) => setFormData({ ...formData, medication_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select medication (optional)" />
          </SelectTrigger>
          <SelectContent>
            {medications.map((medication: any) => (
              <SelectItem key={medication.id} value={medication.id}>
                {medication.name} - {medication.generic_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label>{"Quantity"}</Label>
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="Enter quantity (optional)"
        />
      </div>

      {/* Performed By */}
      <div className="space-y-2">
        <Label>{"Performed By"}</Label>
        <Input
          value={formData.performed_by}
          onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
          placeholder="Enter name or ID"
        />
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
          {isSubmitting ? 'Logging...' : 'Log Activity'}
        </Button>
      </div>
    </form>
  );
}
