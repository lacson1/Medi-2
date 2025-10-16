import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientEncounters({ notes, isLoading, onEdit }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No encounters recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="p-5 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {format(parseISO(note.visit_date), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <Badge className="mt-2">{note.encounter_type}</Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(note)}><Edit className="w-4 h-4" /></Button>
          </div>

          {note.chief_complaint && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 mb-1">Chief Complaint</p>
              <p className="text-gray-900 font-medium">{note.chief_complaint}</p>
            </div>
          )}
          
          <div className="space-y-3 text-sm">
            {note.assessment && <p><span className="font-semibold">Assessment:</span> {note.assessment}</p>}
            {note.plan && <p><span className="font-semibold">Plan:</span> {note.plan}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}