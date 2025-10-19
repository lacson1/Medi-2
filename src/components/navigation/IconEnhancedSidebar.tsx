import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from "@/hooks/useAuth";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Icon,
    IconButton,
    IconBadge,
    IconList,
    IconGrid,
    IconTabs
} from '@/components/icons/IconSystem';
import { cn } from '@/lib/utils';

// Enhanced Navigation with extensive iconography
const ENHANCED_NAVIGATION = {
    clinical: {
        title: 'Clinical',
        icon: 'stethoscope',
        category: 'medical',
        color: 'text-blue-600',
        items: [
            {
                title: 'Dashboard',
                url: createPageUrl('Dashboard'),
                icon: 'dashboard',
                category: 'navigation',
                description: 'Overview and analytics',
                badge: 'live'
            },
            {
                title: 'Patients',
                url: createPageUrl('Patients'),
                icon: 'patients',
                category: 'navigation',
                description: 'Patient management',
                badge: '12'
            },
            {
                title: 'Appointments',
                url: createPageUrl('Appointments'),
                icon: 'appointments',
                category: 'navigation',
                description: 'Schedule management',
                badge: '5'
            },
            {
                title: 'Telemedicine',
                url: createPageUrl('Telemedicine'),
                icon: 'telemedicine',
                category: 'navigation',
                description: 'Virtual consultations',
                badge: '2'
            },
            {
                title: 'Consultations',
                url: createPageUrl('ConsultationManagement'),
                icon: 'consultations',
                category: 'navigation',
                description: 'Specialty consultations',
                badge: '8'
            },
        ]
    },
    orders: {
        title: 'Orders & Rx',
        icon: 'prescriptions',
        category: 'navigation',
        color: 'text-green-600',
        items: [
            {
                title: 'Prescriptions',
                url: createPageUrl('PrescriptionManagement'),
                icon: 'prescriptions',
                category: 'navigation',
                description: 'Medication management',
                badge: '8'
            },
            {
                title: 'Lab Orders',
                url: createPageUrl('LabOrders'),
                icon: 'labOrders',
                category: 'navigation',
                description: 'Laboratory orders',
                badge: '3'
            },
            {
                title: 'Lab Management',
                url: createPageUrl('LaboratoryManagement'),
                icon: 'labOrders',
                category: 'navigation',
                description: 'Lab results',
                badge: '15'
            },
            {
                title: 'Pharmacy',
                url: createPageUrl('PharmacyManagement'),
                icon: 'prescriptions',
                category: 'navigation',
                description: 'Pharmacy dispensary',
                badge: '4'
            },
        ]
    },
    procedures: {
        title: 'Procedures',
        icon: 'procedures',
        category: 'navigation',
        color: 'text-purple-600',
        items: [
            {
                title: 'Procedural Reports',
                url: createPageUrl('ProceduralReports'),
                icon: 'procedures',
                category: 'navigation',
                description: 'Procedure documentation',
                badge: '7'
            },
            {
                title: 'Referrals',
                url: createPageUrl('Referrals'),
                icon: 'referrals',
                category: 'navigation',
                description: 'Patient referrals',
                badge: '2'
            },
        ]
    },
    analytics: {
        title: 'Analytics',
        icon: 'analytics',
        category: 'navigation',
        color: 'text-orange-600',
        items: [
            {
                title: 'Financial Analytics',
                url: createPageUrl('FinancialAnalytics'),
                icon: 'billing',
                category: 'navigation',
                description: 'Financial reports',
                badge: 'new'
            },
            {
                title: 'Clinical Performance',
                url: '/analytics/clinical-performance',
                icon: 'analytics',
                category: 'navigation',
                description: 'Clinical metrics',
                badge: 'live'
            },
            {
                title: 'Compliance Center',
                url: '/analytics/compliance',
                icon: 'shield',
                category: 'medical',
                description: 'Compliance tracking',
                badge: '3'
            },
        ]
    },
    administration: {
        title: 'Administration',
        icon: 'settings',
        category: 'navigation',
        color: 'text-gray-600',
        items: [
            {
                title: 'Templates',
                url: createPageUrl('ConsultationTemplates'),
                icon: 'reports',
                category: 'navigation',
                description: 'Document templates',
                badge: '12'
            },
            {
                title: 'Medical Docs',
                url: createPageUrl('MedicalDocumentTemplates'),
                icon: 'reports',
                category: 'navigation',
                description: 'Medical documents',
                badge: '8'
            },
            {
                title: 'Staff Messaging',
                url: '/staff-messaging',
                icon: 'notifications',
                category: 'navigation',
                description: 'Internal communication',
                badge: '5'
            },
            {
                title: 'System Tester',
                url: createPageUrl('SystemTester'),
                icon: 'procedures',
                category: 'navigation',
                description: 'System testing',
                badge: '1'
            },
        ]
    }
};

