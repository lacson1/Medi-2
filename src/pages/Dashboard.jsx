import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookUser, Activity } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import StatsCard from "../components/dashboard/StatsCard";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import RecentPatients from "../components/dashboard/RecentPatients";
import RecentBillings from "../components/dashboard/RecentBillings";
import QuickStats from "../components/dashboard/QuickStats";

export default function Dashboard() {
  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list("-created_date"),
    initialData: [],
  });

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list("-appointment_date"),
    initialData: [],
  });

  const { data: encounters, isLoading: loadingEncounters } = useQuery({
    queryKey: ['encounters'],
    queryFn: () => base44.entities.Encounter.list("-visit_date"),
    initialData: [],
  });

  const { data: billings, isLoading: loadingBillings } = useQuery({
    queryKey: ['billings'],
    queryFn: () => base44.entities.Billing.list("-invoice_date"),
    initialData: [],
  });

  const activePatients = patients.filter(p => p.status === 'active').length;
  const todayAppointments = appointments.filter(apt => 
    isToday(parseISO(apt.appointment_date))
  ).length;

  const thisWeekAppointments = appointments.filter(a => {
    const date = parseISO(a.appointment_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= weekFromNow;
  }).length;

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back, Doctor
          </h1>
          <p className="text-sm text-gray-600">Here's your clinical overview for today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStats
            title="Total Patients"
            value={patients.length}
            icon={Users}
            gradient="from-blue-500 to-cyan-600"
            subtitle={`${activePatients} active`}
            trend="up"
            trendValue="+12% this month"
          />
          <QuickStats
            title="Today's Appointments"
            value={todayAppointments}
            icon={Calendar}
            gradient="from-purple-500 to-pink-600"
            subtitle={`${appointments.filter(a => a.status === 'confirmed').length} confirmed`}
            trend="neutral"
            trendValue="On schedule"
          />
          <QuickStats
            title="Clinical Notes"
            value={encounters.length}
            icon={BookUser}
            gradient="from-green-500 to-emerald-600"
            subtitle="Total encounters"
            trend="up"
            trendValue="+8 this week"
          />
          <QuickStats
            title="This Week"
            value={thisWeekAppointments}
            icon={Activity}
            gradient="from-orange-500 to-red-600"
            subtitle="Scheduled visits"
            trend="up"
            trendValue="+3 from last week"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UpcomingAppointments 
              appointments={appointments}
              isLoading={loadingAppointments}
            />
            <RecentBillings 
              billings={billings}
              isLoading={loadingBillings}
            />
          </div>
          
          <div>
            <RecentPatients 
              patients={patients}
              isLoading={loadingPatients}
            />
          </div>
        </div>
      </div>
    </div>
  );
}