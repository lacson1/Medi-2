import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Shield, Activity } from 'lucide-react';
import StreamlinedDashboard from '@/components/dashboard/StreamlinedDashboard';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { user, hasRole, switchToSuperAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());

    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsRefreshing(false);
  };

  const handleSwitchToSuperAdmin = () => {
    switchToSuperAdmin();
  };

  // Helper functions for personalized content
  const getPersonalizedTitle = () => {
    if (!user?.name) return 'Your Dashboard';

    const role = user.role?.toLowerCase();
    const name = user.name;

    // Extract first name for more personal touch
    const firstName = name.split(' ')[0];

    if (role === 'doctor' || role === 'physician' || role === 'clinical') {
      return `Dr. ${firstName}'s Clinical Dashboard`;
    } else if (role === 'nurse' || role === 'nursing') {
      return `${firstName}'s Nursing Dashboard`;
    } else if (role === 'admin' || role === 'super_admin') {
      return `${firstName}'s Admin Dashboard`;
    } else if (role === 'pharmacist') {
      return `Dr. ${firstName}'s Pharmacy Dashboard`;
    } else if (role === 'lab_technician' || role === 'technician') {
      return `${firstName}'s Lab Dashboard`;
    } else {
      return `${firstName}'s Dashboard`;
    }
  };

  const getPersonalizedGreeting = () => {
    if (!user?.name) return 'Welcome back, User! Ready to make a difference today?';

    const role = user.role?.toLowerCase();
    const name = user.name;
    const firstName = name.split(' ')[0];

    const greetings = {
      doctor: `Welcome back, Dr. ${firstName}! Ready to provide excellent care today?`,
      physician: `Welcome back, Dr. ${firstName}! Ready to provide excellent care today?`,
      clinical: `Welcome back, Dr. ${firstName}! Ready to provide excellent care today?`,
      nurse: `Welcome back, ${firstName}! Ready to make a positive impact today?`,
      nursing: `Welcome back, ${firstName}! Ready to make a positive impact today?`,
      admin: `Welcome back, ${firstName}! Ready to manage operations today?`,
      super_admin: `Welcome back, ${firstName}! Ready to oversee the system today?`,
      pharmacist: `Welcome back, Dr. ${firstName}! Ready to ensure medication safety today?`,
      lab_technician: `Welcome back, ${firstName}! Ready to deliver accurate results today?`,
      technician: `Welcome back, ${firstName}! Ready to deliver accurate results today?`
    };

    return greetings[role as keyof typeof greetings] || `Welcome back, ${firstName}! Ready to make a difference today?`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Clean and Professional */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPersonalizedTitle()}
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                {getPersonalizedGreeting()}
                <Badge variant="outline" className="text-xs">
                  {user?.role || 'User'}
                </Badge>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-green-500" />
              <span>Live Data</span>
            </div>

            {/* SuperAdmin Switch Button */}
            {user?.role !== 'SuperAdmin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwitchToSuperAdmin}
                className="flex items-center space-x-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              >
                <Shield className="h-4 w-4" />
                <span>Switch to SuperAdmin</span>
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <StreamlinedDashboard onRefresh={handleRefresh} loading={isRefreshing} />
      </div>
    </div>
  );
}