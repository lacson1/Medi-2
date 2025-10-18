import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Users,
    Calendar,
    Video,
    Pill,
    TestTube,
    Beaker,
    ClipboardList,
    ArrowUpRightSquare,
    DollarSign,
    BarChart3,
    FileText,
    Shield,
    Building2,
    Bell,
    Activity,
    Settings,
    Search,
    Menu,
    X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavigationItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    description: string;
    badge?: string;
    priority: number;
};

type NavigationSection = {
    title: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    items: NavigationItem[];
};

// Optimized Medical Dashboard Navigation Structure
const BASE_MEDICAL_NAVIGATION: Record<string, NavigationSection> = {
    clinical: {
        title: 'Clinical Operations',
        icon: LayoutDashboard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        items: [
            {
                title: 'Dashboard',
                url: createPageUrl('Dashboard'),
                icon: LayoutDashboard,
                description: 'Overview and analytics',
                badge: 'live',
                priority: 1
            },
            {
                title: 'Patients',
                url: createPageUrl('Patients'),
                icon: Users,
                description: 'Patient management',
                badge: '12',
                priority: 2
            },
            {
                title: 'Appointments',
                url: createPageUrl('Appointments'),
                icon: Calendar,
                description: 'Schedule management',
                badge: '5',
                priority: 3
            },
            {
                title: 'Telemedicine',
                url: createPageUrl('Telemedicine'),
                icon: Video,
                description: 'Virtual consultations',
                badge: '2',
                priority: 4
            }
        ]
    },
    orders: {
        title: 'Orders & Prescriptions',
        icon: Pill,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        items: [
            {
                title: 'Prescriptions',
                url: createPageUrl('PrescriptionManagement'),
                icon: Pill,
                description: 'Medication management',
                badge: '8',
                priority: 1
            },
            {
                title: 'Lab Orders',
                url: createPageUrl('LabOrders'),
                icon: TestTube,
                description: 'Laboratory orders',
                badge: '3',
                priority: 2
            },
            {
                title: 'Lab Management',
                url: createPageUrl('LaboratoryManagement'),
                icon: Beaker,
                description: 'Lab results',
                badge: '4',
                priority: 3
            },
            {
                title: 'Pharmacy',
                url: createPageUrl('PharmacyManagement'),
                icon: Pill,
                description: 'Pharmacy dispensary',
                badge: '6',
                priority: 4
            }
        ]
    },
    procedures: {
        title: 'Procedures & Referrals',
        icon: ClipboardList,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        items: [
            {
                title: 'Procedural Reports',
                url: createPageUrl('ProceduralReports'),
                icon: ClipboardList,
                description: 'Procedure documentation',
                badge: '7',
                priority: 1
            },
            {
                title: 'Referrals',
                url: createPageUrl('Referrals'),
                icon: ArrowUpRightSquare,
                description: 'Patient referrals',
                badge: '2',
                priority: 2
            }
        ]
    },
    financial: {
        title: 'Financial & Billing',
        icon: DollarSign,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        items: [
            {
                title: 'Billing',
                url: createPageUrl('Billing'),
                icon: DollarSign,
                description: 'Patient billing',
                badge: 'new',
                priority: 1
            },
            {
                title: 'Financial Analytics',
                url: createPageUrl('FinancialAnalytics'),
                icon: BarChart3,
                description: 'Revenue reports',
                badge: 'live',
                priority: 2
            }
        ]
    },
    documentation: {
        title: 'Documentation',
        icon: FileText,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        items: [
            {
                title: 'Templates',
                url: createPageUrl('ConsultationTemplates'),
                icon: FileText,
                description: 'Document templates',
                badge: '12',
                priority: 1
            },
            {
                title: 'Medical Docs',
                url: createPageUrl('MedicalDocumentTemplates'),
                icon: FileText,
                description: 'Medical documents',
                badge: '8',
                priority: 2
            },
            {
                title: 'Compliance',
                url: '/analytics/compliance',
                icon: Shield,
                description: 'Compliance tracking',
                badge: '3',
                priority: 3
            }
        ]
    },
    administration: {
        title: 'Administration',
        icon: Settings,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        items: [
            {
                title: 'Staff Messaging',
                url: '/staff-messaging',
                icon: Bell,
                description: 'Internal communication',
                badge: '5',
                priority: 1
            },
            {
                title: 'System Tester',
                url: createPageUrl('SystemTester'),
                icon: Activity,
                description: 'System testing',
                badge: '1',
                priority: 2
            }
        ]
    }
};

const SUPER_ADMIN_SECTION: NavigationSection = {
    title: 'System Management',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    items: [
        {
            title: 'Super Admin',
            url: createPageUrl('SuperAdminDashboard'),
            icon: Shield,
            description: 'Full system access and controls',
            priority: 1
        },
        {
            title: 'All Organizations',
            url: createPageUrl('Organizations'),
            icon: Building2,
            description: 'Manage organizations across the network',
            priority: 2
        },
        {
            title: 'All Users',
            url: createPageUrl('UserManagement'),
            icon: Users,
            description: 'Review and manage user accounts',
            priority: 3
        }
    ]
};

