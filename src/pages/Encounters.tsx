import React, { useState } from "react";
import { mockApiClient } from "@/api/mockApiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence } from "framer-motion";

import EncounterForm from "../components/encounters/EncounterForm";
import EncounterCard from "../components/encounters/EncounterCard";

export default function EncountersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['encounters'],
    queryFn: () => mockApiClient.entities.Encounter.list("-visit_date"),
    initialData: [],
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => mockApiClient.entities.Encounter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      setShowForm(false);
      setEditingNote(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => mockApiClient.entities.Encounter.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounters'] });
      setShowForm(false);
      setEditingNote(null);
    },
  });

  const handleSubmit = (data: any) => {
    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.chief_complaint?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
            <p className="text-gray-600 mt-1">Document patient visits and consultations</p>
          </div>
          <Button
            onClick={() => {
              setEditingNote(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Encounter
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <EncounterForm
              note={editingNote}
              patients={patients}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingNote(null);
              }}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </AnimatePresence>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by patient name or complaint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredNotes.map((note: any) => (
              <EncounterCard
                key={note.id}
                note={note}
                onEdit={(note) => {
                  setEditingNote(note);
                  setShowForm(true);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredNotes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No encounters found</p>
          </div>
        )}
      </div>
    </div>
  );
}