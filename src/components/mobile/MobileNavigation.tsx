import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    Users,
    Calendar,
    FileText,
    Settings,
    Bell,
    Search,
    Menu,
    X
} from 'lucide-react';

interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    badge?: number;
    color?: string;
}

interface MobileNavigationProps {
    className?: string;
    showLabels?: boolean;
    compact?: boolean;
}

const navigationItems: NavigationItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        path: '/dashboard',
        color: 'text-blue-600'
    },
    {
        id: 'patients',
        label: 'Patients',
        icon: Users,
        path: '/patients',
        badge: 3,
        color: 'text-green-600'
    },
    {
        id: 'appointments',
        label: 'Appointments',
        icon: Calendar,
        path: '/appointments',
        badge: 1,
        color: 'text-purple-600'
    },
    {
        id: 'prescriptions',
        label: 'Prescriptions',
        icon: FileText,
        path: '/prescriptions',
        color: 'text-orange-600'
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        path: '/notifications',
        badge: 5,
        color: 'text-red-600'
    }
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
    className = '',
    showLabels = true,
    compact = false
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Auto-hide navigation on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <nav
            className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-background/95 backdrop-blur-sm
                border-t border-border
                safe-area-bottom
                transition-transform duration-300 ease-in-out
                ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                ${className}
            `}
        >
            <div className="flex items-center justify-around px-2 py-1">
                {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavigation(item.path)}
                            className={`
                                relative flex flex-col items-center justify-center
                                min-h-touch min-w-touch
                                p-2 rounded-lg
                                transition-all duration-200 ease-in-out
                                touch-target
                                ${active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }
                                ${compact ? 'px-1 py-1' : 'px-2 py-2'}
                            `}
                            aria-label={item.label}
                        >
                            <div className="relative">
                                <IconComponent
                                    className={`
                                        w-5 h-5 transition-colors duration-200
                                        ${active ? item.color : ''}
                                    `}
                                />
                                {item.badge && item.badge > 0 && (
                                    <span className="
                                        absolute -top-1 -right-1
                                        bg-red-500 text-white text-xs
                                        rounded-full min-w-[18px] h-[18px]
                                        flex items-center justify-center
                                        font-medium
                                    ">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>

                            {showLabels && !compact && (
                                <span className={`
                                    text-xs font-medium mt-1
                                    transition-colors duration-200
                                    ${active ? 'text-primary' : 'text-muted-foreground'}
                                `}>
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// Mobile Header Component
interface MobileHeaderProps {
    title: string;
    showSearch?: boolean;
    showMenu?: boolean;
    onSearchClick?: () => void;
    onMenuClick?: () => void;
    className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
    title,
    showSearch = false,
    showMenu = false,
    onSearchClick,
    onMenuClick,
    className = ''
}) => {
    return (
        <header className={`
            sticky top-0 z-40
            bg-background/95 backdrop-blur-sm
            border-b border-border
            safe-area-top
            ${className}
        `}>
            <div className="flex items-center justify-between px-4 py-3 min-h-touch">
                <div className="flex items-center space-x-3">
                    {showMenu && (
                        <button
                            onClick={onMenuClick}
                            className="touch-target p-2 rounded-lg hover:bg-muted/50"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}

                    <h1 className="text-lg font-semibold text-foreground truncate">
                        {title}
                    </h1>
                </div>

                {showSearch && (
                    <button
                        onClick={onSearchClick}
                        className="touch-target p-2 rounded-lg hover:bg-muted/50"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5 text-muted-foreground" />
                    </button>
                )}
            </div>
        </header>
    );
};

// Mobile Search Bar Component
interface MobileSearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    className?: string;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
    placeholder = 'Search...',
    value,
    onChange,
    onFocus,
    onBlur,
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
            </div>

            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                className="
                    w-full pl-10 pr-4 py-3
                    bg-background border border-border rounded-lg
                    text-foreground placeholder-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    mobile-input
                "
            />
        </div>
    );
};

// Mobile Action Sheet Component
interface ActionSheetItem {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    destructive?: boolean;
    onClick: () => void;
}

interface MobileActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    items: ActionSheetItem[];
    className?: string;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
    isOpen,
    onClose,
    title,
    items,
    className = ''
}) => {
    if (!isOpen) return null;

    const handleItemClick = (item: ActionSheetItem) => {
        item.onClick();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* Action Sheet */}
            <div className={`
                fixed bottom-0 left-0 right-0 z-50
                bg-background rounded-t-xl
                safe-area-bottom
                transform transition-transform duration-300 ease-out
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}
                ${className}
            `}>
                {title && (
                    <div className="px-4 py-3 border-b border-border">
                        <h3 className="text-lg font-semibold text-foreground text-center">
                            {title}
                        </h3>
                    </div>
                )}

                <div className="py-2">
                    {items.map((item) => {
                        const IconComponent = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`
                                    w-full flex items-center px-4 py-3
                                    text-left transition-colors duration-200
                                    touch-target
                                    ${item.destructive
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-foreground hover:bg-muted/50'
                                    }
                                `}
                            >
                                {IconComponent && (
                                    <IconComponent className="w-5 h-5 mr-3" />
                                )}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="px-4 py-2 border-t border-border">
                    <button
                        onClick={onClose}
                        className="
                            w-full py-3 px-4
                            bg-muted text-muted-foreground
                            rounded-lg font-medium
                            touch-target
                            hover:bg-muted/80
                        "
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default MobileNavigation;
