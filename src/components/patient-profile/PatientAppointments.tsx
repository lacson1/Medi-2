import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, CheckCircle } from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PropTypes from "prop-types";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function PatientAppointments({ appointments, isLoading, onEdit, onStatusChange }: any) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No appointments scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt: any) => {
        if (!apt.appointment_date || !apt.id) {
          return null;
        }

        const date = parseISO(apt.appointment_date);
        const dateLabel = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d, yyyy");
        const isOverdue = isPast(date) && apt.status === 'scheduled';

        return (
          <div
            key={apt.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${isOverdue
              ? 'border-red-200 bg-red-50/50'
              : 'border-gray-200 bg-white'
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {apt.type?.replace('_', ' ') || apt.type || 'Unknown'}
                  </Badge>
                  {isOverdue && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Overdue
                    </Badge>
                  )}
                </div>

                {apt.reason && (
                  <p className="text-gray-900 font-medium mb-2">{apt.reason}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {dateLabel}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(date, "h:mm a")} ({apt.duration || 'N/A'}min)
                  </div>
                </div>

                {apt.provider && (
                  <p className="text-sm text-gray-500 mt-2">Provider: {apt.provider}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={statusColors[apt.status] || statusColors.scheduled}>
                      {apt.status?.replace('_', ' ') || apt.status || 'Unknown'}
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
          </div>
        );
      })}
    </div>
  );
}

PatientAppointments.propTypes = {
  appointments: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired
};