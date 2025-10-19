/**
 * Enhanced Form Wrapper Component
 * Provides autocomplete functionality and smart suggestions for all form fields
 */

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Brain,
    Zap,
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Search,
    Plus,
    X
} from 'lucide-react';
import { EnhancedInputField, AllergyField, ConditionField, MedicationField, SymptomField, LabTestField, InsuranceField } from './EnhancedFormFields';
import { getSmartSuggestions } from '@/data/autocompleteData';

interface EnhancedFormWrapperProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    showSmartSuggestions?: boolean;
    className?: string;
}

interface SmartSuggestion {
    field: string;
    suggestion: string;
    confidence: number;
    type: 'medication' | 'condition' | 'allergy' | 'symptom' | 'test';
}

export default function EnhancedFormWrapper({
    children,
    title,
    description,
    showSmartSuggestions = true,
    className = ""
}: EnhancedFormWrapperProps) {
    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Get form context to analyze form data
    let formContext = null;
    try {
        formContext = useFormContext();
    } catch {
        // No form context available
    }

    // Analyze form data for smart suggestions
    const analyzeFormData = () => {
        if (!formContext || !showSmartSuggestions) return;

        setIsAnalyzing(true);

        // Simulate AI analysis of form data
        setTimeout(() => {
            const suggestions: SmartSuggestion[] = [];
            const formData = formContext.getValues();

            // Analyze patient data for smart suggestions
            if (formData.medical_conditions?.length > 0) {
                const conditions = formData.medical_conditions;

                // Suggest medications based on conditions
                if (conditions.includes('Hypertension') || conditions.includes('High Blood Pressure')) {
                    suggestions.push({
                        field: 'medications',
                        suggestion: 'Consider ACE inhibitors like Lisinopril or ARBs',
                        confidence: 0.9,
                        type: 'medication'
                    });
                }

                if (conditions.includes('Diabetes') || conditions.includes('Type 2 Diabetes')) {
                    suggestions.push({
                        field: 'medications',
                        suggestion: 'Metformin is commonly prescribed for diabetes management',
                        confidence: 0.95,
                        type: 'medication'
                    });
                }

                // Suggest lab tests based on conditions
                if (conditions.includes('Diabetes')) {
                    suggestions.push({
                        field: 'lab_tests',
                        suggestion: 'HbA1c test recommended for diabetes monitoring',
                        confidence: 0.9,
                        type: 'test'
                    });
                }

                if (conditions.includes('Hypertension')) {
                    suggestions.push({
                        field: 'lab_tests',
                        suggestion: 'Basic Metabolic Panel (BMP) for hypertension monitoring',
                        confidence: 0.85,
                        type: 'test'
                    });
                }
            }

            // Analyze allergies for medication suggestions
            if (formData.allergies?.length > 0) {
                const allergies = formData.allergies;

                if (allergies.includes('Penicillin')) {
                    suggestions.push({
                        field: 'medications',
                        suggestion: 'Avoid penicillin-based antibiotics. Consider alternatives like Azithromycin',
                        confidence: 1.0,
                        type: 'medication'
                    });
                }

                if (allergies.includes('Sulfa')) {
                    suggestions.push({
                        field: 'medications',
                        suggestion: 'Avoid sulfonamide antibiotics. Consider alternatives',
                        confidence: 1.0,
                        type: 'medication'
                    });
                }
            }

            // Analyze symptoms for condition suggestions
            if (formData.symptoms?.length > 0) {
                const symptoms = formData.symptoms;

                if (symptoms.includes('Chest Pain')) {
                    suggestions.push({
                        field: 'conditions',
                        suggestion: 'Consider cardiovascular conditions. ECG may be needed',
                        confidence: 0.8,
                        type: 'condition'
                    });
                }

                if (symptoms.includes('Shortness of Breath')) {
                    suggestions.push({
                        field: 'conditions',
                        suggestion: 'Consider respiratory or cardiovascular conditions',
                        confidence: 0.75,
                        type: 'condition'
                    });
                }
            }

            setSmartSuggestions(suggestions);
            setIsAnalyzing(false);
        }, 1000);
    };

    // Auto-analyze when form data changes
    useEffect(() => {
        if (formContext && showSmartSuggestions) {
            const subscription = formContext.watch(() => {
                analyzeFormData();
            });

            return () => subscription.unsubscribe();
        }
    }, [formContext, showSmartSuggestions]);

    const applySuggestion = (suggestion: SmartSuggestion) => {
        if (!formContext) return;

        const currentValue = formContext.getValues(suggestion.field as any) || [];

        if (Array.isArray(currentValue)) {
            // Add to array field
            formContext.setValue(suggestion.field as any, [...currentValue, suggestion.suggestion]);
        } else {
            // Set single value field
            formContext.setValue(suggestion.field as any, suggestion.suggestion);
        }

        // Remove the applied suggestion
        setSmartSuggestions(prev => prev.filter(s => s !== suggestion));
    };

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'medication': return <Brain className="w-4 h-4" />;
            case 'condition': return <AlertTriangle className="w-4 h-4" />;
            case 'allergy': return <X className="w-4 h-4" />;
            case 'symptom': return <Zap className="w-4 h-4" />;
            case 'test': return <CheckCircle className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
        }
    };

    const getSuggestionColor = (type: string) => {
        switch (type) {
            case 'medication': return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'condition': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'allergy': return 'bg-red-50 border-red-200 text-red-800';
            case 'symptom': return 'bg-purple-50 border-purple-200 text-purple-800';
            case 'test': return 'bg-green-50 border-green-200 text-green-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Smart Suggestions Panel */}
            {showSmartSuggestions && smartSuggestions.length > 0 && (
                <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-blue-600" />
                                <CardTitle className="text-lg text-blue-900">Smart Suggestions</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuggestions(!showSuggestions)}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                {showSuggestions ? 'Hide' : 'Show'} Details
                            </Button>
                        </div>
                        <p className="text-sm text-blue-700">
                            AI-powered suggestions based on your form data
                        </p>
                    </CardHeader>

                    {showSuggestions && (
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {smartSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${getSuggestionColor(suggestion.type)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                {getSuggestionIcon(suggestion.type)}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{suggestion.suggestion}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {suggestion.type}
                                                        </Badge>
                                                        <span className="text-xs opacity-75">
                                                            Confidence: {Math.round(suggestion.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => applySuggestion(suggestion)}
                                                className="text-blue-600 hover:text-blue-700"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Loading indicator for analysis */}
            {isAnalyzing && (
                <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                        Analyzing form data for smart suggestions...
                    </AlertDescription>
                </Alert>
            )}

            {/* Form Content */}
            {children}
        </div>
    );
}

// Export enhanced form fields for easy access
export {
    EnhancedInputField,
    AllergyField,
    ConditionField,
    MedicationField,
    SymptomField,
    LabTestField,
    InsuranceField
};
