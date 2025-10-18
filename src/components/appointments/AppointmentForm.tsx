
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Calendar, Clock, User, AlertCircle, CheckCircle } from "lucide-react";
import { addDays, isAfter, isBefore, parseISO } from "date-fns";
import { toast } from "sonner";
import PropTypes from "prop-types";

interface AppointmentFormProps {
  appointment?: any;
  patients?: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function AppointmentForm({ appointment, patients, onSubmit, onCancel, isSubmitting }: AppointmentFormProps) {
  const [formData, setFormData] = useState(appointment || {
    patient_id: "",
    patient_name: "",
    appointment_date: "",
    duration: 30,
    type: "checkup",
    status: "scheduled",
    reason: "",
    notes: "",
    provider: "",
    is_recurring: false,
    recurring_pattern: "none",
    recurring_end_date: "",
    reminder_sent: false,
    priority: "normal"
  });

  const [errors, setErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);

  // Enhanced validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient_id) {
      newErrors.patient_id = "Please select a patient";
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = "Please select an appointment date and time";
    } else {
      const appointmentDate = parseISO(formData.appointment_date);
      const now = new Date();

      if (isBefore(appointmentDate, now)) {
        newErrors.appointment_date = "Appointment date cannot be in the past";
      }

      if (isAfter(appointmentDate, addDays(now, 365))) {
        newErrors.appointment_date = "Appointment date cannot be more than 1 year in the future";
      }
    }

    if (!formData.reason || formData.reason.trim().length < 3) {
      newErrors.reason = "Please provide a reason for the appointment (minimum 3 characters)";
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = "Duration must be between 15 and 480 minutes";
    }

    if (formData.is_recurring && !formData.recurring_end_date) {
      newErrors.recurring_end_date = "Please select an end date for recurring appointments";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check for scheduling conflicts
  const checkConflicts = useCallback(() => {
    if (!formData.appointment_date || !formData.duration) return;

    const appointmentStart = parseISO(formData.appointment_date);

    // This would typically check against existing appointments
    // For now, we'll simulate some basic conflict detection
    const mockConflicts = [];

    if (appointmentStart.getHours() < 8 || appointmentStart.getHours() > 18) {
      mockConflicts.push("Appointment is outside normal business hours (8 AM - 6 PM)");
    }

    setConflicts(mockConflicts);
  }, [formData.appointment_date, formData.duration]);

  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (conflicts.length > 0) {
      toast.warning("Please review potential conflicts before proceeding");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-xl mb-8">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{appointment ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {appointment ? "Update appointment details" : "Fill in the details to schedule a new appointment"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} type="button">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">Potential Conflicts Detected</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    {conflicts.map((conflict, index) => (
                      <li key={index}>• {conflict}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Patient *"}</Label>
                  <Select
                    required
                    value={formData.patient_id}
                    onValueChange={handlePatientChange}
                  >
                    <SelectTrigger className={errors.patient_id ? "border-red-500" : ""}>
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
                  {errors.patient_id && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.patient_id}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{"Appointment Type *"}</Label>
                  <Select
                    required
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
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
                      <SelectItem value="telemedicine">Telemedicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{"Priority"}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{"Status"}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
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
            </div>

            {/* Scheduling Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Scheduling
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{"Date & Time *"}</Label>
                  <Input
                    required
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className={errors.appointment_date ? "border-red-500" : ""}
                  />
                  {errors.appointment_date && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.appointment_date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{"Duration (minutes)"}</Label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                  >
                    <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.duration && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{"Provider"}</Label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="Healthcare provider name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{"Reason for Visit *"}</Label>
                  <Input
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief description of the visit purpose"
                    className={errors.reason ? "border-red-500" : ""}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                Additional Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{"Notes"}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Additional notes, instructions, or special requirements..."
                    className="resize-none"
                  />
                </div>

                {/* Recurring Appointment Options */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                    />
                    <Label htmlFor="recurring" className="text-sm font-medium">
                      Recurring Appointment
                    </Label>
                  </div>

                  {formData.is_recurring && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{"Recurring Pattern"}</Label>
                        <Select
                          value={formData.recurring_pattern}
                          onValueChange={(value) => setFormData({ ...formData, recurring_pattern: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{"End Date"}</Label>
                        <Input
                          type="date"
                          value={formData.recurring_end_date}
                          onChange={(e) => setFormData({ ...formData, recurring_end_date: e.target.value })}
                          className={errors.recurring_end_date ? "border-red-500" : ""}
                        />
                        {errors.recurring_end_date && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.recurring_end_date}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>All required fields completed</span>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {appointment ? "Update Appointment" : "Schedule Appointment"}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

AppointmentForm.propTypes = {
  appointment: PropTypes.object,
  patients: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};
