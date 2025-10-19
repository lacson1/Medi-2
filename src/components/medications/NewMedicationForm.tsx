import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Pill,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  Copy,
  Activity,
  Shield,
  FileText,
  Info
} from 'lucide-react';
import {
  medications,
  medicationCategories,
  routes,
  pregnancyCategories,
  sideEffects,
  monitoringTypes,
  commonIndications,
  commonDosages,
  commonFrequencies
} from '@/data/medications';
import { useAuth } from "@/hooks/useAuth";

// Validation schema
const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name must be at least 2 characters'),
  genericName: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  indication: z.string().min(1, 'Indication is required'),
  route: z.string().min(1, 'Route is required'),
  sideEffects: z.array(z.string()).optional(),
  interactions: z.string().optional(),
  contraindications: z.string().optional(),
  monitoring: z.array(z.string()).optional(),
  pregnancyCategory: z.string().optional(),
  generic: z.boolean().default(true),
  brandNames: z.string().optional(),
  ndc: z.string().optional(),
  description: z.string().optional(),
  warnings: z.string().optional(),
  storage: z.string().optional(),
  halfLife: z.string().optional(),
  onset: z.string().optional(),
  duration: z.string().optional(),
  peakEffect: z.string().optional(),
  metabolism: z.string().optional(),
  excretion: z.string().optional(),
  cost: z.string().optional(),
  availability: z.string().default('available')
});

