
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Heart, Activity, Droplet, Brain, AlertTriangle, Syringe, Scale } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function ClinicalCalculators() {
  // BMI Calculator
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);

  // GFR Calculator (CKD-EPI)
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [creatinine, setCreatinine] = useState('');
  const [race, setRace] = useState('non-black');
  const [gfr, setGfr] = useState(null);

  // CHADS2 Score
  const [chf, setChf] = useState(false);
  const [hypertension, setHypertension] = useState(false);
  const [ageOver75, setAgeOver75] = useState(false);
  const [diabetes, setDiabetes] = useState(false);
  const [stroke, setStroke] = useState(false);
  const [chads2, setChads2] = useState(null);

  // CHA2DS2-VASc Score
  const [vascularDisease, setVascularDisease] = useState(false);
  const [age65to74, setAge65to74] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const [cha2ds2vasc, setCha2ds2vasc] = useState(null);

  // NEWS2 Score
  const [news2RespRate, setNews2RespRate] = useState('');
  const [news2O2Sat, setNews2O2Sat] = useState('');
  const [news2SupplementalO2, setNews2SupplementalO2] = useState(false);
  const [news2Temp, setNews2Temp] = useState('');
  const [news2SBP, setNews2SBP] = useState('');
  const [news2HR, setNews2HR] = useState('');
  const [news2Consciousness, setNews2Consciousness] = useState('alert');
  const [news2Score, setNews2Score] = useState(null);

  // qSOFA Score
  const [qsofaRespRate, setQsofaRespRate] = useState('');
  const [qsofaSBP, setQsofaSBP] = useState('');
  const [qsofaAlteredMental, setQsofaAlteredMental] = useState(false);
  const [qsofaScore, setQsofaScore] = useState(null);

  // CURB-65 Score
  const [confusion, setConfusion] = useState(false);
  const [urea, setUrea] = useState('');
  const [curbRespRate, setCurbRespRate] = useState('');
  const [curbSBP, setCurbSBP] = useState('');
  const [curbDBP, setCurbDBP] = useState('');
  const [curbAge65, setCurbAge65] = useState(false);
  const [curb65Score, setCurb65Score] = useState(null);

  // Wells DVT Score
  const [activeCancer, setActiveCancer] = useState(false); // Fixed: Changed setActiveCanc to setActiveCancer
  const [paralysis, setParalysis] = useState(false);
  const [bedridden, setBedridden] = useState(false);
  const [localizedTenderness, setLocalizedTenderness] = useState(false);
  const [entireLegSwollen, setEntireLegSwollen] = useState(false);
  const [calfSwelling, setCalfSwelling] = useState(false);
  const [pittingEdema, setPittingEdema] = useState(false);
  const [collateralVeins, setCollateralVeins] = useState(false);
  const [alternativeDiagnosis, setAlternativeDiagnosis] = useState(false);
  const [wellsDVTScore, setWellsDVTScore] = useState(null);

  // HEART Score
  const [heartHistory, setHeartHistory] = useState('');
  const [heartECG, setHeartECG] = useState('');
  const [heartAge, setHeartAge] = useState('');
  const [heartRiskFactors, setHeartRiskFactors] = useState('');
  const [heartTroponin, setHeartTroponin] = useState('');
  const [heartScore, setHeartScore] = useState(null);

  // Glasgow Coma Scale
  const [eyeOpening, setEyeOpening] = useState('');
  const [verbalResponse, setVerbalResponse] = useState('');
  const [motorResponse, setMotorResponse] = useState('');
  const [gcsScore, setGcsScore] = useState(null);

  // MELD Score
  const [meldCreatinine, setMeldCreatinine] = useState('');
  const [meldBilirubin, setMeldBilirubin] = useState('');
  const [meldINR, setMeldINR] = useState('');
  const [meldDialysis, setMeldDialysis] = useState(false);
  const [meldScore, setMeldScore] = useState(null);

  // Child-Pugh Score
  const [cpBilirubin, setCpBilirubin] = useState('');
  const [cpAlbumin, setCpAlbumin] = useState('');
  const [cpINR, setCpINR] = useState('');
  const [cpAscites, setCpAscites] = useState('');
  const [cpEncephalopathy, setCpEncephalopathy] = useState('');
  const [childPughScore, setChildPughScore] = useState(null);

  // HAS-BLED Score
  const [hasbledHypertension, setHasbledHypertension] = useState(false);
  const [abnormalRenal, setAbnormalRenal] = useState(false);
  const [abnormalLiver, setAbnormalLiver] = useState(false);
  const [hasbledStroke, setHasbledStroke] = useState(false);
  const [bleedingHistory, setBleedingHistory] = useState(false);
  const [labileINR, setLabileINR] = useState(false);
  const [elderly, setElderly] = useState(false);
  const [drugsAlcohol, setDrugsAlcohol] = useState(false);
  const [hasbledScore, setHasbledScore] = useState(null);

  // PHQ-9 (Psychiatry - Depression)
  const [phq9_1, setPhq9_1] = useState('');
  const [phq9_2, setPhq9_2] = useState('');
  const [phq9_3, setPhq9_3] = useState('');
  const [phq9_4, setPhq9_4] = useState('');
  const [phq9_5, setPhq9_5] = useState('');
  const [phq9_6, setPhq9_6] = useState('');
  const [phq9_7, setPhq9_7] = useState('');
  const [phq9_8, setPhq9_8] = useState('');
  const [phq9_9, setPhq9_9] = useState('');
  const [phq9Score, setPhq9Score] = useState(null);

  // GAD-7 (Psychiatry - Anxiety)
  const [gad7_1, setGad7_1] = useState('');
  const [gad7_2, setGad7_2] = useState('');
  const [gad7_3, setGad7_3] = useState('');
  const [gad7_4, setGad7_4] = useState('');
  const [gad7_5, setGad7_5] = useState('');
  const [gad7_6, setGad7_6] = useState('');
  const [gad7_7, setGad7_7] = useState('');
  const [gad7Score, setGad7Score] = useState(null);

  // MMSE (Psychiatry - Cognitive)
  const [mmseOrientation, setMmseOrientation] = useState('');
  const [mmseRegistration, setMmseRegistration] = useState('');
  const [mmseAttention, setMmseAttention] = useState('');
  const [mmseRecall, setMmseRecall] = useState('');
  const [mmseLanguage, setMmseLanguage] = useState('');
  const [mmseScore, setMmseScore] = useState(null);

  const calculateBMI = () => {
    const heightM = parseFloat(height) / 100;
    const weightKg = parseFloat(weight);
    if (heightM > 0 && weightKg > 0) {
      const bmiValue = (weightKg / (heightM * heightM)).toFixed(1);
      setBmi(bmiValue);
    }
  };

  const getBMICategory = (bmiValue: any) => {
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'bg-blue-100 text-blue-800' };
    if (bmiValue < 25) return { text: 'Normal', color: 'bg-green-100 text-green-800' };
    if (bmiValue < 30) return { text: 'Overweight', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Obese', color: 'bg-red-100 text-red-800' };
  };

  const calculateGFR = () => {
    const ageNum = parseFloat(age);
    const creatNum = parseFloat(creatinine);
    if (ageNum > 0 && creatNum > 0) {
      const kappa = gender === 'female' ? 0.7 : 0.9;
      const alpha = gender === 'female' ? -0.329 : -0.411;
      const minCreat = Math.min(creatNum / kappa, 1);
      const maxCreat = Math.max(creatNum / kappa, 1);

      let gfrValue = 141 * Math.pow(minCreat, alpha) * Math.pow(maxCreat, -1.209) * Math.pow(0.993, ageNum);
      if (gender === 'female') gfrValue *= 1.018;
      if (race === 'black') gfrValue *= 1.159;

      setGfr(gfrValue.toFixed(1));
    }
  };

  const getGFRStage = (gfrValue: any) => {
    if (gfrValue >= 90) return { text: 'Stage 1 (Normal)', color: 'bg-green-100 text-green-800' };
    if (gfrValue >= 60) return { text: 'Stage 2 (Mild)', color: 'bg-blue-100 text-blue-800' };
    if (gfrValue >= 30) return { text: 'Stage 3 (Moderate)', color: 'bg-yellow-100 text-yellow-800' };
    if (gfrValue >= 15) return { text: 'Stage 4 (Severe)', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Stage 5 (End-stage)', color: 'bg-red-100 text-red-800' };
  };

  const calculateCHADS2 = () => {
    let score = 0;
    if (chf) score += 1;
    if (hypertension) score += 1;
    if (ageOver75) score += 1;
    if (diabetes) score += 1;
    if (stroke) score += 2;
    setChads2(score);
  };

  const getCHADS2Risk = (score: any) => {
    if (score === 0) return { text: 'Low Risk (1.9% annual stroke risk)', color: 'bg-green-100 text-green-800' };
    if (score === 1) return { text: 'Low-Moderate Risk (2.8%)', color: 'bg-blue-100 text-blue-800' };
    if (score === 2) return { text: 'Moderate Risk (4.0%)', color: 'bg-yellow-100 text-yellow-800' };
    if (score === 3) return { text: 'Moderate-High Risk (5.9%)', color: 'bg-orange-100 text-orange-800' };
    return { text: 'High Risk (>8% annual stroke risk)', color: 'bg-red-100 text-red-800' };
  };

  const calculateCHA2DS2VASc = () => {
    let score = 0;
    if (chf) score += 1;
    if (hypertension) score += 1;
    if (ageOver75) score += 2;
    else if (age65to74) score += 1;
    if (diabetes) score += 1;
    if (stroke) score += 2;
    if (vascularDisease) score += 1;
    if (isFemale) score += 1;
    setCha2ds2vasc(score);
  };

  const getCHA2DS2VAScRisk = (score: any) => {
    if (score === 0) return { text: 'Low Risk (0% annual stroke risk)', color: 'bg-green-100 text-green-800' };
    if (score === 1) return { text: 'Low Risk (1.3%)', color: 'bg-blue-100 text-blue-800' };
    if (score === 2) return { text: 'Moderate Risk (2.2%)', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 3) return { text: 'High Risk (>3.2% - anticoagulation recommended)', color: 'bg-red-100 text-red-800' };
    return { text: '', color: '' };
  };

  const calculateNEWS2 = () => {
    let score = 0;
    const rr = parseFloat(news2RespRate);
    const o2 = parseFloat(news2O2Sat);
    const temp = parseFloat(news2Temp);
    const sbp = parseFloat(news2SBP);
    const hr = parseFloat(news2HR);

    // Respiratory Rate
    if (rr <= 8) score += 3;
    else if (rr <= 11) score += 1;
    else if (rr >= 25) score += 3;
    else if (rr >= 21) score += 2;

    // O2 Saturation
    if (o2 <= 91) score += 3;
    else if (o2 <= 93) score += 2;
    else if (o2 <= 95) score += 1;

    // Supplemental O2
    if (news2SupplementalO2) score += 2;

    // Temperature
    if (temp <= 35.0) score += 3;
    else if (temp <= 36.0) score += 1;
    else if (temp >= 39.1) score += 2;
    else if (temp >= 38.1) score += 1;

    // Systolic BP
    if (sbp <= 90) score += 3;
    else if (sbp <= 100) score += 2;
    else if (sbp <= 110) score += 1;
    else if (sbp >= 220) score += 3;

    // Heart Rate
    if (hr <= 40) score += 3;
    else if (hr <= 50) score += 1;
    else if (hr >= 131) score += 3;
    else if (hr >= 111) score += 2;
    else if (hr >= 91) score += 1;

    // Consciousness
    if (news2Consciousness !== 'alert') score += 3;

    setNews2Score(score);
  };

  const getNEWS2Risk = (score: any) => {
    if (score === 0) return { text: 'Low Risk', color: 'bg-green-100 text-green-800' };
    if (score <= 4) return { text: 'Low-Medium Risk', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 6) return { text: 'Medium Risk', color: 'bg-orange-100 text-orange-800' };
    return { text: 'High Risk - Urgent Response', color: 'bg-red-100 text-red-800' };
  };

  const calculateQSOFA = () => {
    let score = 0;
    if (parseFloat(qsofaRespRate) >= 22) score += 1;
    if (parseFloat(qsofaSBP) <= 100) score += 1;
    if (qsofaAlteredMental) score += 1;
    setQsofaScore(score);
  };

  const getQSOFARisk = (score: any) => {
    if (score < 2) return { text: 'Low Risk for Poor Outcomes', color: 'bg-green-100 text-green-800' };
    return { text: 'High Risk - Consider ICU/Escalation', color: 'bg-red-100 text-red-800' };
  };

  const calculateCURB65 = () => {
    let score = 0;
    if (confusion) score += 1;
    if (parseFloat(urea) > 19) score += 1;
    if (parseFloat(curbRespRate) >= 30) score += 1;
    if (parseFloat(curbSBP) < 90 || parseFloat(curbDBP) <= 60) score += 1;
    if (curbAge65) score += 1;
    setCurb65Score(score);
  };

  const getCURB65Risk = (score: any) => {
    if (score <= 1) return { text: 'Low Risk - Outpatient Treatment', color: 'bg-green-100 text-green-800' };
    if (score === 2) return { text: 'Moderate Risk - Consider Hospitalization', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Severe - Hospital/ICU Admission', color: 'bg-red-100 text-red-800' };
  };

  const calculateWellsDVT = () => {
    let score = 0;
    if (activeCancer) score += 1; // Fixed: Changed activeCanc to activeCancer
    if (paralysis) score += 1;
    if (bedridden) score += 1;
    if (localizedTenderness) score += 1;
    if (entireLegSwollen) score += 1;
    if (calfSwelling) score += 1;
    if (pittingEdema) score += 1;
    if (collateralVeins) score += 1;
    if (alternativeDiagnosis) score -= 2;
    setWellsDVTScore(score);
  };

  const getWellsDVTRisk = (score: any) => {
    if (score <= 0) return { text: 'Low Probability (<5%)', color: 'bg-green-100 text-green-800' };
    if (score <= 2) return { text: 'Moderate Probability (~17%)', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'High Probability (~53%) - Imaging Required', color: 'bg-red-100 text-red-800' };
  };

  const calculateHEART = () => {
    const history = parseInt(heartHistory) || 0;
    const ecg = parseInt(heartECG) || 0;
    const age = parseInt(heartAge) || 0;
    const risk = parseInt(heartRiskFactors) || 0;
    const troponin = parseInt(heartTroponin) || 0;
    const score = history + ecg + age + risk + troponin;
    setHeartScore(score);
  };

  const getHEARTRisk = (score: any) => {
    if (score <= 3) return { text: 'Low Risk (1.7% MACE) - Early Discharge', color: 'bg-green-100 text-green-800' };
    if (score <= 6) return { text: 'Moderate Risk (17% MACE) - Observation', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'High Risk (50-65% MACE) - Urgent Intervention', color: 'bg-red-100 text-red-800' };
  };

  const calculateGCS = () => {
    const eye = parseInt(eyeOpening) || 0;
    const verbal = parseInt(verbalResponse) || 0;
    const motor = parseInt(motorResponse) || 0;
    const score = eye + verbal + motor;
    setGcsScore(score);
  };

  const getGCSCategory = (score: any) => {
    if (score >= 14) return { text: 'Mild TBI', color: 'bg-green-100 text-green-800' };
    if (score >= 9) return { text: 'Moderate TBI', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 3) return { text: 'Severe TBI', color: 'bg-red-100 text-red-800' };
    return { text: '', color: '' };
  };

  const calculateMELD = () => {
    const creat = parseFloat(meldCreatinine);
    const bili = parseFloat(meldBilirubin);
    const inr = parseFloat(meldINR);

    if (creat && bili && inr) {
      let score = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(creat) + 6.43;
      if (meldDialysis || creat > 4.0) {
        score = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(4.0) + 6.43;
      }
      score = Math.round(score * 10);
      setMeldScore(Math.max(6, Math.min(40, score)));
    }
  };

  const getMELDCategory = (score: any) => {
    if (score < 10) return { text: '6% 3-month mortality', color: 'bg-green-100 text-green-800' };
    if (score < 20) return { text: '19.6% 3-month mortality', color: 'bg-yellow-100 text-yellow-800' };
    if (score < 30) return { text: '52.6% 3-month mortality', color: 'bg-orange-100 text-orange-800' };
    return { text: '71.3% 3-month mortality', color: 'bg-red-100 text-red-800' };
  };

  const calculateChildPugh = () => {
    let score = 0;
    const bili = parseFloat(cpBilirubin);
    const alb = parseFloat(cpAlbumin);
    const inr = parseFloat(cpINR);

    if (bili < 2) score += 1;
    else if (bili <= 3) score += 2;
    else score += 3;

    if (alb > 3.5) score += 1;
    else if (alb >= 2.8) score += 2;
    else score += 3;

    if (inr < 1.7) score += 1;
    else if (inr <= 2.3) score += 2;
    else score += 3;

    if (cpAscites === 'none') score += 1;
    else if (cpAscites === 'mild') score += 2;
    else if (cpAscites === 'severe') score += 3;

    if (cpEncephalopathy === 'none') score += 1;
    else if (cpEncephalopathy === 'grade12') score += 2;
    else if (cpEncephalopathy === 'grade34') score += 3;

    setChildPughScore(score);
  };

  const getChildPughClass = (score: any) => {
    if (score <= 6) return { text: 'Class A - 1-year survival 100%', color: 'bg-green-100 text-green-800' };
    if (score <= 9) return { text: 'Class B - 1-year survival 81%', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Class C - 1-year survival 45%', color: 'bg-red-100 text-red-800' };
  };

  const calculateHASBLED = () => {
    let score = 0;
    if (hasbledHypertension) score += 1;
    if (abnormalRenal) score += 1;
    if (abnormalLiver) score += 1;
    if (hasbledStroke) score += 1;
    if (bleedingHistory) score += 1;
    if (labileINR) score += 1;
    if (elderly) score += 1;
    if (drugsAlcohol) score += 1;
    setHasbledScore(score);
  };

  const getHASBLEDRisk = (score: any) => {
    if (score <= 2) return { text: 'Low Risk (0.9-3.4% per year)', color: 'bg-green-100 text-green-800' };
    return { text: 'High Risk (>3.7% per year) - Caution with anticoagulation', color: 'bg-red-100 text-red-800' };
  };

  const calculatePHQ9 = () => {
    const score = [phq9_1, phq9_2, phq9_3, phq9_4, phq9_5, phq9_6, phq9_7, phq9_8, phq9_9]
      .reduce((sum: any, val: any) => sum + (parseInt(val) || 0), 0);
    setPhq9Score(score);
  };

  const getPHQ9Severity = (score: any) => {
    if (score <= 4) return { text: 'Minimal Depression', color: 'bg-green-100 text-green-800' };
    if (score <= 9) return { text: 'Mild Depression', color: 'bg-blue-100 text-blue-800' };
    if (score <= 14) return { text: 'Moderate Depression', color: 'bg-yellow-100 text-yellow-800' };
    if (score <= 19) return { text: 'Moderately Severe Depression', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Severe Depression', color: 'bg-red-100 text-red-800' };
  };

  const calculateGAD7 = () => {
    const score = [gad7_1, gad7_2, gad7_3, gad7_4, gad7_5, gad7_6, gad7_7]
      .reduce((sum: any, val: any) => sum + (parseInt(val) || 0), 0);
    setGad7Score(score);
  };

  const getGAD7Severity = (score: any) => {
    if (score <= 4) return { text: 'Minimal Anxiety', color: 'bg-green-100 text-green-800' };
    if (score <= 9) return { text: 'Mild Anxiety', color: 'bg-blue-100 text-blue-800' };
    if (score <= 14) return { text: 'Moderate Anxiety', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Severe Anxiety', color: 'bg-red-100 text-red-800' };
  };

  const calculateMMSE = () => {
    const score = (parseInt(mmseOrientation) || 0) + (parseInt(mmseRegistration) || 0) +
      (parseInt(mmseAttention) || 0) + (parseInt(mmseRecall) || 0) + (parseInt(mmseLanguage) || 0);
    setMmseScore(score);
  };

  const getMMSESeverity = (score: any) => {
    if (score >= 24) return { text: 'Normal Cognition', color: 'bg-green-100 text-green-800' };
    if (score >= 18) return { text: 'Mild Cognitive Impairment', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 10) return { text: 'Moderate Cognitive Impairment', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Severe Cognitive Impairment', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinical Calculators & Assessment Scores</h2>
          <p className="text-gray-600 text-sm">Comprehensive medical calculations and risk scores</p>
        </div>
      </div>

      <Tabs defaultValue="cardio" className="w-full">
        <TabsList className="grid w-full grid-cols-6 h-auto">
          <TabsTrigger value="cardio" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Cardiology</span>
          </TabsTrigger>
          <TabsTrigger value="critical" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Critical Care</span>
          </TabsTrigger>
          <TabsTrigger value="renal" className="flex items-center gap-2">
            <Droplet className="w-4 h-4" />
            <span className="hidden sm:inline">Renal</span>
          </TabsTrigger>
          <TabsTrigger value="neuro" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Neurology</span>
          </TabsTrigger>
          <TabsTrigger value="gi" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">GI/Liver</span>
          </TabsTrigger>
          <TabsTrigger value="psych" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Psychiatry</span>
          </TabsTrigger>
        </TabsList>

        {/* CARDIOLOGY TAB */}
        <TabsContent value="cardio" className="space-y-6 mt-6">
          {/* CHADS2 Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                CHADS₂ Score for Stroke Risk in AFib
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={chf} onCheckedChange={setChf} />
                  <span>Congestive Heart Failure (CHF)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={hypertension} onCheckedChange={setHypertension} />
                  <span>Hypertension</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={ageOver75} onCheckedChange={setAgeOver75} />
                  <span>Age ≥75 years</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={diabetes} onCheckedChange={setDiabetes} />
                  <span>Diabetes Mellitus</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={stroke} onCheckedChange={setStroke} />
                  <span>Prior Stroke or TIA (worth 2 points)</span>
                </label>
              </div>
              <Button onClick={calculateCHADS2} className="w-full">Calculate CHADS₂ Score</Button>
              {chads2 !== null && (
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">CHADS₂ Score</p>
                      <p className="text-3xl font-bold text-red-900">{chads2}</p>
                    </div>
                    <Badge className={getCHADS2Risk(chads2).color}>
                      {getCHADS2Risk(chads2).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CHA2DS2-VASc Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                CHA₂DS₂-VASc Score for Stroke Risk in AFib
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={chf} onCheckedChange={setChf} />
                  <span>Congestive Heart Failure</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={hypertension} onCheckedChange={setHypertension} />
                  <span>Hypertension</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={ageOver75} onCheckedChange={setAgeOver75} />
                  <span>Age ≥75 years (2 points)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={age65to74} onCheckedChange={setAge65to74} />
                  <span>Age 65-74 years (1 point)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={diabetes} onCheckedChange={setDiabetes} />
                  <span>Diabetes Mellitus</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={stroke} onCheckedChange={setStroke} />
                  <span>Prior Stroke/TIA/Thromboembolism (2 points)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={vascularDisease} onCheckedChange={setVascularDisease} />
                  <span>Vascular Disease (MI, PAD, Aortic Plaque)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={isFemale} onCheckedChange={setIsFemale} />
                  <span>Female Sex</span>
                </label>
              </div>
              <Button onClick={calculateCHA2DS2VASc} className="w-full">Calculate CHA₂DS₂-VASc Score</Button>
              {cha2ds2vasc !== null && (
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">CHA₂DS₂-VASc Score</p>
                      <p className="text-3xl font-bold text-red-900">{cha2ds2vasc}</p>
                    </div>
                    <Badge className={getCHA2DS2VAScRisk(cha2ds2vasc).color}>
                      {getCHA2DS2VAScRisk(cha2ds2vasc).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HEART Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                HEART Score for Chest Pain (MACE Risk)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{"History"}</Label>
                  <Select value={heartHistory} onValueChange={setHeartHistory}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Slightly suspicious (0)</SelectItem>
                      <SelectItem value="1">Moderately suspicious (1)</SelectItem>
                      <SelectItem value="2">Highly suspicious (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"ECG"}</Label>
                  <Select value={heartECG} onValueChange={setHeartECG}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal (0)</SelectItem>
                      <SelectItem value="1">Non-specific ST-T changes (1)</SelectItem>
                      <SelectItem value="2">Significant ST deviation (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Age"}</Label>
                  <Select value={heartAge} onValueChange={setHeartAge}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">&lt;45 years (0)</SelectItem>
                      <SelectItem value="1">45-65 years (1)</SelectItem>
                      <SelectItem value="2">&gt;65 years (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Risk Factors (HTN, DM, Smoking, Dyslipidemia, Family Hx)"}</Label>
                  <Select value={heartRiskFactors} onValueChange={setHeartRiskFactors}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No risk factors (0)</SelectItem>
                      <SelectItem value="1">1-2 risk factors (1)</SelectItem>
                      <SelectItem value="2">≥3 risk factors or history of atherosclerotic disease (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Troponin"}</Label>
                  <Select value={heartTroponin} onValueChange={setHeartTroponin}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Normal (0)</SelectItem>
                      <SelectItem value="1">1-3x normal limit (1)</SelectItem>
                      <SelectItem value="2">&gt;3x normal limit (2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateHEART} className="w-full">Calculate HEART Score</Button>
              {heartScore !== null && (
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">HEART Score</p>
                      <p className="text-3xl font-bold text-red-900">{heartScore}</p>
                    </div>
                    <Badge className={getHEARTRisk(heartScore).color}>
                      {getHEARTRisk(heartScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wells DVT Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Wells' Criteria for DVT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={activeCancer} onCheckedChange={setActiveCancer} /> {/* Fixed: Changed activeCanc to activeCancer */}
                  <span>Active cancer (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={paralysis} onCheckedChange={setParalysis} />
                  <span>Paralysis, paresis, or recent plaster immobilization (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={bedridden} onCheckedChange={setBedridden} />
                  <span>Recently bedridden &gt;3 days or major surgery (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={localizedTenderness} onCheckedChange={setLocalizedTenderness} />
                  <span>Localized tenderness along deep venous system (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={entireLegSwollen} onCheckedChange={setEntireLegSwollen} />
                  <span>Entire leg swollen (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={calfSwelling} onCheckedChange={setCalfSwelling} />
                  <span>Calf swelling &gt;3cm compared to other leg (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={pittingEdema} onCheckedChange={setPittingEdema} />
                  <span>Pitting edema confined to symptomatic leg (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={collateralVeins} onCheckedChange={setCollateralVeins} />
                  <span>Collateral superficial veins (+1)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={alternativeDiagnosis} onCheckedChange={setAlternativeDiagnosis} />
                  <span>Alternative diagnosis as likely or more likely than DVT (-2)</span>
                </label>
              </div>
              <Button onClick={calculateWellsDVT} className="w-full">Calculate Wells' DVT Score</Button>
              {wellsDVTScore !== null && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Wells' DVT Score</p>
                      <p className="text-3xl font-bold text-blue-900">{wellsDVTScore}</p>
                    </div>
                    <Badge className={getWellsDVTRisk(wellsDVTScore).color}>
                      {getWellsDVTRisk(wellsDVTScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HAS-BLED Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                HAS-BLED Bleeding Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={hasbledHypertension} onCheckedChange={setHasbledHypertension} />
                  <span>Hypertension (uncontrolled, SBP &gt;160 mmHg)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={abnormalRenal} onCheckedChange={setAbnormalRenal} />
                  <span>Abnormal renal function (dialysis, transplant, Cr &gt;2.3)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={abnormalLiver} onCheckedChange={setAbnormalLiver} />
                  <span>Abnormal liver function (cirrhosis or bilirubin &gt;2x normal)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={hasbledStroke} onCheckedChange={setHasbledStroke} />
                  <span>Stroke history</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={bleedingHistory} onCheckedChange={setBleedingHistory} />
                  <span>Bleeding history or predisposition</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={labileINR} onCheckedChange={setLabileINR} />
                  <span>Labile INR (unstable/high INRs, time in therapeutic range &lt;60%)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={elderly} onCheckedChange={setElderly} />
                  <span>Elderly (age &gt;65)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={drugsAlcohol} onCheckedChange={setDrugsAlcohol} />
                  <span>Drugs (antiplatelet agents, NSAIDs) or alcohol abuse</span>
                </label>
              </div>
              <Button onClick={calculateHASBLED} className="w-full">Calculate HAS-BLED Score</Button>
              {hasbledScore !== null && (
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">HAS-BLED Score</p>
                      <p className="text-3xl font-bold text-orange-900">{hasbledScore}</p>
                    </div>
                    <Badge className={getHASBLEDRisk(hasbledScore).color}>
                      {getHASBLEDRisk(hasbledScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRITICAL CARE TAB */}
        <TabsContent value="critical" className="space-y-6 mt-6">
          {/* NEWS2 Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                NEWS2 Score (National Early Warning Score)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Respiratory Rate (/min)"}</Label>
                  <Input type="number" value={news2RespRate} onChange={(e) => setNews2RespRate(e.target.value)} placeholder="e.g., 16" />
                </div>
                <div className="space-y-2">
                  <Label>{"Oxygen Saturation (%)"}</Label>
                  <Input type="number" value={news2O2Sat} onChange={(e) => setNews2O2Sat(e.target.value)} placeholder="e.g., 97" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={news2SupplementalO2} onCheckedChange={setNews2SupplementalO2} />
                    <span>On Supplemental Oxygen</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>{"Temperature (°C)"}</Label>
                  <Input type="number" step="0.1" value={news2Temp} onChange={(e) => setNews2Temp(e.target.value)} placeholder="e.g., 37.2" />
                </div>
                <div className="space-y-2">
                  <Label>{"Systolic BP (mmHg)"}</Label>
                  <Input type="number" value={news2SBP} onChange={(e) => setNews2SBP(e.target.value)} placeholder="e.g., 120" />
                </div>
                <div className="space-y-2">
                  <Label>{"Heart Rate (bpm)"}</Label>
                  <Input type="number" value={news2HR} onChange={(e) => setNews2HR(e.target.value)} placeholder="e.g., 72" />
                </div>
                <div className="space-y-2">
                  <Label>{"Level of Consciousness"}</Label>
                  <Select value={news2Consciousness} onValueChange={setNews2Consciousness}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="cvpu">New confusion/CVPU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateNEWS2} className="w-full">Calculate NEWS2 Score</Button>
              {news2Score !== null && (
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">NEWS2 Score</p>
                      <p className="text-3xl font-bold text-red-900">{news2Score}</p>
                    </div>
                    <Badge className={getNEWS2Risk(news2Score).color}>
                      {getNEWS2Risk(news2Score).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* qSOFA Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                qSOFA Score (Quick SOFA for Sepsis)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{"Respiratory Rate (/min)"}</Label>
                  <Input type="number" value={qsofaRespRate} onChange={(e) => setQsofaRespRate(e.target.value)} placeholder="e.g., 16" />
                  <p className="text-xs text-gray-500">≥22 scores 1 point</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Systolic BP (mmHg)"}</Label>
                  <Input type="number" value={qsofaSBP} onChange={(e) => setQsofaSBP(e.target.value)} placeholder="e.g., 120" />
                  <p className="text-xs text-gray-500">≤100 scores 1 point</p>
                </div>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={qsofaAlteredMental} onCheckedChange={setQsofaAlteredMental} />
                  <span>Altered Mental Status (GCS &lt;15)</span>
                </label>
              </div>
              <Button onClick={calculateQSOFA} className="w-full">Calculate qSOFA Score</Button>
              {qsofaScore !== null && (
                <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">qSOFA Score</p>
                      <p className="text-3xl font-bold text-orange-900">{qsofaScore} / 3</p>
                    </div>
                    <Badge className={getQSOFARisk(qsofaScore).color}>
                      {getQSOFARisk(qsofaScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CURB-65 Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-600" />
                CURB-65 Score for Pneumonia Severity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={confusion} onCheckedChange={setConfusion} />
                  <span>Confusion (new onset)</span>
                </label>
                <div className="space-y-2">
                  <Label>{"Blood Urea Nitrogen (mg/dL)"}</Label>
                  <Input type="number" value={urea} onChange={(e) => setUrea(e.target.value)} placeholder="e.g., 15" />
                  <p className="text-xs text-gray-500">&gt;19 mg/dL scores 1 point</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Respiratory Rate (/min)"}</Label>
                  <Input type="number" value={curbRespRate} onChange={(e) => setCurbRespRate(e.target.value)} placeholder="e.g., 16" />
                  <p className="text-xs text-gray-500">≥30 scores 1 point</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{"Systolic BP (mmHg)"}</Label>
                    <Input type="number" value={curbSBP} onChange={(e) => setCurbSBP(e.target.value)} placeholder="e.g., 120" />
                  </div>
                  <div className="space-y-2">
                    <Label>{"Diastolic BP (mmHg)"}</Label>
                    <Input type="number" value={curbDBP} onChange={(e) => setCurbDBP(e.target.value)} placeholder="e.g., 80" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">SBP &lt;90 or DBP ≤60 scores 1 point</p>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox checked={curbAge65} onCheckedChange={setCurbAge65} />
                  <span>Age ≥65 years</span>
                </label>
              </div>
              <Button onClick={calculateCURB65} className="w-full">Calculate CURB-65 Score</Button>
              {curb65Score !== null && (
                <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">CURB-65 Score</p>
                      <p className="text-3xl font-bold text-cyan-900">{curb65Score} / 5</p>
                    </div>
                    <Badge className={getCURB65Risk(curb65Score).color}>
                      {getCURB65Risk(curb65Score).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RENAL TAB */}
        <TabsContent value="renal" className="space-y-6 mt-6">
          {/* GFR Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-cyan-600" />
                eGFR Calculator (CKD-EPI Formula)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{Age(years)}</Label>
                  <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="65" />
                </div>
                <div className="space-y-2">
                  <Label>{"Gender"}</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{Creatinine(mg / dL)}</Label>
                  <Input type="number" step="0.1" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="1.2" />
                </div>
                <div className="space-y-2">
                  <Label>{"Race"}</Label>
                  <Select value={race} onValueChange={setRace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-black">Non-Black</SelectItem>
                      <SelectItem value="black">Black/African American</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateGFR} className="w-full">Calculate eGFR</Button>
              {gfr && (
                <div className="p-4 bg-cyan-50 rounded-lg border-2 border-cyan-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">eGFR</p>
                      <p className="text-3xl font-bold text-cyan-900">{gfr} <span className="text-lg">mL/min/1.73m²</span></p>
                    </div>
                    <Badge className={getGFRStage(parseFloat(gfr)).color}>
                      {getGFRStage(parseFloat(gfr)).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NEUROLOGY TAB */}
        <TabsContent value="neuro" className="space-y-6 mt-6">
          {/* Glasgow Coma Scale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Glasgow Coma Scale (GCS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{"Eye Opening Response"}</Label>
                  <Select value={eyeOpening} onValueChange={setEyeOpening}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">Spontaneous (4)</SelectItem>
                      <SelectItem value="3">To verbal command (3)</SelectItem>
                      <SelectItem value="2">To pain (2)</SelectItem>
                      <SelectItem value="1">No response (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Verbal Response"}</Label>
                  <Select value={verbalResponse} onValueChange={setVerbalResponse}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Oriented (5)</SelectItem>
                      <SelectItem value="4">Confused (4)</SelectItem>
                      <SelectItem value="3">Inappropriate words (3)</SelectItem>
                      <SelectItem value="2">Incomprehensible sounds (2)</SelectItem>
                      <SelectItem value="1">No response (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Motor Response"}</Label>
                  <Select value={motorResponse} onValueChange={setMotorResponse}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">Obeys commands (6)</SelectItem>
                      <SelectItem value="5">Localizes to pain (5)</SelectItem>
                      <SelectItem value="4">Withdraws from pain (4)</SelectItem>
                      <SelectItem value="3">Flexion to pain (3)</SelectItem>
                      <SelectItem value="2">Extension to pain (2)</SelectItem>
                      <SelectItem value="1">No response (1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateGCS} className="w-full">Calculate GCS</Button>
              {gcsScore && (
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Glasgow Coma Scale</p>
                      <p className="text-3xl font-bold text-purple-900">{gcsScore} / 15</p>
                    </div>
                    <Badge className={getGCSCategory(gcsScore).color}>
                      {getGCSCategory(gcsScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GI/LIVER TAB */}
        <TabsContent value="gi" className="space-y-6 mt-6">
          {/* MELD Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                MELD Score (Liver Disease Severity)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{Creatinine(mg / dL)}</Label>
                  <Input type="number" step="0.1" value={meldCreatinine} onChange={(e) => setMeldCreatinine(e.target.value)} placeholder="1.0" />
                </div>
                <div className="space-y-2">
                  <Label>{Bilirubin(mg / dL)}</Label>
                  <Input type="number" step="0.1" value={meldBilirubin} onChange={(e) => setMeldBilirubin(e.target.value)} placeholder="1.0" />
                </div>
                <div className="space-y-2">
                  <Label>{"INR"}</Label>
                  <Input type="number" step="0.1" value={meldINR} onChange={(e) => setMeldINR(e.target.value)} placeholder="1.1" />
                </div>
                <div className="space-y-2 flex items-center pt-6">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={meldDialysis} onCheckedChange={setMeldDialysis} />
                    <span>On Dialysis</span>
                  </label>
                </div>
              </div>
              <Button onClick={calculateMELD} className="w-full">Calculate MELD Score</Button>
              {meldScore !== null && (
                <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">MELD Score</p>
                      <p className="text-3xl font-bold text-amber-900">{meldScore}</p>
                    </div>
                    <Badge className={getMELDCategory(meldScore).color}>
                      {getMELDCategory(meldScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Child-Pugh Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                Child-Pugh Score (Cirrhosis Severity)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{Bilirubin(mg / dL)}</Label>
                  <Input type="number" step="0.1" value={cpBilirubin} onChange={(e) => setCpBilirubin(e.target.value)} placeholder="1.0" />
                </div>
                <div className="space-y-2">
                  <Label>{Albumin(g / dL)}</Label>
                  <Input type="number" step="0.1" value={cpAlbumin} onChange={(e) => setCpAlbumin(e.target.value)} placeholder="3.5" />
                </div>
                <div className="space-y-2">
                  <Label>{"INR"}</Label>
                  <Input type="number" step="0.1" value={cpINR} onChange={(e) => setCpINR(e.target.value)} placeholder="1.1" />
                </div>
                <div className="space-y-2">
                  <Label>{"Ascites"}</Label>
                  <Select value={cpAscites} onValueChange={setCpAscites}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mild">Mild (controlled with diuretics)</SelectItem>
                      <SelectItem value="severe">Moderate to Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{"Hepatic Encephalopathy"}</Label>
                  <Select value={cpEncephalopathy} onValueChange={setCpEncephalopathy}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="grade12">Grade 1-2 (mild)</SelectItem>
                      <SelectItem value="grade34">Grade 3-4 (severe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={calculateChildPugh} className="w-full">Calculate Child-Pugh Score</Button>
              {childPughScore && (
                <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Child-Pugh Score</p>
                      <p className="text-3xl font-bold text-amber-900">{childPughScore}</p>
                    </div>
                    <Badge className={getChildPughClass(childPughScore).color}>
                      {getChildPughClass(childPughScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* BMI Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Body Mass Index (BMI) Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{Height(cm)}</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
                </div>
                <div className="space-y-2">
                  <Label>{Weight(kg)}</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                </div>
              </div>
              <Button onClick={calculateBMI} className="w-full">Calculate BMI</Button>
              {bmi && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Your BMI</p>
                      <p className="text-3xl font-bold text-blue-900">{bmi}</p>
                    </div>
                    <Badge className={getBMICategory(parseFloat(bmi)).color}>
                      {getBMICategory(parseFloat(bmi)).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PSYCHIATRY TAB */}
        <TabsContent value="psych" className="space-y-6 mt-6">
          {/* PHQ-9 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                PHQ-9 (Depression Screening)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Over the last 2 weeks, how often have you been bothered by...</p>
              <div className="space-y-3">
                {[
                  { label: "Little interest or pleasure in doing things", state: phq9_1, setState: setPhq9_1 },
                  { label: "Feeling down, depressed, or hopeless", state: phq9_2, setState: setPhq9_2 },
                  { label: "Trouble falling/staying asleep, or sleeping too much", state: phq9_3, setState: setPhq9_3 },
                  { label: "Feeling tired or having little energy", state: phq9_4, setState: setPhq9_4 },
                  { label: "Poor appetite or overeating", state: phq9_5, setState: setPhq9_5 },
                  { label: "Feeling bad about yourself or that you are a failure", state: phq9_6, setState: setPhq9_6 },
                  { label: "Trouble concentrating on things", state: phq9_7, setState: setPhq9_7 },
                  { label: "Moving/speaking slowly or being fidgety/restless", state: phq9_8, setState: setPhq9_8 },
                  { label: "Thoughts that you would be better off dead or hurting yourself", state: phq9_9, setState: setPhq9_9 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label>{idx + 1}. {item.label}</Label>
                    <Select value={item.state} onValueChange={item.setState}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Not at all (0)</SelectItem>
                        <SelectItem value="1">Several days (1)</SelectItem>
                        <SelectItem value="2">More than half the days (2)</SelectItem>
                        <SelectItem value="3">Nearly every day (3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button onClick={calculatePHQ9} className="w-full">Calculate PHQ-9 Score</Button>
              {phq9Score !== null && (
                <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">PHQ-9 Score</p>
                      <p className="text-3xl font-bold text-indigo-900">{phq9Score} / 27</p>
                    </div>
                    <Badge className={getPHQ9Severity(phq9Score).color}>
                      {getPHQ9Severity(phq9Score).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GAD-7 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                GAD-7 (Anxiety Screening)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Over the last 2 weeks, how often have you been bothered by...</p>
              <div className="space-y-3">
                {[
                  { label: "Feeling nervous, anxious, or on edge", state: gad7_1, setState: setGad7_1 },
                  { label: "Not being able to stop or control worrying", state: gad7_2, setState: setGad7_2 },
                  { label: "Worrying too much about different things", state: gad7_3, setState: setGad7_3 },
                  { label: "Trouble relaxing", state: gad7_4, setState: setGad7_4 },
                  { label: "Being so restless that it's hard to sit still", state: gad7_5, setState: setGad7_5 },
                  { label: "Becoming easily annoyed or irritable", state: gad7_6, setState: setGad7_6 },
                  { label: "Feeling afraid as if something awful might happen", state: gad7_7, setState: setGad7_7 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label>{idx + 1}. {item.label}</Label>
                    <Select value={item.state} onValueChange={item.setState}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Not at all (0)</SelectItem>
                        <SelectItem value="1">Several days (1)</SelectItem>
                        <SelectItem value="2">More than half the days (2)</SelectItem>
                        <SelectItem value="3">Nearly every day (3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button onClick={calculateGAD7} className="w-full">Calculate GAD-7 Score</Button>
              {gad7Score !== null && (
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">GAD-7 Score</p>
                      <p className="text-3xl font-bold text-purple-900">{gad7Score} / 21</p>
                    </div>
                    <Badge className={getGAD7Severity(gad7Score).color}>
                      {getGAD7Severity(gad7Score).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MMSE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-teal-600" />
                Mini-Mental State Examination (MMSE)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Score each domain based on patient performance</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{"Orientation (Max 10 points)"}</Label>
                  <Input type="number" min="0" max="10" value={mmseOrientation} onChange={(e) => setMmseOrientation(e.target.value)} placeholder="0-10" />
                  <p className="text-xs text-gray-500">Time (5) + Place (5)</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Registration (Max 3 points)"}</Label>
                  <Input type="number" min="0" max="3" value={mmseRegistration} onChange={(e) => setMmseRegistration(e.target.value)} placeholder="0-3" />
                  <p className="text-xs text-gray-500">Repeat 3 words</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Attention & Calculation (Max 5 points)"}</Label>
                  <Input type="number" min="0" max="5" value={mmseAttention} onChange={(e) => setMmseAttention(e.target.value)} placeholder="0-5" />
                  <p className="text-xs text-gray-500">Serial 7s or spell WORLD backwards</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Recall (Max 3 points)"}</Label>
                  <Input type="number" min="0" max="3" value={mmseRecall} onChange={(e) => setMmseRecall(e.target.value)} placeholder="0-3" />
                  <p className="text-xs text-gray-500">Recall the 3 words from registration</p>
                </div>
                <div className="space-y-2">
                  <Label>{"Language & Praxis (Max 9 points)"}</Label>
                  <Input type="number" min="0" max="9" value={mmseLanguage} onChange={(e) => setMmseLanguage(e.target.value)} placeholder="0-9" />
                  <p className="text-xs text-gray-500">Naming, repetition, 3-stage command, reading, writing, copying</p>
                </div>
              </div>
              <Button onClick={calculateMMSE} className="w-full">Calculate MMSE Score</Button>
              {mmseScore !== null && (
                <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">MMSE Score</p>
                      <p className="text-3xl font-bold text-teal-900">{mmseScore} / 30</p>
                    </div>
                    <Badge className={getMMSESeverity(mmseScore).color}>
                      {getMMSESeverity(mmseScore).text}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
