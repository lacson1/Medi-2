import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pill,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import NewMedicationForm from '@/components/medications/NewMedicationForm';
import { medications } from '@/data/medications';

export default function MedicationFormDemo() {
  const [medicationList, setMedicationList] = useState(medications.slice(0, 10));
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const handleSaveMedication = async (medicationData) => {
    try {
      if (editingMedication) {
        // Update existing medication
        setMedicationList(prev =>
          prev.map(med =>
            med.id === editingMedication.id
              ? { ...medicationData, id: editingMedication.id }
              : med
          )
        );
        setEditingMedication(null);
      } else {
        // Add new medication
        const newMedication = {
          ...medicationData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        setMedicationList(prev => [newMedication, ...prev]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving medication:', error);
      throw error;
    }
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDeleteMedication = (medicationId: any) => {
    setMedicationList(prev => prev.filter(med => med.id !== medicationId));
  };

  const filteredMedications = medicationList.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      med.genericName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || med.category === filters.category;
    const matchesStatus = filters.status === 'all' || med.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(medicationList.map(med => med.category))];

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <NewMedicationForm
          medication={editingMedication}
          onSave={handleSaveMedication}
          onCancel={() => {
            setShowForm(false);
            setEditingMedication(null);
          }}
          existingMedications={medicationList}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Pill className="w-8 h-8 text-blue-600" />
            Medication Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your medication database with comprehensive forms and validation
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Medication
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Medications</p>
                <p className="text-2xl font-bold text-gray-900">{medicationList.length}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicationList.filter(med => med.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generic Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicationList.filter(med => med.generic).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter medications by category"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter medications by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Medications ({filteredMedications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMedications.map(medication => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                      <Badge variant="secondary">{medication.category}</Badge>
                      {medication.generic && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Generic Available
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Generic Name:</span> {medication.genericName}
                      </div>
                      <div>
                        <span className="font-medium">Dosage:</span> {medication.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {medication.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Indication:</span> {medication.indication}
                      </div>
                      <div>
                        <span className="font-medium">Route:</span> {medication.route}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge
                          variant={medication.status === 'active' ? 'default' : 'secondary'}
                          className="ml-2"
                        >
                          {medication.status}
                        </Badge>
                      </div>
                    </div>

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">Side Effects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {medication.sideEffects.slice(0, 3).map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {effect}
                            </Badge>
                          ))}
                          {medication.sideEffects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{medication.sideEffects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditMedication(medication)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMedication(medication.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredMedications.length === 0 && (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.category !== 'all' || filters.status !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by adding your first medication.'}
                </p>
                {(!filters.search && filters.category === 'all' && filters.status === 'all') && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Medication
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
