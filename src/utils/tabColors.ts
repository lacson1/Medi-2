// Tab Color Coding System
// Provides consistent color schemes for different types of tabs across the application

export const TAB_COLOR_SCHEMES = {
    // Medical/Clinical tabs - Blue theme
    MEDICAL: {
        primary: 'bg-blue-50 text-blue-700 border-blue-200',
        active: 'bg-blue-100 text-blue-900 border-blue-300',
        hover: 'hover:bg-blue-50 hover:text-blue-800',
        icon: 'text-blue-600'
    },

    // Patient-related tabs - Green theme
    PATIENT: {
        primary: 'bg-green-50 text-green-700 border-green-200',
        active: 'bg-green-100 text-green-900 border-green-300',
        hover: 'hover:bg-green-50 hover:text-green-800',
        icon: 'text-green-600'
    },

    // Financial/Billing tabs - Purple theme
    FINANCIAL: {
        primary: 'bg-purple-50 text-purple-700 border-purple-200',
        active: 'bg-purple-100 text-purple-900 border-purple-300',
        hover: 'hover:bg-purple-50 hover:text-purple-800',
        icon: 'text-purple-600'
    },

    // Laboratory tabs - Orange theme
    LABORATORY: {
        primary: 'bg-orange-50 text-orange-700 border-orange-200',
        active: 'bg-orange-100 text-orange-900 border-orange-300',
        hover: 'hover:bg-orange-50 hover:text-orange-800',
        icon: 'text-orange-600'
    },

    // Pharmacy/Medication tabs - Teal theme
    PHARMACY: {
        primary: 'bg-teal-50 text-teal-700 border-teal-200',
        active: 'bg-teal-100 text-teal-900 border-teal-300',
        hover: 'hover:bg-teal-50 hover:text-teal-800',
        icon: 'text-teal-600'
    },

    // Administrative tabs - Indigo theme
    ADMIN: {
        primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        active: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        hover: 'hover:bg-indigo-50 hover:text-indigo-800',
        icon: 'text-indigo-600'
    },

    // Analytics/Reports tabs - Emerald theme
    ANALYTICS: {
        primary: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        active: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        hover: 'hover:bg-emerald-50 hover:text-emerald-800',
        icon: 'text-emerald-600'
    },

    // Settings/Configuration tabs - Gray theme
    SETTINGS: {
        primary: 'bg-gray-50 text-gray-700 border-gray-200',
        active: 'bg-gray-100 text-gray-900 border-gray-300',
        hover: 'hover:bg-gray-50 hover:text-gray-800',
        icon: 'text-gray-600'
    },

    // Emergency/Critical tabs - Red theme
    EMERGENCY: {
        primary: 'bg-red-50 text-red-700 border-red-200',
        active: 'bg-red-100 text-red-900 border-red-300',
        hover: 'hover:bg-red-50 hover:text-red-800',
        icon: 'text-red-600'
    },

    // Communication tabs - Pink theme
    COMMUNICATION: {
        primary: 'bg-pink-50 text-pink-700 border-pink-200',
        active: 'bg-pink-100 text-pink-900 border-pink-300',
        hover: 'hover:bg-pink-50 hover:text-pink-800',
        icon: 'text-pink-600'
    }
} as const;

// Tab type mappings for automatic color assignment
export const TAB_TYPE_MAPPINGS = {
    // Medical/Clinical
    'overview': 'MEDICAL',
    'diagnosis': 'MEDICAL',
    'treatment': 'MEDICAL',
    'clinical': 'MEDICAL',
    'encounters': 'MEDICAL',
    'consultation': 'MEDICAL',
    'medical': 'MEDICAL',

    // Patient-related
    'patient': 'PATIENT',
    'patients': 'PATIENT',
    'profile': 'PATIENT',
    'demographics': 'PATIENT',
    'history': 'PATIENT',
    'timeline': 'PATIENT',
    'consents': 'PATIENT',

    // Financial
    'billing': 'FINANCIAL',
    'financial': 'FINANCIAL',
    'payments': 'FINANCIAL',
    'invoices': 'FINANCIAL',
    'revenue': 'FINANCIAL',
    'claims': 'FINANCIAL',

    // Laboratory
    'labs': 'LABORATORY',
    'laboratory': 'LABORATORY',
    'lab': 'LABORATORY',
    'specimens': 'LABORATORY',
    'results': 'LABORATORY',
    'quality': 'LABORATORY',
    'testing': 'LABORATORY',

    // Pharmacy/Medication
    'pharmacy': 'PHARMACY',
    'medications': 'PHARMACY',
    'prescriptions': 'PHARMACY',
    'prescription': 'PHARMACY',
    'drugs': 'PHARMACY',
    'medication': 'PHARMACY',
    'refills': 'PHARMACY',
    'interactions': 'PHARMACY',

    // Administrative
    'admin': 'ADMIN',
    'administrative': 'ADMIN',
    'management': 'ADMIN',
    'users': 'ADMIN',
    'user': 'ADMIN',
    'roles': 'ADMIN',
    'permissions': 'ADMIN',
    'organizations': 'ADMIN',
    'organization': 'ADMIN',

    // Analytics
    'analytics': 'ANALYTICS',
    'reports': 'ANALYTICS',
    'reporting': 'ANALYTICS',
    'metrics': 'ANALYTICS',
    'performance': 'ANALYTICS',
    'trends': 'ANALYTICS',
    'dashboard': 'ANALYTICS',
    'statistics': 'ANALYTICS',

    // Settings
    'settings': 'SETTINGS',
    'configuration': 'SETTINGS',
    'config': 'SETTINGS',
    'preferences': 'SETTINGS',
    'options': 'SETTINGS',

    // Emergency/Critical
    'emergency': 'EMERGENCY',
    'critical': 'EMERGENCY',
    'alerts': 'EMERGENCY',
    'urgent': 'EMERGENCY',
    'monitoring': 'EMERGENCY',

    // Communication
    'communication': 'COMMUNICATION',
    'messaging': 'COMMUNICATION',
    'notifications': 'COMMUNICATION',
    'telemedicine': 'COMMUNICATION',
    'appointments': 'COMMUNICATION',
    'scheduling': 'COMMUNICATION'
} as const;

