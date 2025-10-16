import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Activity, Edit } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function EncounterCard({ note, onEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                {note.patient_name?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{note.patient_name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(note.visit_date), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onEdit(note)} className="hover:bg-green-50">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge>{note.encounter_type}</Badge>
          {note.chief_complaint && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Chief Complaint</p>
              <p className="text-sm text-gray-900">{note.chief_complaint}</p>
            </div>
          )}
          {note.assessment && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Assessment</p>
              <p className="text-sm text-gray-700 line-clamp-2">{note.assessment}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}