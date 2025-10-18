import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TelemedicineForm({
  session,
  patients = [],
  users = [],
  onSubmit,
  onCancel,
  isSubmitting
}) {
  const [formData, setFormData] = useState(session || {
    session_date: new Date().toISOString().slice(0, 16),
    session_topic: "",
    status: "scheduled",
    session_type: "consultation",
    patient_id: "",
    patient_name: "",
    provider_id: "",
    provider_name: "",
    duration_minutes: 30,
    meeting_link: "",
    recording_consent: false,
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleProviderChange = (providerId: any) => {
    const provider = users.find(u => u.id === providerId);
    setFormData({
      ...formData,
      provider_id: providerId,
      provider_name: provider ? provider.name : ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{"Session Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{"Session Topic *"}</Label>
            <Input
              required
              value={formData.session_topic}
              onChange={e => setFormData({ ...formData, session_topic: e.target.value })}
              placeholder="e.g., Follow-up Consultation"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Session Type"}</Label>
              <Select value={formData.session_type} onValueChange={v => setFormData({ ...formData, session_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">🩺 Consultation</SelectItem>
                  <SelectItem value="follow_up">🔄 Follow-up</SelectItem>
                  <SelectItem value="emergency">🚨 Emergency</SelectItem>
                  <SelectItem value="specialty">🏥 Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                min="15"
                max="120"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>{"Scheduling"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Date & Time *"}</Label>
              <Input
                type="datetime-local"
                required
                value={formData.session_date}
                onChange={e => setFormData({ ...formData, session_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{"Status"}</Label>
              <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>{"Participants"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Patient *"}</Label>
              <Select value={formData.patient_id} onValueChange={handlePatientChange}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{"Provider *"}</Label>
              <Select value={formData.provider_id} onValueChange={handleProviderChange}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {users.filter(user => ['Doctor', 'Nurse', 'Provider'].includes(user.role)).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{"Technical Settings"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{"Meeting Link (Optional)"}</Label>
            <Input
              value={formData.meeting_link}
              onChange={e => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500">
              Leave empty to use built-in video calling
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recording_consent"
              checked={formData.recording_consent}
              onCheckedChange={(checked) => setFormData({ ...formData, recording_consent: checked })}
            />
            <Label htmlFor="recording_consent" className="text-sm">
              Patient consents to session recording
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{"Notes"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{"Session Notes"}</Label>
            <Textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details about the session..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Session"}
        </Button>
      </div>
    </form>
  );
}