// Quick Actions
const QUICK_ACTIONS = [
    {
        id: 'new-patient',
        label: 'New Patient',
        icon: Users,
        color: 'bg-blue-500 hover:bg-blue-600',
        description: 'Register a new patient',
        url: createPageUrl('Patients')
    },
    {
        id: 'new-appointment',
        label: 'Schedule',
        icon: Calendar,
        color: 'bg-green-500 hover:bg-green-600',
        description: 'Book a new appointment',
        url: createPageUrl('Appointments')
    },
    {
        id: 'quick-prescription',
        label: 'Prescribe',
        icon: Pill,
        color: 'bg-purple-500 hover:bg-purple-600',
        description: 'Create new prescription',
        url: createPageUrl('PrescriptionManagement')
    },
    {
        id: 'lab-order',
        label: 'Lab Order',
        icon: TestTube,
        color: 'bg-orange-500 hover:bg-orange-600',
        description: 'Request laboratory test',
        url: createPageUrl('LabOrders')
    }
];

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
    const [expandedSections, setExpandedSections] = useState<string[]>(['clinical', 'orders']);
    const [searchQuery, setSearchQuery] = useState('');
    const isSuperAdmin = user?.role === 'SuperAdmin' || (user?.role === 'admin' && user?.email === 'superadmin@mediflow.com');

    const navigation = useMemo(() => {
        const sections: Record<string, NavigationSection> = {};

        if (isSuperAdmin) {
            sections.systemManagement = {
                ...SUPER_ADMIN_SECTION,
                items: [...SUPER_ADMIN_SECTION.items].sort((a, b) => a.priority - b.priority)
            };
        }

        Object.entries(BASE_MEDICAL_NAVIGATION).forEach(([key, section]) => {
            sections[key] = {
                ...section,
                items: [...section.items].sort((a, b) => a.priority - b.priority)
            };
        });

        return sections;
    }, [isSuperAdmin]);

    useEffect(() => {
        if (isSuperAdmin) {
            setExpandedSections(prev =>
                prev.includes('systemManagement') ? prev : ['systemManagement', ...prev]
            );
        } else {
            setExpandedSections(prev => prev.filter(key => key !== 'systemManagement'));
        }
    }, [isSuperAdmin]);

    const toggleSection = useCallback((sectionKey: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionKey)
                ? prev.filter(key => key !== sectionKey)
                : [...prev, sectionKey]
        );
    }, []);

    const isActive = useCallback((url: string) => {
        return location.pathname === url || location.pathname.startsWith(url + '/');
    }, [location.pathname]);

    const filteredNavigation = useMemo(() => {
        if (!searchQuery) return navigation;

        const filtered: Record<string, NavigationSection> = {};
        Object.entries(navigation).forEach(([key, section]) => {
            const filteredItems = section.items.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredItems.length > 0) {
                filtered[key] = { ...section, items: filteredItems };
            }
        });

        return filtered;
    }, [searchQuery, navigation]);

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
                                <p className="text-xs text-gray-500">Medical Dashboard</p>
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

            {/* Search */}
            {!isCollapsed && (
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {!isCollapsed && (
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {QUICK_ACTIONS.map((action) => (
                            <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                className="h-auto p-2 flex flex-col items-center gap-1 text-xs"
                                onClick={() => window.location.href = action.url}
                                title={action.description}
                            >
                                <div className={`p-1 rounded ${action.color} text-white`}>
                                    <action.icon className="w-3 h-3" />
                                </div>
                                <span className="text-xs">{action.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                    {Object.entries(filteredNavigation).map(([sectionKey, section]) => (
                        <div key={sectionKey} className="space-y-1">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-between p-3 h-auto",
                                    section.color,
                                    expandedSections.includes(sectionKey) && section.bgColor
                                )}
                                onClick={() => toggleSection(sectionKey)}
                            >
                                <div className="flex items-center space-x-3">
                                    <section.icon className="w-5 h-5" />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">{section.title}</span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    expandedSections.includes(sectionKey) ?
                                        <ChevronDown className="w-4 h-4" /> :
                                        <ChevronRight className="w-4 h-4" />
                                )}
                            </Button>

                            {expandedSections.includes(sectionKey) && (
                                <div className="space-y-1 ml-2">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.title}
                                            to={item.url}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-lg text-sm transition-colors",
                                                isActive(item.url)
                                                    ? `${section.bgColor} ${section.color} font-medium`
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <item.icon className="w-4 h-4" />
                                                {!isCollapsed && (
                                                    <span>{item.title}</span>
                                                )}
                                            </div>
                                            {!isCollapsed && item.badge && (
                                                <Badge
                                                    variant={item.badge === 'live' || item.badge === 'new' ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {item.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.first_name || 'Medical Staff'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.role || 'Doctor'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