// Quick Actions with icons
const QUICK_ACTIONS = [
    {
        id: 'new-patient',
        label: 'New Patient',
        icon: 'userPlus',
        category: 'patient',
        color: 'bg-blue-500 hover:bg-blue-600',
        description: 'Register a new patient'
    },
    {
        id: 'new-appointment',
        label: 'Schedule',
        icon: 'calendarPlus',
        category: 'medical',
        color: 'bg-green-500 hover:bg-green-600',
        description: 'Book a new appointment'
    },
    {
        id: 'prescribe',
        label: 'Prescribe',
        icon: 'prescriptions',
        category: 'navigation',
        color: 'bg-purple-500 hover:bg-purple-600',
        description: 'Create new prescription'
    },
    {
        id: 'lab-order',
        label: 'Lab Order',
        icon: 'labOrders',
        category: 'navigation',
        color: 'bg-orange-500 hover:bg-orange-600',
        description: 'Request laboratory test'
    },
    {
        id: 'telemedicine',
        label: 'Telemedicine',
        icon: 'telemedicine',
        category: 'navigation',
        color: 'bg-cyan-500 hover:bg-cyan-600',
        description: 'Begin virtual consultation'
    },
    {
        id: 'generate-report',
        label: 'Report',
        icon: 'reports',
        category: 'navigation',
        color: 'bg-gray-500 hover:bg-gray-600',
        description: 'Create clinical report'
    }
];

// Recent Items with icons
const RECENT_ITEMS = [
    {
        title: 'John Doe - Patient Profile',
        url: '/PatientProfile?id=123',
        icon: 'user',
        category: 'patient',
        timestamp: '2 min ago',
        status: 'active'
    },
    {
        title: 'Morning Appointments',
        url: '/Appointments',
        icon: 'appointments',
        category: 'navigation',
        timestamp: '15 min ago',
        status: 'pending'
    },
    {
        title: 'Prescription Review',
        url: '/PrescriptionManagement',
        icon: 'prescriptions',
        category: 'navigation',
        timestamp: '1 hour ago',
        status: 'completed'
    },
    {
        title: 'Lab Results - Sarah Wilson',
        url: '/LaboratoryManagement',
        icon: 'labOrders',
        category: 'navigation',
        timestamp: '2 hours ago',
        status: 'ready'
    }
];

// Favorites with icons
const FAVORITES = [
    {
        title: 'Patient Dashboard',
        url: createPageUrl('Patients'),
        icon: 'patients',
        category: 'navigation',
        description: 'Patient management'
    },
    {
        title: 'Today\'s Appointments',
        url: createPageUrl('Appointments'),
        icon: 'appointments',
        category: 'navigation',
        description: 'Schedule overview'
    },
    {
        title: 'Lab Results',
        url: createPageUrl('LaboratoryManagement'),
        icon: 'labOrders',
        category: 'navigation',
        description: 'Laboratory management'
    },
    {
        title: 'Prescription Queue',
        url: createPageUrl('PrescriptionManagement'),
        icon: 'prescriptions',
        category: 'navigation',
        description: 'Medication management'
    }
];

