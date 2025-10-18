
import { useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalizedGreeting } from "@/utils/greeting";
import {
  ChevronsLeft,
  ChevronsRight,
  Download,
  Settings
} from "lucide-react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import MedicalDashboardSidebar from "@/components/navigation/MedicalDashboardSidebar";

const AppSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <MedicalDashboardSidebar
      isCollapsed={isCollapsed}
      onToggle={toggleSidebar}
    />
  );
}

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return getPersonalizedGreeting(user?.first_name);
    if (path.includes('/patients')) return 'Patient Management';
    if (path.includes('/appointments')) return 'Appointments';
    if (path.includes('/lab-orders')) return 'Lab Orders';
    if (path.includes('/prescriptions')) return 'Prescriptions';
    if (path.includes('/billing')) return 'Billing';
    return 'MEDI 2';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-['Inter',sans-serif]">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200 -ml-2">
                {({ collapsed }) => collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
              </SidebarTrigger>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
                {location.pathname === '/dashboard' && (
                  <p className="text-sm text-gray-600">Here&apos;s what&apos;s happening in your practice today</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                title="Export Report"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
