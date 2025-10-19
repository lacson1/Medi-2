import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/navigation/AppSidebar';
import CleanTopBar from '@/components/navigation/CleanTopBar';

// Enhanced navigation structure with better organization
const WORKSPACE_SECTIONS = {
    clinical: {
        title: 'Clinical',
        icon: Stethoscope,
        color: 'text-blue-600',
        items: [
            { title: 'Dashboard', url: createPageUrl('Dashboard'), icon: LayoutDashboard, description: 'Overview and analytics' },
            { title: 'Patients', url: createPageUrl('Patients'), icon: Users, description: 'Patient management' },
            { title: 'Appointments', url: createPageUrl('Appointments'), icon: Calendar, description: 'Schedule management' },
            { title: 'Telemedicine', url: createPageUrl('Telemedicine'), icon: Video, description: 'Virtual consultations' },
        ]
    },
    orders: {
        title: 'Orders & Rx',
        icon: Pill,
        color: 'text-green-600',
        items: [
            { title: 'Prescriptions', url: createPageUrl('PrescriptionManagement'), icon: Stethoscope, description: 'Medication management' },
            { title: 'Lab Orders', url: createPageUrl('LabOrders'), icon: TestTube, description: 'Laboratory orders' },
            { title: 'Lab Management', url: createPageUrl('LaboratoryManagement'), icon: Beaker, description: 'Lab results' },
            { title: 'Pharmacy', url: createPageUrl('PharmacyManagement'), icon: Pill, description: 'Pharmacy dispensary' },
        ]
    },
    procedures: {
        title: 'Procedures',
        icon: Activity,
        color: 'text-purple-600',
        items: [
            { title: 'Procedural Reports', url: createPageUrl('ProceduralReports'), icon: ClipboardList, description: 'Procedure documentation' },
            { title: 'Referrals', url: createPageUrl('Referrals'), icon: ArrowUpRightSquare, description: 'Patient referrals' },
        ]
    },
    analytics: {
        title: 'Analytics',
        icon: BarChart3,
        color: 'text-orange-600',
        items: [
            { title: 'Financial Analytics', url: createPageUrl('FinancialAnalytics'), icon: DollarSign, description: 'Financial reports' },
            { title: 'Clinical Performance', url: '/analytics/clinical-performance', icon: TrendingUp, description: 'Clinical metrics' },
            { title: 'Compliance Center', url: '/analytics/compliance', icon: Shield, description: 'Compliance tracking' },
        ]
    },
    administration: {
        title: 'Administration',
        icon: Settings,
        color: 'text-gray-600',
        items: [
            { title: 'Templates', url: createPageUrl('ConsultationTemplates'), icon: FileText, description: 'Document templates' },
            { title: 'Medical Docs', url: createPageUrl('MedicalDocumentTemplates'), icon: FileText, description: 'Medical documents' },
            { title: 'Staff Messaging', url: '/staff-messaging', icon: Bell, description: 'Internal communication' },
            { title: 'System Tester', url: createPageUrl('SystemTester'), icon: Activity, description: 'System testing' },
        ]
    }
};

// Quick access items
const QUICK_ACCESS = [
    { title: 'New Patient', icon: Plus, action: 'new-patient', color: 'bg-blue-500 hover:bg-blue-600' },
    { title: 'New Appointment', icon: Calendar, action: 'new-appointment', color: 'bg-green-500 hover:bg-green-600' },
    { title: 'Quick Prescription', icon: Pill, action: 'quick-prescription', color: 'bg-purple-500 hover:bg-purple-600' },
    { title: 'Lab Order', icon: TestTube, action: 'lab-order', color: 'bg-orange-500 hover:bg-orange-600' },
];

// Recent items (would be populated from user activity)
const RECENT_ITEMS = [
    { title: 'John Doe - Patient Profile', url: '/PatientProfile?id=123', icon: Users, timestamp: '2 min ago' },
    { title: 'Morning Appointments', url: '/Appointments', icon: Calendar, timestamp: '15 min ago' },
    { title: 'Prescription Review', url: '/PrescriptionManagement', icon: Pill, timestamp: '1 hour ago' },
];

