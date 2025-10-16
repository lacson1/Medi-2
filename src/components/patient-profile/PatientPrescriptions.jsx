import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Edit, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  discontinued: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function PatientPrescriptions({ prescriptions, isLoading, onEdit, onStatusChange }) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }
  if (prescriptions.length === 0) {
    return <div className="text-center py-12"><Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">No prescriptions on record</p></div>;
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <div key={rx.id} className="p-4 rounded-lg border-2 border-gray-200 bg-white hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-lg">{rx.medication_name}</h4>
                <Badge className={statusColors[rx.status]}>{rx.status}</Badge>
              </div>
              <p className="text-gray-600 mt-1">{rx.dosage} • {rx.frequency}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(rx.start_date), "MMM d, yyyy")}</span>
                {rx.end_date && <><span>-</span><span>{format(parseISO(rx.end_date), "MMM d, yyyy")}</span></>}
              </div>
              {rx.notes && <p className="text-sm italic text-gray-500 mt-2">{rx.notes}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(rx)}><Edit className="w-4 h-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}