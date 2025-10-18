import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  Activity,
  FileText
} from "lucide-react";

export default function DrugInteractionChecker({
  currentMedication,
  patientMedications = [],
  patientAllergies = [],
  patientAge = null,
  patientWeight = null,
  patientConditions = []
}) {
  const [interactions, setInteractions] = useState([]);
  const [allergyWarnings, setAllergyWarnings] = useState([]);
  const [dosingWarnings, setDosingWarnings] = useState([]);
  const [contraindications, setContraindications] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkDrugInteractions = useCallback(() => {
    const interactionDatabase = {
      // Warfarin interactions
      'warfarin': [
        { drug: 'aspirin', severity: 'major', description: 'Increased bleeding risk', recommendation: 'Monitor INR closely' },
        { drug: 'ibuprofen', severity: 'major', description: 'Increased bleeding risk', recommendation: 'Avoid concurrent use' },
        { drug: 'acetaminophen', severity: 'moderate', description: 'May affect INR', recommendation: 'Monitor INR if used long-term' },
        { drug: 'metronidazole', severity: 'major', description: 'Increased warfarin effect', recommendation: 'Reduce warfarin dose' }
      ],
      // Digoxin interactions
      'digoxin': [
        { drug: 'furosemide', severity: 'moderate', description: 'Hypokalemia increases digoxin toxicity', recommendation: 'Monitor potassium levels' },
        { drug: 'hydrochlorothiazide', severity: 'moderate', description: 'Hypokalemia increases digoxin toxicity', recommendation: 'Monitor potassium levels' },
        { drug: 'quinidine', severity: 'major', description: 'Increased digoxin levels', recommendation: 'Reduce digoxin dose by 50%' }
      ],
      // Metformin interactions
      'metformin': [
        { drug: 'contrast dye', severity: 'major', description: 'Risk of lactic acidosis', recommendation: 'Hold metformin 48h before/after contrast' },
        { drug: 'alcohol', severity: 'moderate', description: 'Increased lactic acidosis risk', recommendation: 'Limit alcohol consumption' }
      ],
      // ACE inhibitors interactions
      'lisinopril': [
        { drug: 'potassium supplements', severity: 'moderate', description: 'Risk of hyperkalemia', recommendation: 'Monitor potassium levels' },
        { drug: 'nsaids', severity: 'moderate', description: 'Reduced antihypertensive effect', recommendation: 'Monitor blood pressure' }
      ],
      // Statins interactions
      'atorvastatin': [
        { drug: 'grapefruit juice', severity: 'moderate', description: 'Increased statin levels', recommendation: 'Avoid grapefruit juice' },
        { drug: 'erythromycin', severity: 'major', description: 'Increased statin levels', recommendation: 'Monitor for muscle pain' }
      ]
    };

    const foundInteractions = [];
    const currentMed = currentMedication.toLowerCase();

    // Check for interactions with current medication
    Object.keys(interactionDatabase).forEach(drug => {
      if (currentMed.includes(drug)) {
        interactionDatabase[drug].forEach(interaction => {
          const hasInteractingDrug = patientMedications.some(med =>
            med.toLowerCase().includes(interaction.drug.toLowerCase())
          );

          if (hasInteractingDrug) {
            foundInteractions.push({
              type: 'drug_interaction',
              severity: interaction.severity,
              medication1: currentMedication,
              medication2: interaction.drug,
              description: interaction.description,
              recommendation: interaction.recommendation,
              category: 'Drug Interaction'
            });
          }
        });
      }
    });

    setInteractions(foundInteractions);
  }, [currentMedication, patientMedications]);

  const checkAllergies = useCallback(() => {
    const warnings = [];

    if (patientAllergies && currentMedication) {
      const currentMed = currentMedication.toLowerCase();

      patientAllergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase();

        // Direct allergy match
        if (currentMed.includes(allergyLower)) {
          warnings.push({
            type: 'allergy',
            severity: 'critical',
            description: `Patient has documented allergy to ${allergy}`,
            recommendation: 'DO NOT PRESCRIBE - Use alternative medication',
            category: 'Allergy Alert'
          });
        }

        // Cross-reactivity checks
        const crossReactivity = {
          'penicillin': ['amoxicillin', 'ampicillin', 'cephalexin'],
          'sulfa': ['sulfamethoxazole', 'sulfasalazine'],
          'aspirin': ['ibuprofen', 'naproxen', 'ketorolac']
        };

        Object.keys(crossReactivity).forEach(allergen => {
          if (allergyLower.includes(allergen)) {
            crossReactivity[allergen].forEach(crossDrug => {
              if (currentMed.includes(crossDrug)) {
                warnings.push({
                  type: 'cross_reactivity',
                  severity: 'major',
                  description: `Cross-reactivity risk: ${allergy} allergy may react with ${crossDrug}`,
                  recommendation: 'Consider alternative medication or allergy testing',
                  category: 'Cross-Reactivity'
                });
              }
            });
          }
        });
      });
    }

    setAllergyWarnings(warnings);
  }, [currentMedication, patientAllergies]);

  const checkDosingGuidelines = useCallback(() => {
    const warnings = [];

    if (!currentMedication) return;

    const currentMed = currentMedication.toLowerCase();

    // Geriatric dosing considerations
    if (patientAge && patientAge > 65) {
      const geriatricMedications = {
        'digoxin': { maxDose: '0.125mg', reason: 'Reduced clearance in elderly' },
        'warfarin': { maxDose: '5mg', reason: 'Increased sensitivity' },
        'metformin': { maxDose: '1000mg', reason: 'Reduced renal function' },
        'benzodiazepines': { maxDose: 'half', reason: 'Increased sedation risk' }
      };

      Object.keys(geriatricMedications).forEach(med => {
        if (currentMed.includes(med)) {
          warnings.push({
            type: 'dosing',
            severity: 'moderate',
            description: `Geriatric dosing consideration: ${geriatricMedications[med].reason}`,
            recommendation: `Consider reduced dosing for ${med}`,
            category: 'Geriatric Dosing'
          });
        }
      });
    }

    // Pediatric dosing considerations
    if (patientAge && patientAge < 18) {
      const pediatricMedications = ['warfarin', 'digoxin', 'metformin'];
      pediatricMedications.forEach(med => {
        if (currentMed.includes(med)) {
          warnings.push({
            type: 'dosing',
            severity: 'moderate',
            description: 'Pediatric dosing required',
            recommendation: 'Use pediatric dosing guidelines',
            category: 'Pediatric Dosing'
          });
        }
      });
    }

    // Weight-based dosing
    if (patientWeight && patientWeight < 50) {
      warnings.push({
        type: 'dosing',
        severity: 'moderate',
        description: 'Low body weight - consider weight-based dosing',
        recommendation: 'Verify dosing based on patient weight',
        category: 'Weight-Based Dosing'
      });
    }

    setDosingWarnings(warnings);
  }, [currentMedication, patientAge, patientWeight]);

  const checkContraindications = useCallback(() => {
    const contraindications = [];

    if (!currentMedication || !patientConditions) return;

    const currentMed = currentMedication.toLowerCase();

    const contraindicationDatabase = {
      'warfarin': ['pregnancy', 'bleeding disorders', 'severe liver disease'],
      'metformin': ['severe kidney disease', 'liver disease', 'heart failure'],
      'ace_inhibitors': ['pregnancy', 'bilateral renal artery stenosis'],
      'statins': ['active liver disease', 'pregnancy'],
      'nsaids': ['severe heart failure', 'severe kidney disease', 'active peptic ulcer']
    };

    Object.keys(contraindicationDatabase).forEach(med => {
      if (currentMed.includes(med)) {
        contraindicationDatabase[med].forEach(condition => {
          const hasCondition = patientConditions.some(cond =>
            cond.toLowerCase().includes(condition.toLowerCase())
          );

          if (hasCondition) {
            contraindications.push({
              type: 'contraindication',
              severity: 'critical',
              description: `${med} contraindicated in ${condition}`,
              recommendation: 'DO NOT PRESCRIBE - Use alternative medication',
              category: 'Contraindication'
            });
          }
        });
      }
    });

    setContraindications(contraindications);
  }, [currentMedication, patientConditions]);

  const performSafetyChecks = useCallback(async () => {
    setIsChecking(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    checkDrugInteractions();
    checkAllergies();
    checkDosingGuidelines();
    checkContraindications();

    setIsChecking(false);
  }, [checkDrugInteractions, checkAllergies, checkDosingGuidelines, checkContraindications]);

  useEffect(() => {
    if (currentMedication) {
      performSafetyChecks();
    }
  }, [currentMedication, performSafetyChecks]);

  // Combine all warnings for summary
  const allWarnings = [...interactions, ...allergyWarnings, ...dosingWarnings, ...contraindications];
  const criticalWarnings = allWarnings.filter(w => w.severity === 'critical');
  const majorWarnings = allWarnings.filter(w => w.severity === 'major');
  const moderateWarnings = allWarnings.filter(w => w.severity === 'moderate');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalWarnings.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Major</p>
                <p className="text-2xl font-bold text-orange-600">{majorWarnings.length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderate</p>
                <p className="text-2xl font-bold text-yellow-600">{moderateWarnings.length}</p>
              </div>
              <Info className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{allWarnings.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isChecking && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Checking for interactions and safety concerns...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {!isChecking && allWarnings.length > 0 && (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({allWarnings.length})</TabsTrigger>
            <TabsTrigger value="critical">Critical ({criticalWarnings.length})</TabsTrigger>
            <TabsTrigger value="major">Major ({majorWarnings.length})</TabsTrigger>
            <TabsTrigger value="moderate">Moderate ({moderateWarnings.length})</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {allWarnings.map((warning, index) => (
              <Alert key={index} variant={warning.severity === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={warning.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {warning.category}
                      </Badge>
                      <Badge variant="outline">{warning.severity}</Badge>
                    </div>
                    <p className="font-medium">{warning.description}</p>
                    <p className="text-sm text-gray-600">{warning.recommendation}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="critical" className="space-y-3">
            {criticalWarnings.map((warning, index) => (
              <Alert key={index} variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">{warning.category}</Badge>
                      <Badge variant="outline">critical</Badge>
                    </div>
                    <p className="font-medium">{warning.description}</p>
                    <p className="text-sm">{warning.recommendation}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="major" className="space-y-3">
            {majorWarnings.map((warning, index) => (
              <Alert key={index} variant="default">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{warning.category}</Badge>
                      <Badge variant="outline">major</Badge>
                    </div>
                    <p className="font-medium">{warning.description}</p>
                    <p className="text-sm text-gray-600">{warning.recommendation}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="moderate" className="space-y-3">
            {moderateWarnings.map((warning, index) => (
              <Alert key={index} variant="default">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{warning.category}</Badge>
                      <Badge variant="outline">moderate</Badge>
                    </div>
                    <p className="font-medium">{warning.description}</p>
                    <p className="text-sm text-gray-600">{warning.recommendation}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Safety Check Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Drug Interactions</h4>
                    <p className="text-sm text-gray-600">{interactions.length} interactions found</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Allergy Warnings</h4>
                    <p className="text-sm text-gray-600">{allergyWarnings.length} warnings</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dosing Guidelines</h4>
                    <p className="text-sm text-gray-600">{dosingWarnings.length} considerations</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contraindications</h4>
                    <p className="text-sm text-gray-600">{contraindications.length} contraindications</p>
                  </div>
                </div>

                {criticalWarnings.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Critical Alert:</strong> {criticalWarnings.length} critical safety concerns require immediate attention.
                    </AlertDescription>
                  </Alert>
                )}

                {allWarnings.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No significant safety concerns identified for this medication.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No Warnings */}
      {!isChecking && allWarnings.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Safety Concerns</h3>
            <p className="text-gray-600">
              No significant drug interactions, allergies, or contraindications found for {currentMedication}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
