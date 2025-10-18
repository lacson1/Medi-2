
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function EncounterForm({ note, patients, onSubmit, onCancel, isSubmitting }: any) {
  const [formData, setFormData] = useState(note || {
    patient_id: "",
    patient_name: "",
    visit_date: new Date().toISOString().slice(0, 16),
    encounter_type: "consultation",
    chief_complaint: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    vital_signs: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.patient_id) {
      alert("Please select a patient");
      return;
    }

    if (!formData.visit_date) {
      alert("Please select a visit date and time");
      return;
    }

    onSubmit(formData);
  };

  const handlePatientChange = (patientId: any) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patient_id: patientId,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : ""
    });
  };

  const updateVitalSign = (field: string, value: any) => {
    setFormData({
      ...formData,
      vital_signs: { ...formData.vital_signs, [field]: value }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-xl mb-8">
        {!onCancel && <CardHeader><CardTitle>{note ? "Edit Encounter" : "New Encounter"}</CardTitle></CardHeader>}
        <CardContent className={onCancel ? 'pt-0' : 'pt-6'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"Patient *"}</Label>
                <Select required value={formData.patient_id} onValueChange={handlePatientChange}>
                  <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                  <SelectContent>
                    {patients && patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Visit Date *"}</Label>
                <Input required type="datetime-local" value={formData.visit_date} onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"Encounter Type"}</Label>
                <Select value={formData.encounter_type} onValueChange={v => setFormData({ ...formData, encounter_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="annual_checkup">Annual Checkup</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{"Chief Complaint"}</Label>
                <Input value={formData.chief_complaint} onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })} placeholder="Primary reason for visit" />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50/50">
              <h3 className="font-semibold mb-3 text-gray-900">Vital Signs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Blood Pressure</Label>
                  <Input placeholder="120/80" value={formData.vital_signs?.blood_pressure || ""} onChange={(e) => updateVitalSign('blood_pressure', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Heart Rate (bpm)</Label>
                  <Input type="number" placeholder="72" value={formData.vital_signs?.heart_rate || ""} onChange={(e) => updateVitalSign('heart_rate', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Temperature (°C)</Label>
                  <Input type="number" step="0.1" placeholder="37.0" value={formData.vital_signs?.temperature || ""} onChange={(e) => updateVitalSign('temperature', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Resp. Rate (/min)</Label>
                  <Input type="number" placeholder="16" value={formData.vital_signs?.respiratory_rate || ""} onChange={(e) => updateVitalSign('respiratory_rate', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">O2 Sat (%)</Label>
                  <Input type="number" placeholder="98" value={formData.vital_signs?.oxygen_saturation || ""} onChange={(e) => updateVitalSign('oxygen_saturation', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{"Subjective"}</Label>
                <Textarea value={formData.subjective} onChange={(e) => setFormData({ ...formData, subjective: e.target.value })} placeholder="Patient's description of symptoms..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{"Objective"}</Label>
                <Textarea value={formData.objective} onChange={(e) => setFormData({ ...formData, objective: e.target.value })} placeholder="Clinical findings and observations..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{"Assessment"}</Label>
                <Textarea value={formData.assessment} onChange={(e) => setFormData({ ...formData, assessment: e.target.value })} placeholder="Diagnosis and clinical impression..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{"Plan"}</Label>
                <Textarea value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} placeholder="Treatment plan and follow-up..." rows={4} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-green-500 to-emerald-600">
                {isSubmitting ? "Saving..." : note ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
