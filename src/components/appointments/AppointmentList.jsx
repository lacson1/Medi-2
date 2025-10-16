import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Edit, CheckCircle } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-orange-100 text-orange-800 border-orange-200",
};

const typeColors = {
  checkup: "bg-blue-50 text-blue-700",
  follow_up: "bg-purple-50 text-purple-700",
  consultation: "bg-green-50 text-green-700",
  procedure: "bg-orange-50 text-orange-700",
  emergency: "bg-red-50 text-red-700",
};

export default function AppointmentList({ appointments, onEdit, onStatusChange, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No appointments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {appointments.map((apt) => {
          const date = parseISO(apt.appointment_date);
          const dateLabel = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d, yyyy");
          const isOverdue = isPast(date) && apt.status === 'scheduled';

          return (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className={`border-none shadow-lg hover:shadow-xl transition-shadow ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {apt.patient_name?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{apt.patient_name}</h3>
                          <Badge className={`${typeColors[apt.type]} border`}>
                            {apt.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {apt.reason && (
                          <p className="text-gray-600 mb-3">{apt.reason}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {dateLabel}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(date, "h:mm a")} ({apt.duration}min)
                          </div>
                          {apt.provider && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {apt.provider}
                            </div>
                          )}
                        </div>

                        {apt.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">{apt.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={statusColors[apt.status]}>
                            {apt.status.replace('_', ' ')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onStatusChange(apt, "scheduled")}>
                            Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(apt, "confirmed")}>
                            Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(apt, "in_progress")}>
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(apt, "completed")}>
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(apt, "cancelled")}>
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(apt)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}