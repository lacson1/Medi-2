import React, { useState } from 'react';
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
    Shield
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
import { cn } from '@/lib/utils';

interface CleanTopBarProps {
    onMenuToggle?: () => void;
    className?: string;
}

export default function CleanTopBar({
    onMenuToggle,
    className
}: CleanTopBarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Get current page title
    const getPageTitle = () => {
        const path = location.pathname;
        const segments = path.split('/').filter(Boolean);

        if (segments.length === 0) return 'Dashboard';

        const lastSegment = segments[segments.length - 1];
        if (!lastSegment) return 'Dashboard';

        return lastSegment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Mock notifications count
    const notificationCount = 3;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Implement search functionality
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
        // Implement dark mode toggle
    };

    return (
        <header className={cn(
            "bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50",
            "px-4 py-3 shadow-sm",
            className
        )}>
            <div className="flex items-center justify-between max-w-full">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {/* Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMenuToggle}
                        className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="h-5 w-5 text-gray-600" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 bg-gray-200" />

                    {/* Page Title */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                            {getPageTitle()}
                        </h1>
                        <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                            {user?.role || 'User'}
                        </Badge>
                    </div>
                </div>

                {/* Center Section - Search */}
                <div className="flex-1 max-w-md mx-8">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search patients, appointments, or records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-9 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-300 transition-all"
                        />
                    </form>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDarkMode}
                        className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="h-4 w-4 text-gray-600" />
                        ) : (
                            <Moon className="h-4 w-4 text-gray-600" />
                        )}
                    </Button>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="h-4 w-4 text-gray-600" />
                        {notificationCount > 0 && (
                            <Badge
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0"
                            >
                                {notificationCount}
                            </Badge>
                        )}
                    </Button>

                    {/* Help */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Help & Support"
                    >
                        <HelpCircle className="h-4 w-4 text-gray-600" />
                    </Button>

                    <Separator orientation="vertical" className="h-6 bg-gray-200" />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-9 px-3 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                        {user?.name || user?.email || 'User'}
                                    </span>
                                    <ChevronDown className="h-3 w-3 text-gray-500" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.name || 'User'}
                                    </p>
                                    <p className="text-xs leading-none text-gray-500">
                                        {user?.email || 'user@example.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            {user?.role === 'super_admin' && (
                                <DropdownMenuItem onClick={() => navigate('/super-admin')}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Admin Panel</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}