import { Outlet } from "react-router-dom";
import MedicalDashboardSidebar from "@/components/navigation/MedicalDashboardSidebar";
import EnhancedTopBar from "@/components/navigation/EnhancedTopBar";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { useState } from "react";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <OrganizationProvider>
      <div className="min-h-screen flex w-full bg-gray-50 font-['Inter',sans-serif]">
        <MedicalDashboardSidebar
          isCollapsed={!sidebarOpen}
          onToggle={toggleSidebar}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <EnhancedTopBar
            onMenuToggle={toggleSidebar}
          />

          <div className="flex-1 overflow-auto bg-gray-50/50">
            <Outlet />
          </div>
        </main>
      </div>
    </OrganizationProvider>
  );
}