export default function IconEnhancedSidebar() {
    const location = useLocation();
    const { user: currentUser, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const [activeSection, setActiveSection] = useState('clinical');

    const isAdmin = currentUser?.role === 'admin';
    const isSuperAdmin = currentUser?.role === 'SuperAdmin' || (currentUser?.role === 'admin' && currentUser?.email === 'superadmin@bluequee2.com');

    // Filter navigation items based on search
    const filteredSections = Object.entries(ENHANCED_NAVIGATION).reduce((acc: any, [sectionId, section]) => {
        const filteredItems = section.items.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredItems.length > 0) {
            acc[sectionId] = { ...section, items: filteredItems };
        }

        return acc;
    }, {});

    const handleQuickAction = useCallback((action) => {
        console.log('Quick action:', action);
    }, []);

    const getStatusColor = (status: any) => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'completed': return 'default';
            case 'ready': return 'success';
            default: return 'muted';
        }
    };

    return (
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-80'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Icon name="stethoscope" category="medical" size="lg" color="white" />
                    </div>
                    {!collapsed && (
                        <div className="transition-all duration-300">
                            <h2 className="font-semibold text-gray-900 text-base">
                                {isSuperAdmin ? "SuperAdmin Panel" : "Bluequee2"}
                            </h2>
                            <p className="text-xs text-gray-500 font-normal">
                                {isSuperAdmin ? "Full System Access" : "Healthcare Management"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Icon name="search" category="navigation" size="sm" color="muted" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            {!collapsed && (
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
                        <Icon name="zap" category="status" size="xs" color="warning" />
                    </div>
                    <IconGrid items={QUICK_ACTIONS} columns={3} />
                </div>
            )}

            {/* Collapsed Quick Actions */}
            {collapsed && (
                <div className="p-2 border-b border-gray-200">
                    <div className="space-y-2">
                        {QUICK_ACTIONS.slice(0, 4).map((action: any) => (
                            <TooltipProvider key={action.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <IconButton
                                            icon={action.icon}
                                            category={action.category}
                                            onClick={() => handleQuickAction(action.id)}
                                            className="w-full justify-center"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{action.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Sections */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {Object.entries(filteredSections).map(([sectionId, section]) => (
                        <div key={sectionId}>
                            {!collapsed && (
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon name={section.icon} category={section.category} size="sm" color="primary" />
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {section.title}
                                    </h3>
                                </div>
                            )}

                            <div className="space-y-1">
                                {section.items.map((item: any) => (
                                    <TooltipProvider key={item.title}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Link to={item.url}>
                                                    <div className={cn(
                                                        "flex items-center gap-3 p-2 rounded-lg transition-colors group",
                                                        location.pathname === item.url
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                                                    )}>
                                                        <Icon
                                                            name={item.icon}
                                                            category={item.category}
                                                            size="sm"
                                                            color={location.pathname === item.url ? 'primary' : 'secondary'}
                                                        />

                                                        {!collapsed && (
                                                            <>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium truncate">
                                                                            {item.title}
                                                                        </span>
                                                                        {item.badge && (
                                                                            <IconBadge
                                                                                icon="checkCircle"
                                                                                category="status"
                                                                                size="xs"
                                                                                variant={item.badge === 'live' ? 'success' : 'default'}
                                                                                className="text-xs"
                                                                            >
                                                                                {item.badge}
                                                                            </IconBadge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 truncate">
                                                                        {item.description}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </Link>
                                            </TooltipTrigger>
                                            {collapsed && (
                                                <TooltipContent side="right">
                                                    <div>
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Favorites */}
            {!collapsed && FAVORITES.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="star" category="status" size="sm" color="warning" />
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Favorites</h3>
                    </div>
                    <IconList items={"FAVORITES"} />
                </div>
            )}

            {/* Recent Items */}
            {!collapsed && RECENT_ITEMS.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="clock" category="medical" size="sm" color="secondary" />
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</h3>
                    </div>
                    <div className="space-y-2">
                        {RECENT_ITEMS.slice(0, 3).map((item: any) => (
                            <div key={item.title} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <Icon name={item.icon} category={item.category} size="sm" color="secondary" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium truncate">{item.title}</span>
                                        <IconBadge
                                            icon="checkCircle"
                                            category="status"
                                            size="xs"
                                            variant={getStatusColor(item.status)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Profile Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                        <Icon name="user" category="patient" size="sm" color="white" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {currentUser?.full_name || currentUser?.email || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {currentUser?.role || 'User'}
                            </p>
                        </div>
                    )}
                    <IconButton
                        icon="more"
                        category="navigation"
                        size="sm"
                        onClick={() => {/* Handle user menu */ }}
                    />
                </div>
            </div>

            {/* Collapse Toggle */}
            <div className="p-2 border-t border-gray-200">
                <IconButton
                    icon={collapsed ? "maximize" : "minimize"}
                    category="status"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full justify-center"
                />
            </div>
        </div>
    );
}
