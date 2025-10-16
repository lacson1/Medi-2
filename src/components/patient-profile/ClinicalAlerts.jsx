import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ClinicalAlerts({ patient, newPrescription }) {
  const alerts = [];

  // Check drug allergies
  if (newPrescription && patient.allergies) {
    const allergyMatch = patient.allergies.some(allergy => 
      newPrescription.medication_name?.toLowerCase().includes(allergy.toLowerCase())
    );
    if (allergyMatch) {
      alerts.push({
        type: "critical",
        title: "Allergy Alert",
        message: `Patient has documented allergy to ${patient.allergies.join(', ')}`,
        icon: AlertTriangle
      });
    }
  }

  // Check abnormal vitals
  if (patient.latest_vitals) {
    const { blood_pressure, oxygen_saturation } = patient.latest_vitals;
    
    if (blood_pressure) {
      const [systolic] = blood_pressure.split('/').map(Number);
      if (systolic > 140) {
        alerts.push({
          type: "warning",
          title: "Elevated Blood Pressure",
          message: `Current BP: ${blood_pressure}. Consider hypertension management.`,
          icon: AlertCircle
        });
      }
    }
    
    if (oxygen_saturation && oxygen_saturation < 92) {
      alerts.push({
        type: "critical",
        title: "Low Oxygen Saturation",
        message: `SpO₂: ${oxygen_saturation}%. Requires immediate attention.`,
        icon: AlertTriangle
      });
    }
  }

  // Check age-based alerts
  const age = patient.age;
  if (age && age > 65 && newPrescription) {
    alerts.push({
      type: "info",
      title: "Geriatric Patient",
      message: "Consider adjusted dosing for elderly patient.",
      icon: Info
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert, idx) => {
        const Icon = alert.icon;
        const alertStyles = {
          critical: "border-red-200 bg-red-50 text-red-900",
          warning: "border-orange-200 bg-orange-50 text-orange-900",
          info: "border-blue-200 bg-blue-50 text-blue-900"
        };
        
        return (
          <Alert key={idx} className={`${alertStyles[alert.type]} border-l-4`}>
            <Icon className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <span className="font-semibold text-sm">{alert.title}:</span>
              <span className="text-xs ml-1">{alert.message}</span>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}