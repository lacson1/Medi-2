import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Heart,
    Baby,
    Activity,
    FileText,
    Clock,
    UserCheck,
    Zap
} from 'lucide-react';

interface SafetyAlert {
    id: string;
    type: 'allergy' | 'interaction' | 'contraindication' | 'pregnancy' | 'renal' | 'hepatic' | 'compliance';
    severity: 'low' | 'moderate' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
    medication?: string;
    resolved: boolean;
}

interface ComplianceCheck {
    deaNumber: string;
    isValid: boolean;
    expirationDate?: string;
    controlledSubstanceLevel?: number;
    restrictions?: string[];
}

interface LabValues {
    creatinine: number;
    bun: number;
    alt: number;
    ast: number;
    bilirubin: number;
    inr: number;
}

interface SafetyComplianceCheckerProps {
    medication: string;
    patient: {
        id: string;
        age: number;
        gender: string;
        weight?: number;
        allergies: string[];
        currentMedications: Array<{ name: string; dosage: string }>;
        isPregnant?: boolean;
        isLactating?: boolean;
        labValues?: LabValues;
    };
    prescriber: {
        deaNumber?: string;
        name: string;
    };
    onAlertResolve: (alertId: string) => void;
}

export default function SafetyComplianceChecker({
    medication,
    patient,
    prescriber,
    onAlertResolve
}: SafetyComplianceCheckerProps) {
    const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
    const [complianceCheck, setComplianceCheck] = useState<ComplianceCheck | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [safetyScore, setSafetyScore] = useState(0);

    useEffect(() => {
        if (medication) {
            performSafetyChecks();
        }
    }, [medication, patient]);

    const performSafetyChecks = async () => {
        setIsChecking(true);

        // Simulate real-time checking
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newAlerts: SafetyAlert[] = [];
        let score = 100;

        // Allergy Check
        const allergyCheck = checkAllergies(medication, patient.allergies);
        if (allergyCheck.hasAllergy) {
            newAlerts.push({
                id: 'allergy-1',
                type: 'allergy',
                severity: 'critical',
                title: 'Allergy Alert',
                description: `Patient has allergy to ${allergyCheck.allergen}`,
                recommendation: 'Consider alternative medication',
                medication: medication,
                resolved: false
            });
            score -= 40;
        }

        // Drug Interaction Check
        const interactionCheck = checkDrugInteractions(medication, patient.currentMedications);
        if (interactionCheck.hasInteraction) {
            newAlerts.push({
                id: 'interaction-1',
                type: 'interaction',
                severity: interactionCheck.severity,
                title: 'Drug Interaction',
                description: interactionCheck.description,
                recommendation: interactionCheck.recommendation,
                medication: medication,
                resolved: false
            });
            score -= interactionCheck.severity === 'critical' ? 30 : 15;
        }

        // Pregnancy/Lactation Check
        if (patient.isPregnant || patient.isLactating) {
            const pregnancyCheck = checkPregnancySafety(medication, patient.isPregnant, patient.isLactating);
            if (pregnancyCheck.unsafe) {
                newAlerts.push({
                    id: 'pregnancy-1',
                    type: 'pregnancy',
                    severity: 'high',
                    title: pregnancyCheck.title,
                    description: pregnancyCheck.description,
                    recommendation: pregnancyCheck.recommendation,
                    medication: medication,
                    resolved: false
                });
                score -= 25;
            }
        }

        // Renal/Hepatic Adjustment Check
        if (patient.labValues) {
            const labCheck = checkLabValues(medication, patient.labValues, patient.age);
            if (labCheck.needsAdjustment) {
                newAlerts.push({
                    id: 'renal-1',
                    type: 'renal',
                    severity: 'moderate',
                    title: 'Dosage Adjustment Required',
                    description: labCheck.description,
                    recommendation: labCheck.recommendation,
                    medication: medication,
                    resolved: false
                });
                score -= 10;
            }
        }

        // Controlled Substance Compliance
        if (isControlledSubstance(medication)) {
            const complianceResult = checkDEACompliance(prescriber.deaNumber);
            setComplianceCheck(complianceResult);
            if (!complianceResult.isValid) {
                newAlerts.push({
                    id: 'compliance-1',
                    type: 'compliance',
                    severity: 'critical',
                    title: 'DEA Compliance Issue',
                    description: 'Invalid or expired DEA number',
                    recommendation: 'Verify DEA number before prescribing',
                    medication: medication,
                    resolved: false
                });
                score -= 50;
            }
        }

        setAlerts(newAlerts);
        setSafetyScore(Math.max(0, score));
        setIsChecking(false);
    };

    const checkAllergies = (med: string, allergies: string[]) => {
        const medLower = med.toLowerCase();
        const allergen = allergies.find(allergy =>
            medLower.includes(allergy.toLowerCase()) ||
            allergy.toLowerCase().includes(medLower)
        );
        return {
            hasAllergy: !!allergen,
            allergen: allergen || ''
        };
    };

    const checkDrugInteractions = (med: string, currentMeds: Array<{ name: string; dosage: string }>) => {
        // Mock interaction checking
        const interactions = {
            'warfarin': {
                hasInteraction: true,
                severity: 'high' as const,
                description: 'May increase bleeding risk',
                recommendation: 'Monitor INR closely'
            },
            'digoxin': {
                hasInteraction: true,
                severity: 'moderate' as const,
                description: 'May increase digoxin levels',
                recommendation: 'Monitor digoxin levels'
            }
        };

        const currentMedNames = currentMeds.map(m => m.name.toLowerCase());
        const interaction = interactions[med.toLowerCase() as keyof typeof interactions];

        if (interaction && currentMedNames.some(name => Object.keys(interactions).includes(name))) {
            return interaction;
        }

        return { hasInteraction: false };
    };

    const checkPregnancySafety = (med: string, isPregnant: boolean, isLactating: boolean) => {
        const unsafeMedications = ['warfarin', 'isotretinoin', 'thalidomide'];
        const medLower = med.toLowerCase();

        if (unsafeMedications.some(unsafe => medLower.includes(unsafe))) {
            return {
                unsafe: true,
                title: isPregnant ? 'Pregnancy Risk' : 'Lactation Risk',
                description: `${med} is contraindicated during ${isPregnant ? 'pregnancy' : 'lactation'}`,
                recommendation: 'Consider alternative medication'
            };
        }

        return { unsafe: false };
    };

    const checkLabValues = (med: string, labs: LabValues, age: number) => {
        // Check for renal impairment
        if (labs.creatinine > 1.5 || age > 65) {
            return {
                needsAdjustment: true,
                description: 'Renal function may be impaired',
                recommendation: 'Consider dose reduction'
            };
        }

        // Check for hepatic impairment
        if (labs.alt > 40 || labs.ast > 40) {
            return {
                needsAdjustment: true,
                description: 'Hepatic function may be impaired',
                recommendation: 'Monitor liver function'
            };
        }

        return { needsAdjustment: false };
    };

    const isControlledSubstance = (med: string) => {
        const controlledSubstances = ['oxycodone', 'morphine', 'fentanyl', 'adderall', 'xanax'];
        return controlledSubstances.some(cs => med.toLowerCase().includes(cs));
    };

    const checkDEACompliance = (deaNumber?: string) => {
        if (!deaNumber) {
            return {
                deaNumber: '',
                isValid: false,
                restrictions: ['DEA number required for controlled substances']
            };
        }

        // Mock DEA validation
        const isValid = deaNumber.length === 9 && /^[A-Z]{2}[0-9]{7}$/.test(deaNumber);
        return {
            deaNumber,
            isValid,
            expirationDate: '2025-12-31',
            controlledSubstanceLevel: 2,
            restrictions: isValid ? [] : ['Invalid DEA number format']
        };
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            case 'moderate': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />;
            default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'destructive';
            case 'high': return 'secondary';
            case 'moderate': return 'outline';
            case 'low': return 'default';
            default: return 'outline';
        }
    };

    const getSafetyScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="space-y-6">
            {/* Safety Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Safety Score
                        {isChecking && (
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Safety</span>
                            <span className={`text-lg font-bold ${getSafetyScoreColor(safetyScore)}`}>
                                {safetyScore}/100
                            </span>
                        </div>
                        <Progress value={safetyScore} className="h-2" />
                        <div className="text-xs text-gray-600">
                            {safetyScore >= 90 && '✅ Excellent safety profile'}
                            {safetyScore >= 70 && safetyScore < 90 && '⚠️ Some concerns identified'}
                            {safetyScore >= 50 && safetyScore < 70 && '🚨 Multiple safety issues'}
                            {safetyScore < 50 && '❌ Critical safety concerns'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Safety Alerts */}
            {alerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Safety Alerts ({alerts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {alerts.map((alert) => (
                                <Alert
                                    key={alert.id}
                                    className={`border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                            alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                                alert.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                                                    'border-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {getSeverityIcon(alert.severity)}
                                        <div className="flex-1">
                                            <AlertDescription>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{alert.title}</span>
                                                            <Badge variant={getSeverityColor(alert.severity)}>
                                                                {alert.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm mt-1">{alert.description}</p>
                                                        <p className="text-sm font-medium mt-2 text-blue-800">
                                                            💡 {alert.recommendation}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => onAlertResolve(alert.id)}
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        ✓ Resolve
                                                    </button>
                                                </div>
                                            </AlertDescription>
                                        </div>
                                    </div>
                                </Alert>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Compliance Check */}
            {complianceCheck && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-purple-600" />
                            DEA Compliance Check
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">DEA Number:</span>
                                <Badge variant={complianceCheck.isValid ? 'default' : 'destructive'}>
                                    {complianceCheck.deaNumber || 'Not provided'}
                                </Badge>
                                {complianceCheck.isValid ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-600" />
                                )}
                            </div>

                            {complianceCheck.expirationDate && (
                                <div className="text-sm text-gray-600">
                                    Expires: {complianceCheck.expirationDate}
                                </div>
                            )}

                            {complianceCheck.controlledSubstanceLevel && (
                                <div className="text-sm text-gray-600">
                                    Controlled Substance Level: {complianceCheck.controlledSubstanceLevel}
                                </div>
                            )}

                            {complianceCheck.restrictions && complianceCheck.restrictions.length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        <strong>Restrictions:</strong> {complianceCheck.restrictions.join(', ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Patient-Specific Warnings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-600" />
                        Patient-Specific Considerations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {patient.isPregnant && (
                            <Alert className="border-pink-200 bg-pink-50">
                                <Baby className="h-4 w-4 text-pink-600" />
                                <AlertDescription className="text-pink-800">
                                    <strong>Pregnancy:</strong> Verify medication safety during pregnancy
                                </AlertDescription>
                            </Alert>
                        )}

                        {patient.isLactating && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <Heart className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    <strong>Lactation:</strong> Consider medication transfer to breast milk
                                </AlertDescription>
                            </Alert>
                        )}

                        {patient.age > 65 && (
                            <Alert className="border-orange-200 bg-orange-50">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-800">
                                    <strong>Elderly Patient:</strong> Consider age-related pharmacokinetic changes
                                </AlertDescription>
                            </Alert>
                        )}

                        {patient.labValues && (
                            <div className="text-sm text-gray-600">
                                <strong>Latest Lab Values:</strong>
                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    <div>Creatinine: {patient.labValues.creatinine} mg/dL</div>
                                    <div>BUN: {patient.labValues.bun} mg/dL</div>
                                    <div>ALT: {patient.labValues.alt} U/L</div>
                                    <div>AST: {patient.labValues.ast} U/L</div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Monitoring */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-600" />
                        Real-time Monitoring
                        <Badge variant="outline" className="ml-2">
                            <Zap className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-600">
                        <p>🔄 Continuously monitoring for:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Drug interactions with current medications</li>
                            <li>Allergy cross-reactivity</li>
                            <li>Contraindication updates</li>
                            <li>Regulatory compliance changes</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
