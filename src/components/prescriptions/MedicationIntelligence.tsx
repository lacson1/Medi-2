import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Brain,
    Calculator,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Pill,
    TrendingUp,
    Zap,
    Target,
    Lightbulb
} from 'lucide-react';

interface MedicationSuggestion {
    name: string;
    genericName: string;
    dosage: string;
    frequency: string;
    indication: string;
    confidence: number;
    cost: {
        brand: number;
        generic: number;
        savings: number;
    };
    interactions: Array<{
        medication: string;
        severity: 'minor' | 'moderate' | 'major';
        description: string;
    }>;
    contraindications: string[];
    sideEffects: string[];
}

interface DosageCalculation {
    recommendedDosage: string;
    maxDailyDose: string;
    adjustmentReason?: string;
    monitoringRequired: boolean;
    labValues?: {
        creatinine?: number;
        liverFunction?: string;
        ageAdjustment?: boolean;
    };
}

interface MedicationIntelligenceProps {
    indication: string;
    patientWeight?: number;
    patientAge?: number;
    currentMedications: Array<{ name: string; dosage: string }>;
    insuranceProvider?: string;
    onMedicationSelect: (medication: MedicationSuggestion) => void;
}

export default function MedicationIntelligence({
    indication,
    patientWeight,
    patientAge,
    currentMedications,
    insuranceProvider,
    onMedicationSelect
}: MedicationIntelligenceProps) {
    const [suggestions, setSuggestions] = useState<MedicationSuggestion[]>([]);
    const [dosageCalculation, setDosageCalculation] = useState<DosageCalculation | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Mock AI-powered medication suggestions
    const generateSuggestions = async () => {
        setIsLoading(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockSuggestions: MedicationSuggestion[] = [
            {
                name: 'Amoxicillin',
                genericName: 'Amoxicillin',
                dosage: patientWeight ? `${Math.round(patientWeight * 20)}mg` : '500mg',
                frequency: '3 times daily',
                indication: 'Upper respiratory infection',
                confidence: 0.95,
                cost: {
                    brand: 45.99,
                    generic: 12.99,
                    savings: 33.00
                },
                interactions: [],
                contraindications: ['Penicillin allergy'],
                sideEffects: ['Nausea', 'Diarrhea', 'Rash']
            },
            {
                name: 'Azithromycin',
                genericName: 'Azithromycin',
                dosage: '500mg',
                frequency: 'Once daily for 3 days',
                indication: 'Upper respiratory infection',
                confidence: 0.88,
                cost: {
                    brand: 89.99,
                    generic: 25.99,
                    savings: 64.00
                },
                interactions: [
                    {
                        medication: 'Warfarin',
                        severity: 'moderate',
                        description: 'May increase bleeding risk'
                    }
                ],
                contraindications: ['Macrolide allergy'],
                sideEffects: ['GI upset', 'Headache']
            },
            {
                name: 'Cephalexin',
                genericName: 'Cephalexin',
                dosage: '250mg',
                frequency: '4 times daily',
                indication: 'Upper respiratory infection',
                confidence: 0.82,
                cost: {
                    brand: 65.99,
                    generic: 18.99,
                    savings: 47.00
                },
                interactions: [],
                contraindications: ['Cephalosporin allergy'],
                sideEffects: ['Diarrhea', 'Nausea']
            }
        ];

        setSuggestions(mockSuggestions);
        setIsLoading(false);
    };

    const calculateDosage = (medication: MedicationSuggestion) => {
        let recommendedDosage = medication.dosage;
        let adjustmentReason = '';
        let monitoringRequired = false;

        // Age-based adjustments
        if (patientAge && patientAge > 65) {
            recommendedDosage = `${Math.round(parseInt(medication.dosage) * 0.8)}mg`;
            adjustmentReason = 'Reduced dose for elderly patient';
            monitoringRequired = true;
        }

        // Weight-based adjustments
        if (patientWeight && patientWeight < 50) {
            recommendedDosage = `${Math.round(parseInt(medication.dosage) * 0.7)}mg`;
            adjustmentReason = 'Reduced dose for low body weight';
            monitoringRequired = true;
        }

        setDosageCalculation({
            recommendedDosage,
            maxDailyDose: `${parseInt(recommendedDosage) * 3}mg`,
            adjustmentReason,
            monitoringRequired,
            labValues: {
                creatinine: 1.2,
                liverFunction: 'Normal',
                ageAdjustment: patientAge && patientAge > 65
            }
        });
    };

    useEffect(() => {
        if (indication) {
            generateSuggestions();
        }
    }, [indication, patientWeight, patientAge]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'major': return 'destructive';
            case 'moderate': return 'secondary';
            case 'minor': return 'outline';
            default: return 'outline';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.9) return 'text-green-600';
        if (confidence >= 0.8) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* AI Suggestions Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        AI-Powered Medication Suggestions
                        <Badge variant="outline" className="ml-2">
                            <Zap className="w-3 h-3 mr-1" />
                            Smart AI
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>Indication: {indication}</span>
                        </div>
                        {patientAge && (
                            <div className="flex items-center gap-1">
                                <span>Age: {patientAge}</span>
                            </div>
                        )}
                        {patientWeight && (
                            <div className="flex items-center gap-1">
                                <span>Weight: {patientWeight}kg</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">AI is analyzing medication options...</p>
                    </CardContent>
                </Card>
            )}

            {/* Medication Suggestions */}
            {suggestions.length > 0 && (
                <div className="space-y-4">
                    {suggestions.map((medication, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-blue-600" />
                                        {medication.name}
                                        <Badge variant="outline">{medication.genericName}</Badge>
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={getConfidenceColor(medication.confidence)}
                                        >
                                            {Math.round(medication.confidence * 100)}% match
                                        </Badge>
                                        <Button
                                            size="sm"
                                            onClick={() => onMedicationSelect(medication)}
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Dosage & Frequency */}
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Dosage</h4>
                                        <div className="space-y-1">
                                            <p className="text-sm">{medication.dosage}</p>
                                            <p className="text-xs text-gray-500">{medication.frequency}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => calculateDosage(medication)}
                                                className="mt-2"
                                            >
                                                <Calculator className="w-3 h-3 mr-1" />
                                                Calculate Dose
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Cost Analysis */}
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Cost Analysis</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>Brand:</span>
                                                <span>${medication.cost.brand}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Generic:</span>
                                                <span className="text-green-600">${medication.cost.generic}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>Savings:</span>
                                                <span className="text-green-600">${medication.cost.savings}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Profile */}
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Safety</h4>
                                        <div className="space-y-1">
                                            {medication.interactions.length > 0 && (
                                                <Alert className="border-yellow-200 bg-yellow-50">
                                                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                                    <AlertDescription className="text-xs text-yellow-800">
                                                        {medication.interactions.length} interaction(s)
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            {medication.contraindications.length > 0 && (
                                                <div className="text-xs text-red-600">
                                                    Contraindications: {medication.contraindications.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Drug Interactions */}
                                {medication.interactions.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium text-sm text-gray-700 mb-2">Drug Interactions</h4>
                                        <div className="space-y-2">
                                            {medication.interactions.map((interaction, i) => (
                                                <Alert key={i} className="border-yellow-200 bg-yellow-50">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <AlertDescription className="text-yellow-800">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{interaction.medication}</span>
                                                            <Badge variant={getSeverityColor(interaction.severity)}>
                                                                {interaction.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm mt-1">{interaction.description}</p>
                                                    </AlertDescription>
                                                </Alert>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dosage Calculation Results */}
            {dosageCalculation && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                            <Calculator className="w-5 h-5" />
                            Dosage Calculation Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Recommended Dosage</h4>
                                <p className="text-lg font-semibold text-blue-800">
                                    {dosageCalculation.recommendedDosage}
                                </p>
                                {dosageCalculation.adjustmentReason && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {dosageCalculation.adjustmentReason}
                                    </p>
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Max Daily Dose</h4>
                                <p className="text-lg font-semibold text-blue-800">
                                    {dosageCalculation.maxDailyDose}
                                </p>
                            </div>
                        </div>

                        {dosageCalculation.monitoringRequired && (
                            <Alert className="mt-4 border-orange-200 bg-orange-50">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-800">
                                    <strong>Monitoring Required:</strong> Lab values should be monitored due to patient factors.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Generic Alternatives */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Generic Alternatives
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-600">
                        <p>💡 <strong>Cost-Saving Tip:</strong> Generic medications offer the same therapeutic benefits at significantly lower costs.</p>
                        <p className="mt-2">📊 <strong>Average Savings:</strong> 60-80% compared to brand-name medications</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
