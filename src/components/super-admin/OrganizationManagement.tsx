import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  PowerOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Activity,
  DollarSign,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { mockApiClient } from "@/api/mockApiClient";
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

// Organization types with comprehensive options
const ORGANIZATION_TYPES = [
  { value: 'hospital', label: 'Hospital', description: 'General hospital with multiple departments' },
  { value: 'clinic', label: 'Clinic', description: 'Outpatient medical clinic' },
  { value: 'private_practice', label: 'Private Practice', description: 'Individual or group practice' },
  { value: 'urgent_care', label: 'Urgent Care', description: 'Walk-in urgent care center' },
  { value: 'pharmacy', label: 'Pharmacy', description: 'Retail or hospital pharmacy' },
  { value: 'laboratory', label: 'Laboratory', description: 'Medical testing laboratory' },
  { value: 'imaging_center', label: 'Imaging Center', description: 'Radiology and imaging services' },
  { value: 'nursing_home', label: 'Nursing Home', description: 'Long-term care facility' },
  { value: 'rehabilitation_center', label: 'Rehabilitation Center', description: 'Physical therapy and rehab' },
  { value: 'mental_health_center', label: 'Mental Health Center', description: 'Psychiatric and mental health services' },
  { value: 'dental_clinic', label: 'Dental Clinic', description: 'Dental care services' },
  { value: 'specialty_center', label: 'Specialty Center', description: 'Specialized medical center' },
  { value: 'health_center', label: 'Health Center', description: 'Community health center' },
  { value: 'telemedicine', label: 'Telemedicine', description: 'Virtual healthcare services' },
  { value: 'other', label: 'Other', description: 'Other healthcare organization' }
];

// Address autocomplete service (mock implementation - replace with real service)
const addressAutocompleteService = {
  async searchAddress(query) {
    // Mock implementation - replace with real address service like Google Places API
    const mockAddresses = [
      {
        formatted_address: "123 Main St, New York, NY 10001, USA",
        components: {
          street_number: "123",
          route: "Main St",
          locality: "New York",
          administrative_area_level_1: "NY",
          postal_code: "10001",
          country: "USA"
        },
        place_id: "mock_place_1"
      },
      {
        formatted_address: "456 Oak Ave, Los Angeles, CA 90210, USA",
        components: {
          street_number: "456",
          route: "Oak Ave",
          locality: "Los Angeles",
          administrative_area_level_1: "CA",
          postal_code: "90210",
          country: "USA"
        },
        place_id: "mock_place_2"
      }
    ];

    return mockAddresses.filter(addr =>
      addr.formatted_address.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Enhanced Organization Form Component
function OrganizationForm({ organization, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(organization || {
    name: "",
    type: "clinic",
    registration_number: "",
    tax_id: "",
    license_number: "",
    accreditation: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "USA"
    },
    contact: {
      phone: "",
      email: "",
      website: "",
      emergency_phone: ""
    },
    settings: {
      timezone: "America/New_York",
      currency: "USD",
      date_format: "MM/DD/YYYY",
      appointment_duration: 30
    },
    subscription: {
      plan: "basic",
      status: "active",
      user_limit: 5,
      patient_limit: 100
    },
    status: "active",
    is_active: true
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Address autocomplete handler
  const handleAddressSearch = useCallback(async (query) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const suggestions = await addressAutocompleteService.searchAddress(query);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Address search failed:', error);
      toast.error('Failed to search addresses');
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  const handleAddressSelect = useCallback((suggestion) => {
    const components = suggestion.components;
    setFormData(prev => ({
      ...prev,
      address: {
        street: `${components.street_number || ''} ${components.route || ''}`.trim(),
        city: components.locality || '',
        state: components.administrative_area_level_1 || '',
        postal_code: components.postal_code || '',
        country: components.country || 'USA'
      }
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter organization name");
      return;
    }

    if (!formData.type) {
      toast.error("Please select organization type");
      return;
    }

    if (!formData.address.street.trim()) {
      toast.error("Please enter street address");
      return;
    }

    if (!formData.contact.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Basic Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., City Medical Center"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <Select
              required
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Registration Number</label>
            <Input
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              placeholder="Business registration #"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tax ID</label>
            <Input
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="Tax identification #"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">License Number</label>
            <Input
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="Medical license #"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Accreditation</label>
            <Input
              value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
              placeholder="e.g., Joint Commission"
            />
          </div>
        </div>
      </div>

      {/* Address with Autocomplete */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Address</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Street Address *</label>
          <div className="relative">
            <Input
              required
              value={formData.address.street}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                });
                handleAddressSearch(e.target.value);
              }}
              placeholder="Start typing address..."
              className="pr-10"
            />
            {isSearchingAddress && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
            )}
            {showAddressSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAddressSelect(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suggestion.formatted_address}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Input
              value={formData.address.city}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="City"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">State/Province</label>
            <Input
              value={formData.address.state}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Postal Code</label>
            <Input
              value={formData.address.postal_code}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, postal_code: e.target.value }
              })}
              placeholder="12345"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Input
              value={formData.address.country}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, country: e.target.value }
              })}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Contact Information</h3>

        {/* Contact Names */}
        <div className="space-y-4">
          <h4 className="font-medium text-md">Contact Persons</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Contact Name</label>
              <Input
                value={formData.contact.primary_contact_name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, primary_contact_name: e.target.value }
                })}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Contact Name</label>
              <Input
                value={formData.contact.secondary_contact_name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, secondary_contact_name: e.target.value }
                })}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Administrative Contact</label>
              <Input
                value={formData.contact.admin_contact_name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, admin_contact_name: e.target.value }
                })}
                placeholder="Administrator Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Technical Contact</label>
              <Input
                value={formData.contact.tech_contact_name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, tech_contact_name: e.target.value }
                })}
                placeholder="IT Support Contact"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-md">Contact Details</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.contact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, phone: e.target.value }
                })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                required
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value }
                })}
                placeholder="contact@organization.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={formData.contact.website}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, website: e.target.value }
                })}
                placeholder="https://www.organization.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Phone</label>
              <Input
                value={formData.contact.emergency_phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, emergency_phone: e.target.value }
                })}
                placeholder="+1 (555) 911-0000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Subscription & Limits</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <Select
              value={formData.subscription.plan}
              onValueChange={(v) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, plan: v }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">User Limit</label>
            <Input
              type="number"
              min="1"
              value={formData.subscription.user_limit}
              onChange={(e) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, user_limit: parseInt(e.target.value) }
              })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient Limit</label>
            <Input
              type="number"
              min="1"
              value={formData.subscription.patient_limit}
              onChange={(e) => setFormData({
                ...formData,
                subscription: { ...formData.subscription, patient_limit: parseInt(e.target.value) }
              })}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg">Status</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium">Organization Status</label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v, is_active: v === 'active' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {organization ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
}

