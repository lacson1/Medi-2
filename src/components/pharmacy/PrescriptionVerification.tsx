import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  User,
  Pill,
  FileText,
  Eye,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function PrescriptionVerification() {
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patient_name: 'John Doe',
      patient_id: 'P001',
      medication_name: 'Amoxicillin 500mg',
      dosage: '500mg',
      frequency: 'Three times daily',
      quantity: 21,
      prescribing_doctor: 'Dr. Smith',
      date_prescribed: '2024-01-15',
      status: 'pending',
      verification_notes: '',
      verified_by: null,
      verified_date: null,
      interactions: [],
      allergies: ['Penicillin'],
      insurance_verified: false
    },
    {
      id: 2,
      patient_name: 'Jane Smith',
      patient_id: 'P002',
      medication_name: 'Metformin 1000mg',
      dosage: '1000mg',
      frequency: 'Once daily',
      quantity: 30,
      prescribing_doctor: 'Dr. Johnson',
      date_prescribed: '2024-01-14',
      status: 'verified',
      verification_notes: 'Patient counseled on side effects',
      verified_by: 'Pharmacist A',
      verified_date: '2024-01-14T10:30:00Z',
      interactions: [],
      allergies: [],
      insurance_verified: true
    }
  ]);

  const [filters, setFilters] = useState({
    status: 'all',
    doctor: 'all',
    search: ''
  });

  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filters.status !== 'all' && prescription.status !== filters.status) return false;
    if (filters.doctor !== 'all' && prescription.prescribing_doctor !== filters.doctor) return false;
    if (filters.search && !prescription.patient_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const verificationMetrics = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    verified: prescriptions.filter(p => p.status === 'verified').length,
    rejected: prescriptions.filter(p => p.status === 'rejected').length
  };

  const handleVerification = (prescriptionId, action, notes) => {
    setPrescriptions(prev => prev.map(pres => 
      pres.id === prescriptionId 
        ? { 
            ...pres, 
            status: action, 
            verification_notes: notes,
            verified_by: 'Current Pharmacist',
            verified_date: new Date().toISOString()
          }
        : pres
    ));
    setIsVerificationOpen(false);
    setSelectedPrescription(null);
  };

  const openVerification = (prescription: any) => {
    setSelectedPrescription(prescription);
    setIsVerificationOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900">{verificationMetrics.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{verificationMetrics.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verificationMetrics.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{verificationMetrics.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Prescription Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Prescribing Doctor</Label>
              <Select value={filters.doctor} onValueChange={(value) => setFilters({...filters, doctor: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                  <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filteredPrescriptions.map((prescription: any) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{prescription.patient_name}</h3>
                    <Badge className={
                      prescription.status === 'verified' ? 'bg-green-100 text-green-800' :
                      prescription.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {prescription.status}
                    </Badge>
                    {prescription.allergies.length > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Allergies
                      </Badge>
                    )}
                    {prescription.interactions.length > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Interactions
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-600">Medication</Label>
                      <p className="font-medium">{prescription.medication_name}</p>
                      <p className="text-gray-500">{prescription.dosage} - {prescription.frequency}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Prescribing Doctor</Label>
                      <p className="font-medium">{prescription.prescribing_doctor}</p>
                      <p className="text-gray-500">{format(parseISO(prescription.date_prescribed), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Quantity</Label>
                      <p className="font-medium">{prescription.quantity} tablets</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Insurance</Label>
                      <div className="flex items-center gap-1">
                        {prescription.insurance_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={prescription.insurance_verified ? 'text-green-600' : 'text-red-600'}>
                          {prescription.insurance_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {prescription.allergies.length > 0 && (
                    <Alert className="mt-3 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Allergies:</strong> {prescription.allergies.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {prescription.verification_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium text-gray-600">Verification Notes</Label>
                      <p className="text-sm text-gray-700">{prescription.verification_notes}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Verified by {prescription.verified_by} on {format(parseISO(prescription.verified_date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => openVerification(prescription)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  {prescription.status === 'pending' && (
                    <Button size="sm" onClick={() => openVerification(prescription)}>
                      <Shield className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Dialog */}
      {isVerificationOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Verify Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Patient</Label>
                  <p className="font-medium">{selectedPrescription.patient_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Medication</Label>
                  <p className="font-medium">{selectedPrescription.medication_name}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Verification Notes</Label>
                <Textarea
                  placeholder="Enter verification notes..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsVerificationOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleVerification(selectedPrescription.id, 'rejected', 'Rejected due to concerns')}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={() => handleVerification(selectedPrescription.id, 'verified', 'Prescription verified and approved')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
