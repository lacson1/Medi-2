
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export default function AppointmentForm({ appointment, patients, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(appointment || {
    patient_id: "",
    patient_name: "",
    appointment_date: "",
    duration: 30,
    type: "checkup",
    status: "scheduled",
    reason: "",
    notes: "",
    provider: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.patient_id) {
      alert("Please select a patient");
      return;
    }
    
    if (!formData.appointment_date) {
      alert("Please select an appointment date and time");
      return;
    }
    
    onSubmit(formData);
  };

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patient_id: patientId,
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : ""
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-xl mb-8">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle>{appointment ? "Edit Appointment" : "Schedule Appointment"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select
                  required
                  value={formData.patient_id}
                  onValueChange={handlePatientChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients && patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Appointment Type *</Label>
                <Select
                  required
                  value={formData.type}
                  onValueChange={(value) => setFormData({...formData, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">Checkup</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date & Time *</Label>
                <Input
                  required
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  placeholder="Healthcare provider name"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Visit</Label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Additional notes or instructions"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isSubmitting ? "Saving..." : appointment ? "Update" : "Schedule"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