export default function NewMedicationForm({
  onSave,
  onCancel,
  existingMedications = [],
  medication = null
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSideEffects, setSelectedSideEffects] = useState([]);
  const [selectedMonitoring, setSelectedMonitoring] = useState([]);

  // Auto-complete states
  const [medicationSuggestions, setMedicationSuggestions] = useState([]);
  const [indicationSuggestions, setIndicationSuggestions] = useState([]);
  const [dosageSuggestions, setDosageSuggestions] = useState([]);
  const [frequencySuggestions, setFrequencySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState({
    medication: false,
    indication: false,
    dosage: false,
    frequency: false
  });

  const form = useForm({
    resolver: zodResolver(medicationSchema),
    defaultValues: medication || {
      name: '',
      genericName: '',
      category: '',
      dosage: '',
      frequency: '',
      indication: '',
      route: 'oral',
      sideEffects: [],
      interactions: '',
      contraindications: '',
      monitoring: [],
      pregnancyCategory: '',
      generic: true,
      brandNames: '',
      ndc: '',
      description: '',
      warnings: '',
      storage: '',
      halfLife: '',
      onset: '',
      duration: '',
      peakEffect: '',
      metabolism: '',
      excretion: '',
      cost: '',
      availability: 'available'
    }
  });

  const watchedName = form.watch('name');

  // Check for duplicates
  useEffect(() => {
    if (watchedName && watchedName.length > 2) {
      const duplicate = existingMedications.find(med =>
        med.name.toLowerCase() === watchedName.toLowerCase()
      );
      setDuplicateCheck(duplicate);
    } else {
      setDuplicateCheck(null);
    }
  }, [watchedName, existingMedications]);

  // Auto-complete handlers
  const handleMedicationInput = useCallback((value) => {
    form.setValue('name', value);
    if (value.length >= 2) {
      const suggestions = medications
        .filter(med =>
          med.name.toLowerCase().includes(value.toLowerCase()) ||
          med.genericName.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 8)
        .map(med => ({
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          dosage: med.dosage,
          indication: med.indication
        }));
      setMedicationSuggestions(suggestions);
      setShowSuggestions(prev => ({ ...prev, medication: true }));
    } else {
      setShowSuggestions(prev => ({ ...prev, medication: false }));
    }
  }, [form]);

  const handleIndicationInput = useCallback((value) => {
    form.setValue('indication', value);
    if (value.length >= 2) {
      const suggestions = commonIndications
        .filter(ind => ind.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setIndicationSuggestions(suggestions);
      setShowSuggestions(prev => ({ ...prev, indication: true }));
    } else {
      setShowSuggestions(prev => ({ ...prev, indication: false }));
    }
  }, [form]);

  const handleDosageInput = useCallback((value) => {
    form.setValue('dosage', value);
    if (value.length >= 1) {
      const suggestions = commonDosages
        .filter(dosage => dosage.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setDosageSuggestions(suggestions);
      setShowSuggestions(prev => ({ ...prev, dosage: true }));
    } else {
      setShowSuggestions(prev => ({ ...prev, dosage: false }));
    }
  }, [form]);

  const handleFrequencyInput = useCallback((value) => {
    form.setValue('frequency', value);
    if (value.length >= 2) {
      const suggestions = commonFrequencies
        .filter(freq => freq.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setFrequencySuggestions(suggestions);
      setShowSuggestions(prev => ({ ...prev, frequency: true }));
    } else {
      setShowSuggestions(prev => ({ ...prev, frequency: false }));
    }
  }, [form]);

  const selectSuggestion = (type: any, suggestion: any) => {
    switch (type) {
      case 'medication':
        form.setValue('name', suggestion.name);
        form.setValue('genericName', suggestion.genericName);
        form.setValue('category', suggestion.category);
        form.setValue('dosage', suggestion.dosage);
        form.setValue('indication', suggestion.indication);
        break;
      case 'indication':
        form.setValue('indication', suggestion);
        break;
      case 'dosage':
        form.setValue('dosage', suggestion);
        break;
      case 'frequency':
        form.setValue('frequency', suggestion);
        break;
    }
    setShowSuggestions(prev => ({ ...prev, [type]: false }));
  };

  const handleSideEffectToggle = (sideEffect: any) => {
    setSelectedSideEffects(prev =>
      prev.includes(sideEffect)
        ? prev.filter(se => se !== sideEffect)
        : [...prev, sideEffect]
    );
  };

  const handleMonitoringToggle = (monitoring: any) => {
    setSelectedMonitoring(prev =>
      prev.includes(monitoring)
        ? prev.filter(m => m !== monitoring)
        : [...prev, monitoring]
    );
  };

  const loadFromTemplate = (template: any) => {
    form.reset({
      name: template.name,
      genericName: template.genericName,
      category: template.category,
      dosage: template.dosage,
      frequency: template.frequency,
      indication: template.indication,
      route: template.route,
      sideEffects: template.sideEffects || [],
      interactions: template.interactions || '',
      contraindications: template.contraindications || '',
      monitoring: template.monitoring || [],
      pregnancyCategory: template.pregnancyCategory || '',
      generic: template.generic !== undefined ? template.generic : true,
      brandNames: template.brandNames || '',
      ndc: template.ndc || ''
    });
    setSelectedSideEffects(template.sideEffects || []);
    setSelectedMonitoring(template.monitoring || []);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const medicationData = {
        ...data,
        sideEffects: selectedSideEffects,
        monitoring: selectedMonitoring,
        id: medication?.id || Date.now(),
        createdAt: medication?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user?.id || 'current_user',
        status: 'active'
      };

      await onSave(medicationData);
      setSubmitStatus('success');

      setTimeout(() => {
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Error saving medication:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSideEffects = sideEffects.filter(se =>
    se.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMonitoring = monitoringTypes.filter(mt =>
    mt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-6 h-6" />
            {medication ? 'Edit Medication' : 'Add New Medication'}
          </h2>
          <p className="text-gray-600">
            {medication ? 'Update medication information' : 'Add a new medication to the system database'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <p className="font-semibold">Medication {medication ? 'Updated' : 'Added'} Successfully!</p>
            <p className="text-sm">The medication has been {medication ? 'updated in' : 'added to'} the database.</p>
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Error {medication ? 'Updating' : 'Adding'} Medication</p>
            <p className="text-sm">Please check the form for errors and try again.</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Warning */}
      {duplicateCheck && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Duplicate Medication Found</p>
                <p className="text-sm">A medication with this name already exists in the database.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadFromTemplate(duplicateCheck)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Use Existing
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="pharmacology">Pharmacology</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5" />
                    Basic Medication Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Medication Name *"}</FormLabel>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Amoxicillin"
                                className="pl-10"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleMedicationInput(e.target.value);
                                }}
                              />
                            </FormControl>
                            {showSuggestions.medication && medicationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {medicationSuggestions.map((med, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => selectSuggestion('medication', med)}
                                  >
                                    <div className="font-medium text-gray-900">{med.name}</div>
                                    <div className="text-sm text-gray-600">{med.category} • {med.dosage}</div>
                                    <div className="text-xs text-gray-500">{med.indication}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Category *"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {medicationCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Dosage *"}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., 250mg, 500mg"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleDosageInput(e.target.value);
                                }}
                              />
                            </FormControl>
                            {showSuggestions.dosage && dosageSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {dosageSuggestions.map((dosage, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => selectSuggestion('dosage', dosage)}
                                  >
                                    {dosage}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Frequency *"}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Twice daily"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleFrequencyInput(e.target.value);
                                }}
                              />
                            </FormControl>
                            {showSuggestions.frequency && frequencySuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {frequencySuggestions.map((frequency, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => selectSuggestion('frequency', frequency)}
                                  >
                                    {frequency}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="indication"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Indication *"}</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., Bacterial infections"
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleIndicationInput(e.target.value);
                                }}
                              />
                            </FormControl>
                            {showSuggestions.indication && indicationSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {indicationSuggestions.map((indication, index) => (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => selectSuggestion('indication', indication)}
                                  >
                                    {indication}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="route"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Route *"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {routes.map(route => (
                                <SelectItem key={route} value={route.toLowerCase()}>
                                  {route}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Description"}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Brief description of the medication..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clinical Information Tab */}
            <TabsContent value="clinical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Clinical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{"Side Effects"}</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search side effects..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-3"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                        {filteredSideEffects.map(sideEffect => (
                          <div key={sideEffect} className="flex items-center space-x-2">
                            <Checkbox
                              id={sideEffect}
                              checked={selectedSideEffects.includes(sideEffect)}
                              onCheckedChange={() => handleSideEffectToggle(sideEffect)}
                            />
                            <Label htmlFor={sideEffect} className="text-sm">
                              {sideEffect}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {selectedSideEffects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedSideEffects.map(sideEffect => (
                            <Badge key={sideEffect} variant="secondary" className="text-xs">
                              {sideEffect}
                              <button
                                type="button"
                                onClick={() => handleSideEffectToggle(sideEffect)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="interactions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Drug Interactions"}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="List known drug interactions..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contraindications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Contraindications"}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="List contraindications..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="warnings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Warnings"}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Important warnings and precautions..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pregnancyCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Pregnancy Category"}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pregnancy category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pregnancyCategories.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pharmacology Tab */}
            <TabsContent value="pharmacology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Pharmacological Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="halfLife"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Half-Life"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 1-2 hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="onset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Onset of Action"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 30-60 minutes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Duration of Action"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 6-8 hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="peakEffect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Peak Effect"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 1-2 hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="metabolism"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Metabolism"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Hepatic"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excretion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Excretion"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Renal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="storage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{"Storage Requirements"}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Room temperature, protect from light"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Monitoring Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{"Required Monitoring"}</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search monitoring types..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mb-3"
                      />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                        {filteredMonitoring.map(monitoring => (
                          <div key={monitoring} className="flex items-center space-x-2">
                            <Checkbox
                              id={monitoring}
                              checked={selectedMonitoring.includes(monitoring)}
                              onCheckedChange={() => handleMonitoringToggle(monitoring)}
                            />
                            <Label htmlFor={monitoring} className="text-sm">
                              {monitoring}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {selectedMonitoring.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedMonitoring.map(monitoring => (
                            <Badge key={monitoring} variant="secondary" className="text-xs">
                              {monitoring}
                              <button
                                type="button"
                                onClick={() => handleMonitoringToggle(monitoring)}
                                className="ml-1 hover:text-red-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Information Tab */}
            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brandNames"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Brand Names"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Amoxil, Trimox"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ndc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"NDC Number"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 12345-123-45"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Cost (per unit)"}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., $0.50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{"Availability"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="limited">Limited</SelectItem>
                              <SelectItem value="discontinued">Discontinued</SelectItem>
                              <SelectItem value="backorder">Backorder</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="generic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>{"Generic medication available"}</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  {medication ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {medication ? 'Update Medication' : 'Save Medication'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