export type TabColorScheme = keyof typeof TAB_COLOR_SCHEMES;

// Function to get color scheme for a tab
export const getTabColorScheme = (tabValue: string, customScheme: TabColorScheme | null = null): typeof TAB_COLOR_SCHEMES[keyof typeof TAB_COLOR_SCHEMES] => {
    if (customScheme && TAB_COLOR_SCHEMES[customScheme]) {
        return TAB_COLOR_SCHEMES[customScheme];
    }

    // Try to match by tab value
    const lowerTabValue = tabValue.toLowerCase();
    for (const [key, scheme] of Object.entries(TAB_TYPE_MAPPINGS)) {
        if (lowerTabValue.includes(key)) {
            return TAB_COLOR_SCHEMES[scheme];
        }
    }

    // Default to medical theme if no match found
    return TAB_COLOR_SCHEMES.MEDICAL;
};

// Function to get tab classes for styling
export const getTabClasses = (tabValue: string, isActive: boolean = false, customScheme: TabColorScheme | null = null): string => {
    const scheme = getTabColorScheme(tabValue, customScheme);

    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    if (isActive) {
        return `${baseClasses} ${scheme.active} shadow-sm`;
    }

    return `${baseClasses} ${scheme.primary} ${scheme.hover}`;
};

// Function to get icon classes
export const getTabIconClasses = (tabValue: string, customScheme: TabColorScheme | null = null): string => {
    const scheme = getTabColorScheme(tabValue, customScheme);
    return `h-4 w-4 ${scheme.icon}`;
};

// Predefined tab configurations for common page types
export const TAB_CONFIGURATIONS = {
    PATIENT_PROFILE: {
        tabs: [
            { value: 'overview', label: 'Overview', icon: 'Activity', scheme: 'MEDICAL' as TabColorScheme },
            { value: 'appointments', label: 'Appointments', icon: 'Calendar', scheme: 'COMMUNICATION' as TabColorScheme },
            { value: 'prescriptions', label: 'Prescriptions', icon: 'Pill', scheme: 'PHARMACY' as TabColorScheme },
            { value: 'labs', label: 'Labs', icon: 'Beaker', scheme: 'LABORATORY' as TabColorScheme },
            { value: 'consents', label: 'Consents', icon: 'FileSignature', scheme: 'PATIENT' as TabColorScheme },
            { value: 'billing', label: 'Billing', icon: 'DollarSign', scheme: 'FINANCIAL' as TabColorScheme },
            { value: 'documents', label: 'Documents', icon: 'FileText', scheme: 'ADMIN' as TabColorScheme },
            { value: 'timeline', label: 'Timeline', icon: 'Activity', scheme: 'PATIENT' as TabColorScheme }
        ]
    },

    PRESCRIPTION_MANAGEMENT: {
        tabs: [
            { value: 'dashboard', label: 'Dashboard', icon: 'BarChart3', scheme: 'ANALYTICS' as TabColorScheme },
            { value: 'monitoring', label: 'Monitoring', icon: 'Activity', scheme: 'EMERGENCY' as TabColorScheme },
            { value: 'refills', label: 'Refills', icon: 'RefreshCw', scheme: 'PHARMACY' as TabColorScheme },
            { value: 'notifications', label: 'Alerts', icon: 'AlertTriangle', scheme: 'EMERGENCY' as TabColorScheme },
            { value: 'history', label: 'History', icon: 'FileText', scheme: 'ANALYTICS' as TabColorScheme },
            { value: 'analytics', label: 'Analytics', icon: 'BarChart3', scheme: 'ANALYTICS' as TabColorScheme },
            { value: 'database', label: 'Database', icon: 'Database', scheme: 'ADMIN' as TabColorScheme },
            { value: 'settings', label: 'Settings', icon: 'Settings', scheme: 'SETTINGS' as TabColorScheme }
        ]
    },

    BILLING: {
        tabs: [
            { value: 'invoices', label: 'Invoices', icon: 'FileText', scheme: 'FINANCIAL' as TabColorScheme },
            { value: 'payments', label: 'Payments', icon: 'CreditCard', scheme: 'FINANCIAL' as TabColorScheme },
            { value: 'analytics', label: 'Analytics', icon: 'BarChart3', scheme: 'ANALYTICS' as TabColorScheme }
        ]
    },

    LAB_MANAGEMENT: {
        tabs: [
            { value: 'orders', label: 'Orders', icon: 'ClipboardList', scheme: 'LABORATORY' as TabColorScheme },
            { value: 'results', label: 'Results', icon: 'FileText', scheme: 'LABORATORY' as TabColorScheme },
            { value: 'quality', label: 'Quality Control', icon: 'Shield', scheme: 'LABORATORY' as TabColorScheme },
            { value: 'reports', label: 'Reports', icon: 'BarChart3', scheme: 'ANALYTICS' as TabColorScheme }
        ]
    }
} as const;
