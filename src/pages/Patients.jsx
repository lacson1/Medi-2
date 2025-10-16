
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Removed ToggleGroup, ToggleGroupItem imports as they are no longer used

import PatientCard from "../components/patients/PatientCard";
import PatientListItem from "../components/patients/PatientListItem";
import PatientForm from "../components/patients/PatientForm";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [view, setView] = useState("list"); // Changed default view from "grid" to "list"
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list("-created_date"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Patient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setEditingPatient(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Patient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowForm(false);
      setEditingPatient(null);
    },
  });

  const handleSubmit = (data) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderView = () => {
    const patientList = (
      <AnimatePresence>
        {filteredPatients.map((patient) => 
          view === 'grid' ? (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <PatientCard patient={patient} onEdit={handleEdit} />
            </motion.div>
          ) : (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <PatientListItem patient={patient} onEdit={handleEdit} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    );

    if (isLoading) {
      return <div className="text-center py-12 text-gray-500">Loading patients...</div>;
    }

    if (filteredPatients.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found</p>
        </div>
      );
    }

    if (view === 'grid') {
      return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{patientList}</div>;
    }
    return <div className="space-y-3">{patientList}</div>;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage your patient records</p>
          </div>
          <Button
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Patient
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <PatientForm
              patient={editingPatient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPatient(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          {/* Replaced ToggleGroup with custom buttons for view switching */}
          <div className="flex items-center gap-1 bg-white border p-1 rounded-lg">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {renderView()}

        {/* This check is now handled within renderView() */}
      </div>
    </div>
  );
}