// Main Organization Management Component
export default function OrganizationManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch organizations from database
  const { data: organizations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => mockApiClient.entities.Organization.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create organization mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowForm(false);
      toast.success('Organization created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create organization: ${error.message}`);
    }
  });

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.Organization.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowForm(false);
      setEditingOrganization(null);
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update organization: ${error.message}`);
    }
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: (id: any) => mockApiClient.entities.Organization.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setDeleteConfirm(null);
      toast.success('Organization deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete organization: ${error.message}`);
    }
  });

  // Toggle organization status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => mockApiClient.entities.Organization.update(id, {
      is_active,
      status: is_active ? 'active' : 'inactive'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update organization status: ${error.message}`);
    }
  });

  // Filter and sort organizations
  const filteredAndSortedOrganizations = useMemo(() => {
    let filtered = organizations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      const matchesType = typeFilter === 'all' || org.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort organizations
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [organizations, searchTerm, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFormSubmit = (data: any) => {
    if (editingOrganization) {
      updateMutation.mutate({ id: editingOrganization.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleStatus = (org: any) => {
    toggleStatusMutation.mutate({
      id: org.id,
      is_active: !org.is_active
    });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: any) => {
    const typeConfig = ORGANIZATION_TYPES.find(t => t.value === type);
    if (!typeConfig) return 'bg-gray-100 text-gray-800';

    const colors = {
      hospital: 'bg-blue-100 text-blue-800',
      clinic: 'bg-purple-100 text-purple-800',
      pharmacy: 'bg-green-100 text-green-800',
      laboratory: 'bg-orange-100 text-orange-800',
      nursing_home: 'bg-pink-100 text-pink-800',
      default: 'bg-gray-100 text-gray-800'
    };

    return colors[type] || colors.default;
  };

  const SortButton = ({ field, children }: any) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2 lg:px-3"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error Loading Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message}
            </AlertDescription>
          </Alert>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Organization Management</h2>
          <p className="text-sm text-gray-600">
            Manage all healthcare organizations in the system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> : organizations.length}
            </div>
            <p className="text-xs text-gray-500">
              {organizations.filter(org => org.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Organizations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                organizations.filter(org => org.is_active).length}
            </div>
            <p className="text-xs text-gray-500">
              {Math.round((organizations.filter(org => org.is_active).length / organizations.length) * 100) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Organizations</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                organizations.filter(org => org.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Organization Types</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Skeleton className="h-8 w-12" /> :
                new Set(organizations.map(org => org.type)).size}
            </div>
            <p className="text-xs text-gray-500">
              Different types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ORGANIZATION_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing {filteredAndSortedOrganizations.length} of {organizations.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>{"Organizations"}</CardTitle>
          <CardDescription>
            Complete list of all healthcare organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Organization</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="type">Type</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="status">Status</SortButton>
                  </TableHead>
                  <TableHead>{"Address"}</TableHead>
                  <TableHead>{"Contact"}</TableHead>
                  <TableHead>
                    <SortButton field="createdAt">Created</SortButton>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedOrganizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No organizations found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedOrganizations.map((org: any) => (
                    <TableRow key={org.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{org.name}</div>
                            {org.registration_number && (
                              <div className="text-xs text-gray-500">Reg: {org.registration_number}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(org.type)}>
                          {ORGANIZATION_TYPES.find(t => t.value === org.type)?.label || org.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(org.status)}>
                          {org.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{org.address?.street}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {org.address?.city}, {org.address?.state} {org.address?.postal_code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {org.contact?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">{org.contact.phone}</span>
                            </div>
                          )}
                          {org.contact?.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">{org.contact.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {org.createdAt ? format(parseISO(org.createdAt), 'MMM d, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingOrganization(org);
                              setShowForm(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(org)}>
                              {org.is_active ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm(org)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Organization Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingOrganization(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrganization ? 'Edit Organization' : 'Add New Organization'}
            </DialogTitle>
            <DialogDescription>
              {editingOrganization
                ? 'Update organization information and settings'
                : 'Create a new healthcare organization in the system'
              }
            </DialogDescription>
          </DialogHeader>
          <OrganizationForm
            organization={editingOrganization}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOrganization(null);
            }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => {
        if (!open) setDeleteConfirm(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"Delete Organization"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
