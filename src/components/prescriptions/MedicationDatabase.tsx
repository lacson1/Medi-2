import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Pill,
  Activity
} from "lucide-react";
import { medications, medicationCategories } from "@/data/medications";

export default function MedicationDatabase({ onMedicationSelect, onMedicationEdit }: any) {
  const [medicationList, setMedicationList] = useState(medications);
  const [filteredMedications, setFilteredMedications] = useState(medications);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, categoryFilter, statusFilter, medicationList]);

  const applyFilters = () => {
    let filtered = [...medicationList];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.indication.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (med.brandNames && med.brandNames.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(med => med.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(med => med.status === statusFilter);
    }

    setFilteredMedications(filtered);
  };

  const handleMedicationClick = (medication: any) => {
    setSelectedMedication(medication);
    setShowDetails(true);
    if (onMedicationSelect) {
      onMedicationSelect(medication);
    }
  };

  const handleEditMedication = (medication: any) => {
    if (onMedicationEdit) {
      onMedicationEdit(medication);
    }
  };

  const handleDeleteMedication = (medicationId: any) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      setMedicationList(prev => prev.filter(med => med.id !== medicationId));
    }
  };

  const exportMedications = () => {
    const csvContent = [
      ['Name', 'Category', 'Dosage', 'Frequency', 'Indication', 'Route', 'Generic', 'Brand Names', 'NDC'],
      ...filteredMedications.map(med => [
        med.name,
        med.category,
        med.dosage,
        med.frequency,
        med.indication,
        med.route,
        med.generic ? 'Yes' : 'No',
        med.brandNames || '',
        med.ndc || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medication-database-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: any) => {
    const colors = {
      'Antibiotic': 'bg-blue-100 text-blue-800 border-blue-200',
      'Antihypertensive': 'bg-red-100 text-red-800 border-red-200',
      'Antidiabetic': 'bg-green-100 text-green-800 border-green-200',
      'Statin': 'bg-purple-100 text-purple-800 border-purple-200',
      'Anticoagulant': 'bg-orange-100 text-orange-800 border-orange-200',
      'Analgesic': 'bg-pink-100 text-pink-800 border-pink-200',
      'Antidepressant': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Anxiolytic': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Bronchodilator': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Antihistamine': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPregnancyCategoryColor = (category: any) => {
    const colors = {
      'A': 'bg-green-100 text-green-800 border-green-200',
      'B': 'bg-blue-100 text-blue-800 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'D': 'bg-orange-100 text-orange-800 border-orange-200',
      'X': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medication Database</h2>
          <p className="text-gray-600">Manage and search the medication database</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMedications}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{"Search"}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{"Category"}</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {medicationCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{"Status"}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{"Results"}</Label>
              <div className="flex items-center h-10 px-3 py-2 text-sm text-gray-600 bg-gray-50 border rounded-md">
                {filteredMedications.length} medications found
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5" />
              Medications ({filteredMedications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMedications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No medications found</p>
              </div>
            ) : (
              filteredMedications.map((medication: any) => (
                <div
                  key={medication.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleMedicationClick(medication)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{medication.name}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(medication.category)}>
                          {medication.category}
                        </Badge>
                        {medication.generic && (
                          <Badge variant="outline" className="text-xs">
                            Generic
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMedication(medication);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMedication(medication.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Dosage:</strong> {medication.dosage}</p>
                    <p><strong>Frequency:</strong> {medication.frequency}</p>
                    <p><strong>Indication:</strong> {medication.indication}</p>
                    {medication.brandNames && (
                      <p><strong>Brand Names:</strong> {medication.brandNames}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Details View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Medication Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMedication ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{selectedMedication.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(selectedMedication.category)}>
                        {selectedMedication.category}
                      </Badge>
                      {selectedMedication.generic && (
                        <Badge variant="outline">Generic Available</Badge>
                      )}
                    </div>
                  </div>
                  {selectedMedication.pregnancyCategory && (
                    <Badge className={getPregnancyCategoryColor(selectedMedication.pregnancyCategory)}>
                      Pregnancy {selectedMedication.pregnancyCategory}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Dosage:</p>
                    <p>{selectedMedication.dosage}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Frequency:</p>
                    <p>{selectedMedication.frequency}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Route:</p>
                    <p className="capitalize">{selectedMedication.route}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Indication:</p>
                    <p>{selectedMedication.indication}</p>
                  </div>
                </div>

                {selectedMedication.brandNames && (
                  <div>
                    <p className="font-semibold text-sm">Brand Names:</p>
                    <p className="text-sm">{selectedMedication.brandNames}</p>
                  </div>
                )}

                {selectedMedication.ndc && (
                  <div>
                    <p className="font-semibold text-sm">NDC Number:</p>
                    <p className="text-sm font-mono">{selectedMedication.ndc}</p>
                  </div>
                )}

                {selectedMedication.sideEffects && selectedMedication.sideEffects.length > 0 && (
                  <div>
                    <p className="font-semibold text-sm">Side Effects:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedMedication.sideEffects.map((sideEffect, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sideEffect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMedication.interactions && (
                  <div>
                    <p className="font-semibold text-sm">Drug Interactions:</p>
                    <p className="text-sm">{selectedMedication.interactions}</p>
                  </div>
                )}

                {selectedMedication.contraindications && (
                  <div>
                    <p className="font-semibold text-sm">Contraindications:</p>
                    <p className="text-sm">{selectedMedication.contraindications}</p>
                  </div>
                )}

                {selectedMedication.monitoring && (
                  <div>
                    <p className="font-semibold text-sm">Monitoring Required:</p>
                    <p className="text-sm">{selectedMedication.monitoring}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleEditMedication(selectedMedication)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Medication
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMedicationSelect && onMedicationSelect(selectedMedication)}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Use This Medication
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a medication to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{medicationList.length}</p>
              <p className="text-sm text-gray-600">Total Medications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {medicationList.filter(med => med.generic).length}
              </p>
              <p className="text-sm text-gray-600">Generic Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(medicationList.map(med => med.category)).size}
              </p>
              <p className="text-sm text-gray-600">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {medicationList.filter(med => med.pregnancyCategory === 'X').length}
              </p>
              <p className="text-sm text-gray-600">Pregnancy Category X</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

MedicationDatabase.propTypes = {
  onMedicationSelect: PropTypes.func,
  onMedicationEdit: PropTypes.func
};
