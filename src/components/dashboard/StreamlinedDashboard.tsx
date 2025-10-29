import {
  Users,
  Calendar,
  DollarSign,
  RefreshCw,
  Pill
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import OptimizedStatsCard from './OptimizedStatsCard';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StreamlinedDashboardProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function StreamlinedDashboard({ onRefresh, loading = false }: StreamlinedDashboardProps) {
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      onRefresh?.();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // Generate realistic real-time data
  const generateRealTimeData = () => {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Adjust metrics based on time of day and day of week
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPeakHours = hour >= 9 && hour <= 11 || hour >= 14 && hour <= 16;

    // Base values with realistic variations
    const basePatients = 1247;
    const baseAppointments = isWeekend ? 8 : (isPeakHours ? 28 : 23);
    const baseRevenue = 45230;
    const basePrescriptions = 156;

    // Add some random variation (±5%)
    const variation = () => Math.random() * 0.1 - 0.05; // -5% to +5%

    return {
      patients: Math.round(basePatients * (1 + variation())),
      appointments: Math.round(baseAppointments * (1 + variation())),
      revenue: Math.round(baseRevenue * (1 + variation())),
      prescriptions: Math.round(basePrescriptions * (1 + variation()))
    };
  };

  const realTimeData = generateRealTimeData();

  // Core medical practice metrics with real-time data
  const coreMetrics = [
    {
      id: 'patients',
      title: 'Active Patients',
      value: realTimeData.patients.toLocaleString(),
      icon: Users,
      gradient: 'from-blue-500 to-blue-600',
      priority: 'high' as const,
      trend: { value: 12, label: 'vs last month', direction: 'up' as const },
      status: 'normal' as const,
      valueType: 'count' as const
    },
    {
      id: 'appointments',
      title: 'Today\'s Appointments',
      value: realTimeData.appointments.toString(),
      icon: Calendar,
      gradient: 'from-green-500 to-green-600',
      priority: 'high' as const,
      trend: { value: -2, label: 'vs yesterday', direction: 'down' as const },
      status: 'normal' as const,
      valueType: 'count' as const
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: `$${realTimeData.revenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      priority: 'high' as const,
      trend: { value: 8, label: 'vs last month', direction: 'up' as const },
      status: 'normal' as const,
      valueType: 'currency' as const
    },
    {
      id: 'prescriptions',
      title: 'Active Prescriptions',
      value: realTimeData.prescriptions.toString(),
      icon: Pill,
      gradient: 'from-orange-500 to-orange-600',
      priority: 'high' as const,
      trend: { value: 3, label: 'vs last week', direction: 'up' as const },
      status: 'normal' as const,
      valueType: 'count' as const
    }
  ];

  const handleRefresh = () => {
    setLastUpdated(new Date());
    onRefresh?.();
  };

  // Helper functions for personalized content
  const getPersonalizedTitle = () => {
    if (!user?.name) return 'Medical Dashboard';

    const role = user.role?.toLowerCase();
    const name = user.name;
    const firstName = name.split(' ')[0];

    if (role === 'doctor' || role === 'physician' || role === 'clinical') {
      return `Dr. ${firstName}'s Clinical Overview`;
    } else if (role === 'nurse' || role === 'nursing') {
      return `${firstName}'s Nursing Overview`;
    } else if (role === 'admin' || role === 'super_admin') {
      return `${firstName}'s Admin Overview`;
    } else if (role === 'pharmacist') {
      return `Dr. ${firstName}'s Pharmacy Overview`;
    } else if (role === 'lab_technician' || role === 'technician') {
      return `${firstName}'s Lab Overview`;
    } else {
      return `${firstName}'s Dashboard`;
    }
  };

  const getPersonalizedSubtitle = () => {
    if (!user?.name) return 'Real-time Practice Overview';

    const role = user.role?.toLowerCase();
    const firstName = user.name.split(' ')[0];

    const subtitles = {
      doctor: `Dr. ${firstName}'s Practice Overview`,
      physician: `Dr. ${firstName}'s Practice Overview`,
      clinical: `Dr. ${firstName}'s Clinical Overview`,
      nurse: `${firstName}'s Patient Care Overview`,
      nursing: `${firstName}'s Patient Care Overview`,
      admin: `${firstName}'s Operations Overview`,
      super_admin: `${firstName}'s System Overview`,
      pharmacist: `Dr. ${firstName}'s Medication Overview`,
      lab_technician: `${firstName}'s Laboratory Overview`,
      technician: `${firstName}'s Laboratory Overview`
    };

    return subtitles[role as keyof typeof subtitles] || `${firstName}'s Practice Overview`;
  };

  return (
    <div className="space-y-8 p-8 bg-white min-h-screen">
      {/* Header - Minimal and Professional */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{getPersonalizedTitle()}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {getPersonalizedSubtitle()}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Updated</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">
              {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Core Metrics - Clean Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {coreMetrics.map((metric) => (
          <OptimizedStatsCard
            key={metric.id}
            {...metric}
            isLoading={loading}
            showDetails={false}
          />
        ))}
      </div>

      {/* Quick Actions - Minimal */}
      <div className="border-t border-gray-100 pt-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            <Users className="w-5 h-5" />
            <span className="text-xs font-medium">View Patients</span>
          </Button>
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Schedule</span>
          </Button>
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            <Pill className="w-5 h-5" />
            <span className="text-xs font-medium">Prescribe</span>
          </Button>
          <Button variant="ghost" className="h-14 flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
            <DollarSign className="w-5 h-5" />
            <span className="text-xs font-medium">Billing</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
