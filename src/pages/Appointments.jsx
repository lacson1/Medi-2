import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentList from "../components/appointments/AppointmentList";

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list("-appointment_date"),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setEditingAppointment(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowForm(false);
      setEditingAppointment(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const filteredAppointments = statusFilter === "all" 
    ? appointments 
    : appointments.filter(apt => apt.status === statusFilter);

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">Schedule and manage patient appointments</p>
          </div>
          <Button
            onClick={() => {
              setEditingAppointment(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Schedule Appointment
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <AppointmentForm
              appointment={editingAppointment}
              patients={patients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAppointment(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        <div className="mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AppointmentList
          appointments={filteredAppointments}
          onEdit={handleEdit}
          onStatusChange={(apt, status) => updateMutation.mutate({ id: apt.id, data: { ...apt, status } })}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}