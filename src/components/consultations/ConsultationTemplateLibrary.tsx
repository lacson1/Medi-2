import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Eye,
    Copy,
    Trash2,
    Download,
    Upload,
    Star,
    StarOff,
    FileText,
    Users,
    Calendar,
    BarChart3,
    Heart,
    Brain,
    Baby,
    Bone,
    Activity,
    Shield
} from 'lucide-react';
import { mockConsultationTemplates } from '@/data/consultationData';
import TemplateFormBuilder from '@/components/templates/TemplateFormBuilder';

const SPECIALTY_ICONS = {
    general: FileText,
    cardiology: Heart,
    dermatology: Shield,
    pediatrics: Baby,
    orthopedics: Bone,
    neurology: Brain,
    psychiatry: Activity,
    other: FileText
};

const SPECIALTY_COLORS = {
    general: 'bg-gray-100 text-gray-800',
    cardiology: 'bg-red-100 text-red-800',
    dermatology: 'bg-green-100 text-green-800',
    pediatrics: 'bg-blue-100 text-blue-800',
    orthopedics: 'bg-orange-100 text-orange-800',
    neurology: 'bg-purple-100 text-purple-800',
    psychiatry: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800'
};

export default function ConsultationTemplateLibrary() {
    const [templates, setTemplates] = useState(mockConsultationTemplates);
    const [filteredTemplates, setFilteredTemplates] = useState(templates);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        filterTemplates();
    }, [searchTerm, selectedSpecialty, selectedCategory, templates]);

    const filterTemplates = () => {
        let filtered = templates;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Specialty filter
        if (selectedSpecialty !== 'all') {
            filtered = filtered.filter(template => template.specialty === selectedSpecialty);
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(template => template.category === selectedCategory);
        }

        setFilteredTemplates(filtered);
    };

    const handleCreateTemplate = () => {
        setSelectedTemplate(null);
        setIsFormOpen(true);
    };

    const handleEditTemplate = (template) => {
        setSelectedTemplate(template);
        setIsFormOpen(true);
    };

    const handleViewTemplate = (template) => {
        // Open template preview modal
        console.log('View template:', template);
    };

    const handleCopyTemplate = (template) => {
        const newTemplate = {
            ...template,
            id: Date.now().toString(),
            name: `${template.name} (Copy)`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        setTemplates([...templates, newTemplate]);
    };

    const handleDeleteTemplate = (templateId) => {
        setTemplates(templates.filter(t => t.id !== templateId));
    };

    const handleToggleFavorite = (templateId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(templateId)) {
            newFavorites.delete(templateId);
        } else {
            newFavorites.add(templateId);
        }
        setFavorites(newFavorites);
    };

    const handleFormSubmit = (templateData) => {
        if (selectedTemplate) {
            // Update existing template
            setTemplates(templates.map(t =>
                t.id === selectedTemplate.id
                    ? { ...t, ...templateData, updated_at: new Date().toISOString() }
                    : t
            ));
        } else {
            // Create new template
            const newTemplate = {
                id: Date.now().toString(),
                ...templateData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setTemplates([...templates, newTemplate]);
        }
        setIsFormOpen(false);
        setSelectedTemplate(null);
    };

    const handleFormCancel = () => {
        setIsFormOpen(false);
        setSelectedTemplate(null);
    };

    const getSpecialtyIcon = (specialty) => {
        const IconComponent = SPECIALTY_ICONS[specialty] || SPECIALTY_ICONS.other;
        return <IconComponent className="w-5 h-5" />;
    };

    const getSpecialtyColor = (specialty) => {
        return SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS.other;
    };

    const getTemplatesByTab = () => {
        switch (activeTab) {
            case 'favorites':
                return filteredTemplates.filter(t => favorites.has(t.id));
            case 'recent':
                return filteredTemplates
                    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                    .slice(0, 10);
            case 'popular':
                return filteredTemplates
                    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
                    .slice(0, 10);
            default:
                return filteredTemplates;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Consultation Template Library</h2>
                    <p className="text-gray-600">Manage and organize consultation templates</p>
                </div>
                <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Template
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Specialties" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specialties</SelectItem>
                                <SelectItem value="general">General Medicine</SelectItem>
                                <SelectItem value="cardiology">Cardiology</SelectItem>
                                <SelectItem value="dermatology">Dermatology</SelectItem>
                                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                                <SelectItem value="neurology">Neurology</SelectItem>
                                <SelectItem value="psychiatry">Psychiatry</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="initial">Initial Consultation</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                                <SelectItem value="assessment">Assessment</SelectItem>
                                <SelectItem value="treatment">Treatment Plan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Template Library */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Templates</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="popular">Popular</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getTemplatesByTab().map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getSpecialtyIcon(template.specialty)}
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleFavorite(template.id)}
                                            >
                                                {favorites.has(template.id) ? (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                ) : (
                                                    <StarOff className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge className={getSpecialtyColor(template.specialty)}>
                                            {template.specialty}
                                        </Badge>
                                        {template.is_active ? (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-600 border-gray-600">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {template.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>Updated {new Date(template.updated_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <BarChart3 className="w-3 h-3" />
                                            <span>{template.variables?.length || 0} fields</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewTemplate(template)}
                                            >
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditTemplate(template)}
                                            >
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyTemplate(template)}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {getTemplatesByTab().length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No templates found</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {activeTab === 'favorites'
                                    ? 'No favorite templates yet'
                                    : 'Try adjusting your search criteria'
                                }
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Template Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                        </DialogTitle>
                    </DialogHeader>
                    <TemplateFormBuilder
                        template={selectedTemplate}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isSubmitting={false}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
