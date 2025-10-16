import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function UpcomingAppointments({ appointments, isLoading }) {
  const upcomingAppointments = appointments
    .filter(apt => {
      const date = parseISO(apt.appointment_date);
      return date >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
    })
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
          <Link to={createPageUrl("Appointments")}>
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
              View All
            </Badge>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {upcomingAppointments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No upcoming appointments</p>
        ) : (
          upcomingAppointments.map((apt) => {
            const date = parseISO(apt.appointment_date);
            const dateLabel = isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d");

            return (
              <div
                key={apt.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                    {apt.patient_name?.charAt(0) || "P"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{apt.patient_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{apt.reason || apt.type}</p>
                    </div>
                    <Badge className={statusColors[apt.status]}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateLabel}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(date, "h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}