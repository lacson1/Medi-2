import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Edit, CheckCircle, Trash2, AlertTriangle, Video } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import PropTypes from "prop-types";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  no_show: "bg-orange-100 text-orange-800 border-orange-200",
};

const typeColors = {
  checkup: "bg-blue-50 text-blue-700 border-blue-200",
  follow_up: "bg-purple-50 text-purple-700 border-purple-200",
  consultation: "bg-green-50 text-green-700 border-green-200",
  procedure: "bg-orange-50 text-orange-700 border-orange-200",
  emergency: "bg-red-50 text-red-700 border-red-200",
  telemedicine: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'telemedicine':
      return Video;
    case 'emergency':
      return AlertTriangle;
    case 'procedure':
      return CheckCircle;
    default:
      return Calendar;
  }
};

interface AppointmentListProps {
  appointments: any[];
  onEdit: (appointment: any) => void;
  onDelete: (appointment: any) => void;
  onStatusChange: (appointment: any, newStatus: string) => void;
  isLoading: boolean;
}

export default function AppointmentList({ appointments, onEdit, onDelete, onStatusChange, isLoading }: AppointmentListProps) {
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

  const handleStatusChange = (apt: any, newStatus: any) => {
    onStatusChange(apt, newStatus);
    toast.success(`Appointment status updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleDelete = (apt: any) => {
    if (window.confirm(`Are you sure you want to cancel the appointment with ${apt.patient_name}?`)) {
      onDelete(apt.id);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {appointments.map((apt: any) => {
          const date = parseISO(apt.appointment_date);
          const dateLabel = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d, yyyy");
          const isOverdue = isPast(date) && apt.status === 'scheduled';
          const isThisWeekAppt = isThisWeek(date);
          const TypeIcon = getTypeIcon(apt.type);

          return (
            <motion.div
              key={apt.id}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 ${isOverdue ? 'border-l-4 border-l-red-500 bg-red-50/30' :
                isToday(date) ? 'border-l-4 border-l-green-500 bg-green-50/30' :
                  isThisWeekAppt ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-lg">
                        {apt.patient_name?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{apt.patient_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${typeColors[apt.type]} border flex items-center gap-1`}>
                              <TypeIcon className="w-3 h-3" />
                              {apt.type.replace('_', ' ')}
                            </Badge>
                            {apt.priority && apt.priority !== 'normal' && (
                              <Badge className={`${priorityColors[apt.priority]} text-xs`}>
                                {apt.priority.toUpperCase()}
                              </Badge>
                            )}
                            {isOverdue && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                        </div>

                        {apt.reason && (
                          <p className="text-gray-700 mb-3 font-medium">{apt.reason}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{format(date, "h:mm a")}</span>
                            <span className="text-gray-500">({apt.duration}min)</span>
                          </div>
                          {apt.provider && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{apt.provider}</span>
                            </div>
                          )}
                          {apt.type === 'telemedicine' && (
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4 text-indigo-600" />
                              <span className="text-indigo-600 font-medium">Video Call</span>
                            </div>
                          )}
                        </div>

                        {apt.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600 italic">{apt.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={`${statusColors[apt.status]} hover:opacity-80`}>
                            {apt.status.replace('_', ' ')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(apt, "scheduled")}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Scheduled
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(apt, "confirmed")}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(apt, "in_progress")}>
                            <Clock className="w-4 h-4 mr-2" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(apt, "completed")}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(apt, "cancelled")}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(apt)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(apt)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
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

AppointmentList.propTypes = {
  appointments: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired
};