import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { mockApiClient } from '@/api/mockApiClient';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  TestTube,
  Pill,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StreamlinedDashboard from '@/components/dashboard/StreamlinedDashboard';
import { cn } from '@/lib/utils';

// Smart data aggregation hook to reduce API calls
const useDashboardData = () => {
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => mockApiClient.entities.Patient.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => mockApiClient.entities.Appointment.list(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: labOrders } = useQuery({
    queryKey: ['labOrders'],
    queryFn: () => mockApiClient.entities.LabOrder.list(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => mockApiClient.entities.Prescription.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Process data efficiently
    const todayAppointments = appointments?.filter(apt =>
      apt.appointment_date?.startsWith(today)
    ) || [];

    const pendingLabOrders = labOrders?.filter(order =>
      order.status === 'pending' || order.status === 'processing'
    ) || [];

    const activePatients = patients?.filter(patient =>
      patient.status === 'active'
    ) || [];

    const recentPrescriptions = prescriptions?.slice(0, 5) || [];

    return {
      stats: {
        totalPatients: activePatients.length,
        todayAppointments: todayAppointments.length,
        pendingLabs: pendingLabOrders.length,
        totalPrescriptions: prescriptions?.length || 0,
      },
      todayAppointments,
      pendingLabOrders,
      recentPrescriptions,
      activePatients: activePatients.slice(0, 5),
    };
  }, [patients, appointments, labOrders, prescriptions]);
};

// Quick Action Component
const QuickActions = () => {
  const actions = [
    { label: 'New Patient', icon: Users, color: 'bg-blue-500', href: '/patients' },
    { label: 'Schedule Appointment', icon: Calendar, color: 'bg-green-500', href: '/appointments' },
    { label: 'Order Lab Test', icon: TestTube, color: 'bg-purple-500', href: '/lab-orders' },
    { label: 'Write Prescription', icon: Pill, color: 'bg-orange-500', href: '/prescriptions' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks for efficient workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
                onClick={() => window.location.href = action.href}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Overview Component
const StatsOverview = ({ stats }) => {
  const statCards = [
    {
      title: 'Active Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      trend: 'up'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3',
      trend: 'up'
    },
    {
      title: 'Pending Lab Orders',
      value: stats.pendingLabs,
      icon: TestTube,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '-2',
      trend: 'down'
    },
    {
      title: 'Total Prescriptions',
      value: stats.totalPrescriptions,
      icon: Pill,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+8%',
      trend: 'up'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`w-3 h-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Today's Schedule Component
const TodaysSchedule = ({ appointments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Today's Schedule
        </CardTitle>
        <CardDescription>
          {appointments.length} appointments scheduled for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled for today</p>
            </div>
          ) : (
            appointments.slice(0, 5).map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">
                      {appointment.patient_name || 'Patient'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.appointment_time || 'Time TBD'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {appointment.status || 'Scheduled'}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
        {appointments.length > 5 && (
          <Button variant="outline" size="sm" className="w-full mt-4">
            View All Appointments
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Pending Tasks Component
const PendingTasks = ({ labOrders }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Pending Tasks
        </CardTitle>
        <CardDescription>
          Items requiring your attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {labOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>All tasks completed!</p>
            </div>
          ) : (
            labOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <TestTube className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">
                      Lab Order #{order.id?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.test_name || 'Lab Test'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {order.status}
                </Badge>
              </motion.div>
            ))
          )}
        </div>
        {labOrders.length > 5 && (
          <Button variant="outline" size="sm" className="w-full mt-4">
            View All Tasks
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { user } = useAuth();
  const dashboardData = useDashboardData();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <StreamlinedDashboard
        onRefresh={handleRefresh}
        loading={loading}
      />
    </div>
  );
}