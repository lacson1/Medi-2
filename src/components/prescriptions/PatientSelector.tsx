import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Search,
    User,
    AlertTriangle,
    Pill,
    Heart,
    Activity,
    Calendar,
    FileText,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    weight?: number;
    height?: number;
    allergies: string[];
    currentMedications: Array<{
        id: string;
        name: string;
        dosage: string;
        frequency: string;
        status: 'active' | 'discontinued';
    }>;
    medicalHistory: Array<{
        condition: string;
        date: string;
        status: 'active' | 'resolved';
    }>;
    photo?: string;
    insuranceProvider?: string;
    lastVisit?: string;
}

interface PatientSelectorProps {
    patients: Patient[];
    onSelect: (patient: Patient) => void;
    selectedPatient?: Patient;
    showCurrentMedications?: boolean;
    showAllergies?: boolean;
    showMedicalHistory?: boolean;
}

export default function PatientSelector({
    patients,
    onSelect,
    selectedPatient,
    showCurrentMedications = true,
    showAllergies = true,
    showMedicalHistory = true
}: PatientSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients);

    useEffect(() => {
        if (searchTerm) {
            const filtered = patients.filter(patient =>
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPatients(filtered);
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getSeverityColor = (allergy: string) => {
        const severeAllergies = ['penicillin', 'sulfa', 'aspirin', 'latex'];
        return severeAllergies.some(severe =>
            allergy.toLowerCase().includes(severe)
        ) ? 'destructive' : 'secondary';
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search patients by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Selected Patient Display */}
            {selectedPatient && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            Selected Patient
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src={selectedPatient.photo} />
                                <AvatarFallback>{getInitials(selectedPatient.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedPatient.age} years old • {selectedPatient.gender}
                                    {selectedPatient.weight && ` • ${selectedPatient.weight}kg`}
                                </p>
                                {selectedPatient.insuranceProvider && (
                                    <p className="text-xs text-gray-500">
                                        Insurance: {selectedPatient.insuranceProvider}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Allergies Alert */}
                        {showAllergies && selectedPatient.allergies.length > 0 && (
                            <Alert className="mt-4 border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    <strong>Allergies:</strong> {selectedPatient.allergies.join(', ')}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Current Medications */}
                        {showCurrentMedications && selectedPatient.currentMedications.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Current Medications:</h4>
                                <div className="space-y-2">
                                    {selectedPatient.currentMedications.map((med) => (
                                        <div key={med.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                            <div className="flex items-center gap-2">
                                                <Pill className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium">{med.name}</span>
                                                <span className="text-xs text-gray-500">{med.dosage} {med.frequency}</span>
                                            </div>
                                            <Badge variant={med.status === 'active' ? 'default' : 'secondary'}>
                                                {med.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Medical History */}
                        {showMedicalHistory && selectedPatient.medicalHistory.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Recent Medical History:</h4>
                                <div className="space-y-1">
                                    {selectedPatient.medicalHistory.slice(0, 3).map((condition, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <FileText className="w-3 h-3 text-gray-500" />
                                            <span>{condition.condition}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {condition.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients.map((patient) => (
                    <Card
                        key={patient.id}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedPatient?.id === patient.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                            }`}
                        onClick={() => onSelect(patient)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={patient.photo} />
                                    <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="font-medium">{patient.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {patient.age} years old • {patient.gender}
                                        {patient.weight && ` • ${patient.weight}kg`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {patient.allergies.length > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {patient.allergies.length} allergies
                                            </Badge>
                                        )}
                                        {patient.currentMedications.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {patient.currentMedications.filter(m => m.status === 'active').length} active meds
                                            </Badge>
                                        )}
                                        {patient.lastVisit && (
                                            <Badge variant="outline" className="text-xs">
                                                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant={selectedPatient?.id === patient.id ? "default" : "outline"}
                                    size="sm"
                                >
                                    {selectedPatient?.id === patient.id ? 'Selected' : 'Select'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPatients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No patients found matching your search</p>
                </div>
            )}
        </div>
    );
}
