import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Users,
    Calendar,
    BarChart3,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Clock,
    CheckCircle,
    AlertTriangle,
    UserCog
} from 'lucide-react';
// @ts-expect-error - Module has no type declarations
import { mockSpecialtyConsultations, mockSpecialists, mockConsultationTemplates } from '@/data/consultationData';
import ConsultationAnalytics from '@/components/consultations/ConsultationAnalytics';
import ConsultationTemplateLibrary from '@/components/consultations/ConsultationTemplateLibrary';
import ConsultationWorkflowAutomation from '@/components/consultations/ConsultationWorkflowAutomation';
import SpecialtyConsultationForm from '@/components/specialty-consultations/SpecialtyConsultationForm';

export default function ConsultationManagement() {
    const [consultations, setConsultations] = useState(mockSpecialtyConsultations);
    const [activeTab, setActiveTab] = useState('overview');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');

    const filteredConsultations = consultations.filter((consultation: any) => {
        const matchesSearch = consultation.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consultation.specialist_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
        const matchesSpecialty = specialtyFilter === 'all' ||
            mockSpecialists.find((s: any) => s.id === consultation.specialist_id)?.specialty === specialtyFilter;

        return matchesSearch && matchesStatus && matchesSpecialty;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'in_progress': return <UserCog className="w-4 h-4" />;
            case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const handleCreateConsultation = () => {
        setSelectedConsultation(null);
        setIsFormOpen(true);
    };

    const handleEditConsultation = (consultation: any) => {
        setSelectedConsultation(consultation);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (formData: any) => {
        if (selectedConsultation) {
            // Update existing consultation
            setConsultations(consultations.map((c: any) =>
                c.id === selectedConsultation.id
                    ? { ...c, ...formData, updated_at: new Date().toISOString() }
                    : c
            ));
        } else {
            // Create new consultation
            const newConsultation = {
                id: Date.now().toString(),
                ...formData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setConsultations([...consultations, newConsultation]);
        }
        setIsFormOpen(false);
        setSelectedConsultation(null);
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedConsultation(null);
    };

    const handleDeleteConsultation = (consultationId: string) => {
        setConsultations(consultations.filter((c: any) => c.id !== consultationId));
    };

    const getConsultationStats = () => {
        const total = consultations.length;
        const completed = consultations.filter((c: any) => c.status === 'completed').length;
        const pending = consultations.filter((c: any) => c.status === 'pending').length;
        const inProgress = consultations.filter((c: any) => c.status === 'in_progress').length;
        const cancelled = consultations.filter((c: any) => c.status === 'cancelled').length;

        return { total, completed, pending, inProgress, cancelled };
    };

    const stats = getConsultationStats();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consultation Management</h1>
                    <p className="text-gray-600">Comprehensive specialty consultation management system</p>
                </div>
                <Button onClick={handleCreateConsultation} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Consultation
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Users className="w-8 h-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <UserCog className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="consultations">Consultations</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="workflows">Workflows</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Consultations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Recent Consultations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {consultations.slice(0, 5).map((consultation) => (
                                        <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(consultation.status)}
                                                <div>
                                                    <p className="font-medium">{consultation.patient_name}</p>
                                                    <p className="text-sm text-gray-600">{consultation.specialist_name}</p>
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(consultation.status)}>
                                                {consultation.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Specialist Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Specialist Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {mockSpecialists.slice(0, 5).map((specialist: any) => {
                                        const specialistConsultations = consultations.filter((c: any) => c.specialist_id === specialist.id);
                                        const completedConsultations = specialistConsultations.filter((c: any) => c.status === 'completed').length;
                                        const completionRate = specialistConsultations.length > 0 ?
                                            Math.round((completedConsultations / specialistConsultations.length) * 100) : 0;

                                        return (
                                            <div key={specialist.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{specialist.full_name}</p>
                                                    <p className="text-sm text-gray-600">{specialist.specialty}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{specialistConsultations.length} consultations</p>
                                                    <p className="text-sm text-gray-600">{completionRate}% completion</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="consultations" className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search consultations..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    title="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <select
                                    value={specialtyFilter}
                                    onChange={(e) => setSpecialtyFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    title="Filter by specialty"
                                >
                                    <option value="all">All Specialties</option>
                                    {Array.from(new Set(mockSpecialists.map((s: any) => s.specialty))).map((specialty: any) => (
                                        <option key={specialty} value={specialty}>{specialty}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consultations List */}
                    <div className="space-y-4">
                        {filteredConsultations.map((consultation) => (
                            <Card key={consultation.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">{consultation.patient_name}</h3>
                                                <Badge className={getStatusColor(consultation.status)}>
                                                    {consultation.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {mockSpecialists.find((s: any) => s.id === consultation.specialist_id)?.specialty}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Specialist</p>
                                                    <p className="font-medium">{consultation.specialist_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Template</p>
                                                    <p className="font-medium">{consultation.template_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Date</p>
                                                    <p className="font-medium">
                                                        {new Date(consultation.consultation_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Summary</p>
                                                    <p className="font-medium line-clamp-2">{consultation.summary}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditConsultation(consultation)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditConsultation(consultation)}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteConsultation(consultation.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <ConsultationAnalytics consultations={consultations} specialists={mockSpecialists} />
                </TabsContent>

                <TabsContent value="templates">
                    <ConsultationTemplateLibrary />
                </TabsContent>

                <TabsContent value="workflows">
                    <ConsultationWorkflowAutomation />
                </TabsContent>
            </Tabs>

            {/* Consultation Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedConsultation ? 'Edit Consultation' : 'Create New Consultation'}
                        </DialogTitle>
                    </DialogHeader>
                    <SpecialtyConsultationForm
                        consultation={selectedConsultation}
                        patient={selectedConsultation ? {
                            id: selectedConsultation.patient_id,
                            first_name: selectedConsultation.patient_name.split(' ')[0],
                            last_name: selectedConsultation.patient_name.split(' ')[1]
                        } : null}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isSubmitting={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
