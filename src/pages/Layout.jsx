
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { 
  LayoutDashboard, 
  Users,
  Stethoscope,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  DollarSign,
  User,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Patients",
    url: createPageUrl("Patients"),
    icon: Users,
  },
  {
    title: "Billing",
    url: createPageUrl("Billing"),
    icon: DollarSign,
  },
  {
    title: "Templates",
    url: createPageUrl("ConsultationTemplates"),
    icon: FileText,
  },
  {
    title: "Medical Docs",
    url: createPageUrl("MedicalDocumentTemplates"),
    icon: FileText,
  },
];

const AppSidebar = () => {
    const location = useLocation();
    const { collapsed } = useSidebar();
    const [currentUser, setCurrentUser] = React.useState(null);

    React.useEffect(() => {
      base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
    }, []);

    const isAdmin = currentUser?.role === 'admin';
    const isSuperAdmin = currentUser?.role === 'admin' && currentUser?.email === 'superadmin@mediflow.com';

    return (
        <Sidebar className="border-r border-blue-100 transition-all duration-300 font-['Inter',sans-serif]" collapsedSize="55px">
          <SidebarHeader className="border-b border-blue-100 p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0")}>
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className={cn("transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>
                <h2 className="font-semibold text-gray-900 text-base whitespace-nowrap">
                  {isSuperAdmin ? "SuperAdmin Panel" : "Clinical Workspace"}
                </h2>
                <p className="text-xs text-gray-500 whitespace-nowrap font-normal">
                  {isSuperAdmin ? "Full System Access" : "Healthcare Management"}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className={cn("text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 transition-all duration-300", collapsed && "opacity-0 w-0 h-0 p-0 overflow-hidden")}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 flex items-center gap-3 px-3 py-3`,
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 font-medium' : '',
                          collapsed && 'justify-center px-0'
                        )}
                      >
                        <Link to={item.url}>
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className={cn("font-normal text-sm transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {(isAdmin || isSuperAdmin) && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className={cn("text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 transition-all duration-300", collapsed && "opacity-0 w-0 h-0 p-0 overflow-hidden")}>
                  {isSuperAdmin ? "System Management" : "Administration"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {isSuperAdmin && (
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className={cn(`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 flex items-center gap-3 px-3 py-3`,
                            location.pathname === createPageUrl("Organizations") ? 'bg-purple-50 text-purple-700 font-medium' : '',
                            collapsed && 'justify-center px-0'
                          )}
                        >
                          <Link to={createPageUrl("Organizations")}>
                            <Stethoscope className="w-5 h-5 flex-shrink-0" />
                            <span className={cn("font-normal text-sm transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>All Organizations</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={cn(`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 flex items-center gap-3 px-3 py-3`,
                          location.pathname === createPageUrl("UserManagement") ? 'bg-blue-50 text-blue-700 font-medium' : '',
                          collapsed && 'justify-center px-0'
                        )}
                      >
                        <Link to={createPageUrl("UserManagement")}>
                          <Users className="w-5 h-5 flex-shrink-0" />
                          <span className={cn("font-normal text-sm transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>{isSuperAdmin ? "All Users" : "Users"}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {!isSuperAdmin && (
                      <SidebarMenuItem>
                        <SidebarMenuButton 
                          asChild 
                          className={cn(`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 flex items-center gap-3 px-3 py-3`,
                            location.pathname === createPageUrl("OrganizationSettings") ? 'bg-blue-50 text-blue-700 font-medium' : '',
                            collapsed && 'justify-center px-0'
                          )}
                        >
                          <Link to={createPageUrl("OrganizationSettings")}>
                            <Stethoscope className="w-5 h-5 flex-shrink-0" />
                            <span className={cn("font-normal text-sm transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>My Organization</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors", collapsed && "justify-center")}>
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                    isSuperAdmin 
                      ? "bg-gradient-to-br from-purple-500 to-pink-600" 
                      : "bg-gradient-to-br from-blue-400 to-cyan-500"
                  )}>
                    <span className="text-white font-semibold text-sm">
                      {isSuperAdmin ? "SA" : currentUser?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className={cn("flex-1 min-w-0 text-left transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>
                    <p className="font-medium text-gray-900 text-sm truncate whitespace-nowrap">
                      {currentUser?.full_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate whitespace-nowrap font-normal">
                      {isSuperAdmin ? "SuperAdmin" : currentUser?.role || "Role"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Profile")} className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => base44.auth.logout()} 
                  className="flex items-center cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
    )
}

export default function Layout({ children, currentPageName }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 font-['Inter',sans-serif]">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-3 sticky top-0 z-10 flex items-center gap-4">
             <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200 -ml-2">
                {({ collapsed }) => collapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
            </SidebarTrigger>
            <h1 className="text-lg font-medium text-gray-900 hidden md:block">{currentPageName}</h1>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
