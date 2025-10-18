import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

export default function MedicationManagement() {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Amoxicillin 500mg',
      generic_name: 'Amoxicillin',
      dosage_forms: ['Capsule', 'Tablet', 'Suspension'],
      indications: ['Bacterial infections', 'Respiratory infections', 'UTI'],
      contraindications: ['Penicillin allergy', 'Severe liver disease'],
      side_effects: ['Nausea', 'Diarrhea', 'Rash'],
      interactions: ['Warfarin', 'Methotrexate'],
      dosage_adults: '250-500mg every 8 hours',
      dosage_pediatric: '20-40mg/kg/day in divided doses',
      pregnancy_category: 'B',
      controlled_substance: false,
      requires_prescription: true
    },
    {
      id: 2,
      name: 'Metformin 1000mg',
      generic_name: 'Metformin HCl',
      dosage_forms: ['Tablet', 'Extended Release'],
      indications: ['Type 2 Diabetes', 'PCOS'],
      contraindications: ['Severe renal impairment', 'Metabolic acidosis'],
      side_effects: ['GI upset', 'Metallic taste', 'Lactic acidosis'],
      interactions: ['Contrast media', 'Alcohol'],
      dosage_adults: '500-2000mg daily',
      dosage_pediatric: 'Not recommended under 10 years',
      pregnancy_category: 'B',
      controlled_substance: false,
      requires_prescription: true
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    prescription_required: 'all'
  });

  const filteredMedications = medications.filter(medication => {
    if (filters.search && !medication.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.prescription_required !== 'all' && medication.requires_prescription.toString() !== filters.prescription_required) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Medication Database
            </CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Prescription Required</Label>
              <Select value={filters.prescription_required} onValueChange={(value) => setFilters({...filters, prescription_required: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Medications</SelectItem>
                  <SelectItem value="true">Prescription Required</SelectItem>
                  <SelectItem value="false">Over the Counter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication: any) => (
          <Card key={medication.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{medication.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{medication.generic_name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Dosage Forms</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {medication.dosage_forms.map((form, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {form}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Indications</Label>
                <ul className="text-sm text-gray-700 mt-1">
                  {medication.indications.slice(0, 2).map((indication, index) => (
                    <li key={index}>• {indication}</li>
                  ))}
                  {medication.indications.length > 2 && (
                    <li className="text-gray-500">+{medication.indications.length - 2} more</li>
                  )}
                </ul>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Adult Dosage</Label>
                <p className="text-sm text-gray-700">{medication.dosage_adults}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {medication.requires_prescription && (
                    <Badge className="bg-blue-100 text-blue-800">Prescription Required</Badge>
                  )}
                  {medication.controlled_substance && (
                    <Badge className="bg-red-100 text-red-800">Controlled Substance</Badge>
                  )}
                </div>
                <Badge className="bg-gray-100 text-gray-800">
                  Category {medication.pregnancy_category}
                </Badge>
              </div>

              <div className="pt-2 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Activity className="w-4 h-4 mr-1" />
                    Interactions
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-1" />
                    Patients
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Medication Form */}
      <Card>
        <CardHeader>
          <CardTitle>{"Add New Medication"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medication_name">Medication Name</Label>
              <Input id="medication_name" placeholder="e.g., Amoxicillin 500mg" />
            </div>
            <div>
              <Label htmlFor="generic_name">Generic Name</Label>
              <Input id="generic_name" placeholder="e.g., Amoxicillin" />
            </div>
            <div>
              <Label htmlFor="dosage_forms">Dosage Forms</Label>
              <Input id="dosage_forms" placeholder="e.g., Capsule, Tablet, Suspension" />
            </div>
            <div>
              <Label htmlFor="indications">Indications</Label>
              <Textarea id="indications" placeholder="Primary uses and indications" rows={2} />
            </div>
            <div>
              <Label htmlFor="contraindications">Contraindications</Label>
              <Textarea id="contraindications" placeholder="When not to use this medication" rows={2} />
            </div>
            <div>
              <Label htmlFor="side_effects">Side Effects</Label>
              <Textarea id="side_effects" placeholder="Common side effects" rows={2} />
            </div>
            <div>
              <Label htmlFor="adult_dosage">Adult Dosage</Label>
              <Input id="adult_dosage" placeholder="e.g., 250-500mg every 8 hours" />
            </div>
            <div>
              <Label htmlFor="pediatric_dosage">Pediatric Dosage</Label>
              <Input id="pediatric_dosage" placeholder="e.g., 20-40mg/kg/day" />
            </div>
            <div>
              <Label htmlFor="pregnancy_category">Pregnancy Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Safe</SelectItem>
                  <SelectItem value="B">B - Probably Safe</SelectItem>
                  <SelectItem value="C">C - Use with Caution</SelectItem>
                  <SelectItem value="D">D - Evidence of Risk</SelectItem>
                  <SelectItem value="X">X - Contraindicated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="prescription_required">Prescription Required</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No (OTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline">Cancel</Button>
            <Button>{"Add Medication"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
