import { useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Pill,
    TestTube,
    Beaker,
    DollarSign,
    BarChart3,
    Menu,
    X,
    Shield,
    Building2,
    Activity,
    Settings,
    MessageSquare,
    Sparkles,
    Monitor
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavigationItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

type NavigationSection = {
    title: string;
    items: NavigationItem[];
};

// Minimal Essential Navigation - Clean & Functional
const MINIMAL_NAVIGATION: NavigationSection[] = [
    {
        title: 'Core Medical',
        items: [
            {
                title: 'Dashboard',
                url: createPageUrl('Dashboard'),
                icon: LayoutDashboard
            },
            {
                title: 'Patients',
                url: createPageUrl('Patients'),
                icon: Users
            },
            {
                title: 'Appointments',
                url: createPageUrl('Appointments'),
                icon: Calendar
            },
            {
                title: 'Consultations',
                url: createPageUrl('ConsultationManagement'),
                icon: MessageSquare
            },
            {
                title: 'Prescriptions',
                url: createPageUrl('PrescriptionManagement'),
                icon: Pill
            },
            {
                title: 'Enhanced Forms',
                url: '/autocomplete-demo',
                icon: Sparkles
            },
            {
                title: 'Dialog Testing',
                url: '/dialog-alert-test',
                icon: Monitor
            }
        ]
    },
    {
        title: 'Orders & Labs',
        items: [
            {
                title: 'Lab Orders',
                url: createPageUrl('LabOrders'),
                icon: TestTube
            },
            {
                title: 'Lab Management',
                url: createPageUrl('LaboratoryManagement'),
                icon: Beaker
            }
        ]
    },
    {
        title: 'Financial',
        items: [
            {
                title: 'Billing',
                url: createPageUrl('Billing'),
                icon: DollarSign
            },
            {
                title: 'Financial Analytics',
                url: createPageUrl('FinancialAnalytics'),
                icon: BarChart3
            }
        ]
    }
];

// SuperAdmin Navigation - System Administration & Testing
const SUPERADMIN_NAVIGATION: NavigationSection = {
    title: 'System Administration',
    items: [
        {
            title: 'User Management',
            url: createPageUrl('UserManagement'),
            icon: Users
        },
        {
            title: 'Organizations',
            url: createPageUrl('Organizations'),
            icon: Building2
        },
        {
            title: 'System Tester',
            url: createPageUrl('SystemTester'),
            icon: Activity
        },
        {
            title: 'Settings',
            url: createPageUrl('Settings'),
            icon: Settings
        }
    ]
};

interface MedicalDashboardSidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function MedicalDashboardSidebar({
    isCollapsed = false,
    onToggle
}: MedicalDashboardSidebarProps) {
    const location = useLocation();
    const { user } = useAuth();

    // Check if user is SuperAdmin
    const isSuperAdmin = user?.role === 'SuperAdmin' ||
        user?.role === 'admin' ||
        (user?.role === 'admin' && user?.email === 'superadmin@mediflow.com');

    // Helper function for personalized greeting
    const getPersonalizedGreeting = () => {
        if (!user?.name) return 'Your Medical Hub';

        const role = user.role?.toLowerCase();
        const firstName = user.name.split(' ')[0];

        if (role === 'doctor' || role === 'physician' || role === 'clinical') {
            return `Dr. ${firstName}'s Hub`;
        } else if (role === 'nurse' || role === 'nursing') {
            return `${firstName}'s Care Hub`;
        } else if (role === 'admin' || role === 'super_admin') {
            return `${firstName}'s Admin Hub`;
        } else if (role === 'pharmacist') {
            return `Dr. ${firstName}'s Pharmacy Hub`;
        } else if (role === 'lab_technician' || role === 'technician') {
            return `${firstName}'s Lab Hub`;
        } else {
            return `${firstName}'s Medical Hub`;
        }
    };

    const isActive = useCallback((url: string) => {
        return location.pathname === url || location.pathname.startsWith(url + '/');
    }, [location.pathname]);

    // Build navigation sections based on user role
    const navigationSections = useMemo(() => {
        const sections = [...MINIMAL_NAVIGATION];

        // Add SuperAdmin section if user is SuperAdmin
        if (isSuperAdmin) {
            sections.push(SUPERADMIN_NAVIGATION);
        }

        return sections;
    }, [isSuperAdmin]);

    return (
        <div className={cn(
            "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">MedFlow</h2>
                                <p className="text-xs text-gray-500">{getPersonalizedGreeting()}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className="p-2"
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    {navigationSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-2">
                            {!isCollapsed && (
                                <h3 className={cn(
                                    "text-xs font-semibold uppercase tracking-wider",
                                    section.title === 'System Administration'
                                        ? "text-purple-500"
                                        : "text-gray-500"
                                )}>
                                    {section.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.title}
                                        to={item.url}
                                        className={cn(
                                            "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                            isActive(item.url)
                                                ? section.title === 'System Administration'
                                                    ? "bg-purple-50 text-purple-700 font-medium"
                                                    : "bg-blue-50 text-blue-700 font-medium"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {!isCollapsed && (
                                            <span>{item.title}</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isSuperAdmin
                            ? "bg-purple-100"
                            : "bg-gray-300"
                    )}>
                        {isSuperAdmin ? (
                            <Shield className="w-4 h-4 text-purple-600" />
                        ) : (
                            <Users className="w-4 h-4 text-gray-600" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.first_name || 'Medical Staff'}
                            </p>
                            <p className={cn(
                                "text-xs truncate",
                                isSuperAdmin
                                    ? "text-purple-600 font-medium"
                                    : "text-gray-500"
                            )}>
                                {isSuperAdmin ? 'SuperAdmin' : (user?.role || 'Doctor')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}