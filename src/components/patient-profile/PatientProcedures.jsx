import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Edit, Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  scheduled: { color: "bg-blue-100 text-blue-800" },
  in_progress: { color: "bg-purple-100 text-purple-800" },
  completed: { color: "bg-green-100 text-green-800" },
  cancelled: { color: "bg-red-100 text-red-800" },
};

const typeColors = {
  diagnostic: "bg-cyan-100 text-cyan-800",
  therapeutic: "bg-green-100 text-green-800",
  preventive: "bg-blue-100 text-blue-800",
  screening: "bg-purple-100 text-purple-800",
};

export default function PatientProcedures({ procedures, isLoading, onEdit }) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  if (!procedures || procedures.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No procedures recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {procedures.map((procedure) => {
        const config = statusConfig[procedure.status] || statusConfig.completed;

        return (
          <Card key={procedure.id} className="border-2 border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-lg">{procedure.procedure_name}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge className={typeColors[procedure.procedure_type]}>
                      {procedure.procedure_type}
                    </Badge>
                    <Badge className={config.color}>
                      {procedure.status}
                    </Badge>
                    {procedure.follow_up_required && (
                      <Badge className="bg-amber-100 text-amber-800">Follow-up Required</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(procedure.procedure_date), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    {procedure.performed_by && (
                      <p className="text-gray-600">Performed by: {procedure.performed_by}</p>
                    )}
                    {procedure.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {procedure.location}
                      </div>
                    )}
                    {procedure.indication && (
                      <p className="text-gray-700"><strong>Indication:</strong> {procedure.indication}</p>
                    )}
                    {procedure.findings && (
                      <p className="text-gray-700"><strong>Findings:</strong> {procedure.findings}</p>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEdit(procedure)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}