// Favorites (would be user-specific)
const FAVORITES = [
    { title: 'Patient Dashboard', url: createPageUrl('Patients'), icon: Users },
    { title: 'Today\'s Appointments', url: createPageUrl('Appointments'), icon: Calendar },
    { title: 'Lab Results', url: createPageUrl('LaboratoryManagement'), icon: Beaker },
];

const AppSidebar = () => {
    const location = useLocation();
    const { collapsed } = useSidebar();
    const { user: currentUser, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('clinical');

    const isAdmin = currentUser?.role === 'admin';
    const isSuperAdmin = currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'admin' && currentUser?.email === 'superadmin@bluequee2.com');

    // Filter navigation items based on search
    const filteredSections = Object.entries(WORKSPACE_SECTIONS).reduce((acc: any, [sectionId, section]) => {
        const filteredItems = section.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredItems.length > 0) {
            acc[sectionId] = { ...section, items: filteredItems };
        }

        return acc;
    }, {});

    const handleQuickAction = (action: any) => {
        // Handle quick actions
        console.log('Quick action:', action);
    };

    return (
        <Sidebar className="border-r border-blue-100 transition-all duration-300 font-['Inter',sans-serif]">
            <SidebarHeader className="border-b border-blue-100 p-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0")}>
                        <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div className={cn("transition-all duration-300", collapsed && "opacity-0 w-0 overflow-hidden")}>
                        <h2 className="font-semibold text-gray-900 text-base whitespace-nowrap">
                            {isSuperAdmin ? "SuperAdmin Panel" : "Bluequee2"}
                        </h2>
                        <p className="text-xs text-gray-500 whitespace-nowrap font-normal">
                            {isSuperAdmin ? "Full System Access" : "Healthcare Management"}
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="p-3">
                {/* Global Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                </div>

                {/* Quick Access */}
                {!collapsed && (
                    <div className="mb-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {QUICK_ACCESS.map((item: any, index: number) => (
                                <Button
                                    key={index}
                                    onClick={() => handleQuickAction(item.action)}
                                    className={`${item.color} text-white h-16 flex flex-col items-center justify-center p-2`}
                                    size="sm"
                                >
                                    <item.icon className="w-4 h-4 mb-1" />
                                    <span className="text-xs font-medium text-center leading-tight">{item.title}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Sections */}
                <ScrollArea className="flex-1">
                    <div className="space-y-6">
                        {Object.entries(filteredSections).map(([sectionId, section]) => (
                            <SidebarGroup key={sectionId}>
                                <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {section.title}
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {section.items.map((item: any) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={location.pathname === item.url}
                                                    className="group"
                                                >
                                                    <Link to={item.url}>
                                                        <item.icon className={cn("w-4 h-4", section.color)} />
                                                        <span className="group-hover:text-gray-900 transition-colors">
                                                            {item.title}
                                                        </span>
                                                        {!collapsed && (
                                                            <span className="text-xs text-gray-500 ml-auto">
                                                                {item.description}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </div>
                </ScrollArea>

                {/* Favorites */}
                {!collapsed && FAVORITES.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Favorites</h3>
                        <SidebarMenu>
                            {FAVORITES.map((item: any) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon className="w-4 h-4 text-yellow-500" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                )}

                {/* Recent Items */}
                {!collapsed && RECENT_ITEMS.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent</h3>
                        <SidebarMenu>
                            {RECENT_ITEMS.slice(0, 3).map((item: any) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon className="w-4 h-4 text-gray-400" />
                                            <div className="flex flex-col">
                                                <span className="text-sm">{item.title}</span>
                                                <span className="text-xs text-gray-500">{item.timestamp}</span>
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                )}
            </SidebarContent>

            {/* User Profile Footer */}
            <SidebarFooter className="border-t border-blue-100 p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                {!collapsed && (
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {currentUser?.full_name || currentUser?.email || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {currentUser?.role || 'User'}
                                        </p>
                                    </div>
                                )}
                                {!collapsed && <MoreHorizontal className="w-4 h-4 text-gray-400" />}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem>
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Help & Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600">
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

// Enhanced Layout Component
export default function EnhancedLayout({ children, currentPageName }: any) {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-gray-50">
                <AppSidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <CleanTopBar />

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-hidden">
                        <div className="h-full">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
