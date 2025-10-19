import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    Bell,
    Settings,
    User,
    ChevronDown,
    Sun,
    Moon,
    LogOut,
    HelpCircle,
    Shield,
    Activity,
    Clock,
    Users,
    Calendar,
    Wifi,
    WifiOff,
    Stethoscope,
    Pill,
    TestTube,
    FileText,
    Video,
    MessageCircle,
    TrendingUp,
    Building2,
    MapPin,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { cn } from '@/lib/utils';

interface EnhancedTopBarProps {
    onMenuToggle?: () => void;
    className?: string;
}

interface RealTimeData {
    onlineUsers: number;
    activePatients: number;
    pendingAlerts: number;
    systemStatus: 'online' | 'offline' | 'maintenance';
    batteryLevel: number;
    signalStrength: number;
    lastSync: string;
}


export default function EnhancedTopBar({
    onMenuToggle,
    className
}: EnhancedTopBarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { currentOrganization, userOrganizations, switchOrganization } = useOrganization();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [realTimeData, setRealTimeData] = useState<RealTimeData>({
        onlineUsers: 0,
        activePatients: 0,
        pendingAlerts: 0,
        systemStatus: 'online',
        batteryLevel: 100,
        signalStrength: 4,
        lastSync: new Date().toLocaleTimeString()
    });


    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeData(prev => ({
                ...prev,
                onlineUsers: Math.floor(Math.random() * 50) + 20,
                activePatients: Math.floor(Math.random() * 15) + 5,
                pendingAlerts: Math.floor(Math.random() * 8) + 1,
                batteryLevel: Math.max(20, prev.batteryLevel - Math.random() * 2),
                lastSync: new Date().toLocaleTimeString()
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Get current page title with icon
    const getPageInfo = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);

        if (segments.length === 0) return { title: 'Dashboard', icon: Activity };

        const lastSegment = segments[segments.length - 1];
        if (!lastSegment) return { title: 'Dashboard', icon: Activity };

        const title = lastSegment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Map routes to appropriate icons
        const iconMap: Record<string, any> = {
            'Patients': Users,
            'Patient': Stethoscope,
            'Appointments': Calendar,
            'Prescriptions': Pill,
            'Lab Orders': TestTube,
            'Documents': FileText,
            'Telemedicine': Video,
            'Messages': MessageCircle,
            'Analytics': TrendingUp,
            'Settings': Settings,
            'Dashboard': Activity
        };

        return { title, icon: iconMap[title] || Activity };
    };

    const pageInfo = getPageInfo();
    const PageIcon = pageInfo.icon;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('Searching for:', searchQuery);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleOrganizationChange = (org: any) => {
        switchOrganization(org.id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-50';
            case 'offline': return 'text-red-600 bg-red-50';
            case 'maintenance': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getOrganizationIcon = (type: string) => {
        switch (type) {
            case 'hospital': return Building2;
            case 'clinic': return Stethoscope;
            case 'pharmacy': return Pill;
            case 'lab': return TestTube;
            case 'insurance': return Shield;
            default: return Building2;
        }
    };

    const getOrganizationColor = (type: string) => {
        switch (type) {
            case 'hospital': return 'text-blue-600 bg-blue-50';
            case 'clinic': return 'text-green-600 bg-green-50';
            case 'pharmacy': return 'text-purple-600 bg-purple-50';
            case 'lab': return 'text-orange-600 bg-orange-50';
            case 'insurance': return 'text-indigo-600 bg-indigo-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <header className={cn(
            "bg-gradient-to-r from-blue-50/95 to-sky-50/95 backdrop-blur-md border-b border-blue-200/50 sticky top-0 z-50",
            "px-6 py-4 shadow-sm",
            className
        )}>
            <div className="flex items-center justify-between max-w-full">
                {/* Left Section */}
                <div className="flex items-center gap-6">
                    {/* Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuToggle}
                        className="h-10 w-10 p-0 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105"
                        title="Toggle Sidebar"
                    >
                        <Menu className="h-5 w-5 text-blue-700" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-blue-200" />

                    {/* Organization Selector */}
                    {userOrganizations.length > 1 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-10 px-3 hover:bg-blue-100 rounded-xl transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {currentOrganization && (
                                            <>
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                                    getOrganizationColor(currentOrganization.type)
                                                )}>
                                                    {React.createElement(getOrganizationIcon(currentOrganization.type), {
                                                        className: "h-4 w-4"
                                                    })}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {currentOrganization.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {currentOrganization.location}
                                                    </div>
                                                </div>
                                                <ChevronDown className="h-3 w-3 text-gray-500" />
                                            </>
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-80">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-sm font-medium">Select Organization</p>
                                        <p className="text-xs text-gray-500">
                                            Switch between your registered organizations
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userOrganizations.map((org) => (
                                    <DropdownMenuItem
                                        key={org.id}
                                        onClick={() => handleOrganizationChange(org)}
                                        className="gap-3 p-3"
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center",
                                            getOrganizationColor(org.type)
                                        )}>
                                            {React.createElement(getOrganizationIcon(org.type), {
                                                className: "h-4 w-4"
                                            })}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">
                                                {org.name}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {org.location}
                                            </div>
                                        </div>
                                        {currentOrganization?.id === org.id && (
                                            <Check className="h-4 w-4 text-green-600" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Single Organization Display */}
                    {userOrganizations.length === 1 && currentOrganization && (
                        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-xl">
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                getOrganizationColor(currentOrganization.type)
                            )}>
                                {React.createElement(getOrganizationIcon(currentOrganization.type), {
                                    className: "h-4 w-4"
                                })}
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-medium text-gray-700">
                                    {currentOrganization.name}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {currentOrganization.location}
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator orientation="vertical" className="h-8 bg-blue-200" />

                    {/* Page Title with Icon */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                                <PageIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {pageInfo.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                        variant="secondary"
                                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                        {user?.role || 'User'}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn("text-xs px-2 py-1", getStatusColor(realTimeData.systemStatus))}
                                    >
                                        <div className="flex items-center gap-1">
                                            <div className={cn("w-2 h-2 rounded-full",
                                                realTimeData.systemStatus === 'online' ? 'bg-green-500' :
                                                    realTimeData.systemStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                                            )} />
                                            {realTimeData.systemStatus}
                                        </div>
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Section - Enhanced Search */}
                <div className="flex-1 max-w-lg mx-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                        <Input
                            type="text"
                            placeholder="Search patients, appointments, records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-4 h-11 bg-blue-50/50 border-blue-200 focus:bg-white focus:border-blue-400 transition-all rounded-xl"
                        />
                        {searchQuery && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                            >
                                ×
                            </Button>
                        )}
                    </form>
                </div>

                {/* Right Section - Enhanced Controls */}
                <div className="flex items-center gap-3">
                    {/* Real-time Status Indicators */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-100/50 rounded-xl border border-blue-200/50">
                        <div className="flex items-center gap-1" title="Online Users">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{realTimeData.onlineUsers}</span>
                        </div>

                        <Separator orientation="vertical" className="h-4 bg-blue-300" />

                        <div className="flex items-center gap-1" title="Active Patients">
                            <Stethoscope className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">{realTimeData.activePatients}</span>
                        </div>

                        <Separator orientation="vertical" className="h-4 bg-blue-300" />

                        <div className="flex items-center gap-1" title="Last Sync">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-xs text-gray-500">{realTimeData.lastSync}</span>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg transition-colors",
                        isOnline ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )} title={isOnline ? 'Connected' : 'Offline'}>
                        {isOnline ? (
                            <Wifi className="h-4 w-4" />
                        ) : (
                            <WifiOff className="h-4 w-4" />
                        )}
                    </div>

                    {/* Dark Mode Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className="h-10 w-10 p-0 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105"
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="h-4 w-4 text-blue-700" />
                        ) : (
                            <Moon className="h-4 w-4 text-blue-700" />
                        )}
                    </Button>

                    {/* Enhanced Notifications */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105 relative"
                        title={`${realTimeData.pendingAlerts} Pending Alerts`}
                    >
                        <Bell className="h-4 w-4 text-blue-700" />
                        {realTimeData.pendingAlerts > 0 && (
                            <Badge
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0 animate-pulse"
                            >
                                {realTimeData.pendingAlerts}
                            </Badge>
                        )}
                    </Button>

                    {/* Help */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105"
                        title="Help & Support"
                    >
                        <HelpCircle className="h-4 w-4 text-blue-700" />
                    </Button>

                    <Separator orientation="vertical" className="h-8 bg-blue-200" />

                    {/* Enhanced User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-10 px-3 hover:bg-blue-100 rounded-xl transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden sm:block text-left">
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.name || user?.email || 'User'}
                                        </span>
                                        <div className="text-xs text-gray-500">
                                            {user?.role || 'User'}
                                        </div>
                                    </div>
                                    <ChevronDown className="h-3 w-3 text-gray-500" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                                            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">
                                                {user?.name || 'User'}
                                            </p>
                                            <p className="text-xs leading-none text-gray-500 mt-1">
                                                {user?.email || 'user@example.com'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <Badge variant="outline" className="text-xs">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                Online
                                            </div>
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {user?.role || 'User'}
                                        </Badge>
                                    </div>
                                    {currentOrganization && (
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                            <div className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center",
                                                getOrganizationColor(currentOrganization.type)
                                            )}>
                                                {React.createElement(getOrganizationIcon(currentOrganization.type), {
                                                    className: "h-3 w-3"
                                                })}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-700">
                                                    {currentOrganization.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {currentOrganization.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3">
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3">
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            {user?.role === 'super_admin' && (
                                <DropdownMenuItem onClick={() => navigate('/super-admin')} className="gap-3">
                                    <Shield className="h-4 w-4" />
                                    <span>Admin Panel</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 gap-3">
                                <LogOut className="h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}