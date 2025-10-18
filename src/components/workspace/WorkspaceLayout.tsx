import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Maximize2,
    Minimize2,
    Grid3X3,
    List,
    Columns,
    Layout,
    Settings,
    Save,
    RotateCcw,
    Eye,
    EyeOff,
    Filter,
    Search,
    Star,
    Clock,
    Bookmark,
    Zap,
    Target,
    TrendingUp,
    Activity,
    Users,
    Calendar,
    Pill,
    Beaker,
    FileText,
    DollarSign,
    Stethoscope,
    HeartPulse,
    AlertTriangle,
    CheckCircle,
    XCircle,
    PauseCircle,
    PlayCircle,
    RefreshCw,
    Plus,
    Edit,
    Trash2,
    Copy,
    Share2,
    Download,
    Upload,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Workspace Configuration Types
const WORKSPACE_MODES = {
    default: {
        name: 'Default',
        description: 'Standard workspace layout',
        icon: Layout,
        sidebarWidth: 280,
        contentPadding: 24,
        showQuickActions: true,
        showRecentItems: true,
        showFavorites: true
    },
    compact: {
        name: 'Compact',
        description: 'Minimal space usage',
        icon: Columns,
        sidebarWidth: 200,
        contentPadding: 16,
        showQuickActions: false,
        showRecentItems: false,
        showFavorites: true
    },
    fullscreen: {
        name: 'Fullscreen',
        description: 'Maximum content area',
        icon: Maximize2,
        sidebarWidth: 0,
        contentPadding: 12,
        showQuickActions: false,
        showRecentItems: false,
        showFavorites: false
    },
    clinical: {
        name: 'Clinical',
        description: 'Optimized for clinical workflows',
        icon: Stethoscope,
        sidebarWidth: 320,
        contentPadding: 20,
        showQuickActions: true,
        showRecentItems: true,
        showFavorites: true
    },
    administrative: {
        name: 'Administrative',
        description: 'Focused on management tasks',
        icon: Users,
        sidebarWidth: 300,
        contentPadding: 24,
        showQuickActions: true,
        showRecentItems: true,
        showFavorites: true
    }
};

// Workspace Layout Component
export const WorkspaceLayout = ({
    children,
    mode = 'default',
    onModeChange,
    className = '',
    ...props
}) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const modeConfig = WORKSPACE_MODES[currentMode];

    const handleModeChange = useCallback((newMode) => {
        setCurrentMode(newMode);
        onModeChange?.(newMode);
    }, [onModeChange]);

    return (
        <div className={cn("workspace-layout", className)} {...props}>
            <div
                className="flex h-full transition-all duration-300"
                style={{
                    '--sidebar-width': sidebarCollapsed ? '60px' : `${modeConfig.sidebarWidth}px`,
                    '--content-padding': `${modeConfig.contentPadding}px`
                }}
            >
                {/* Sidebar */}
                {modeConfig.sidebarWidth > 0 && (
                    <motion.div
                        initial={false}
                        animate={{ width: sidebarCollapsed ? 60 : modeConfig.sidebarWidth }}
                        className="bg-white border-r border-gray-200 flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className={cn("transition-all duration-300", sidebarCollapsed && "opacity-0 w-0 overflow-hidden")}>
                                    <h2 className="font-semibold text-gray-900">Workspace</h2>
                                    <p className="text-xs text-gray-500">{modeConfig.description}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                >
                                    {sidebarCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4">
                                {/* Mode Selector */}
                                {!sidebarCollapsed && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Layout Mode</h3>
                                        <Select value={currentMode} onValueChange={handleModeChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(WORKSPACE_MODES).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        <div className="flex items-center space-x-2">
                                                            <config.icon className="w-4 h-4" />
                                                            <span>{config.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                {modeConfig.showQuickActions && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" className="h-16 flex flex-col">
                                                <Plus className="w-4 h-4 mb-1" />
                                                {!sidebarCollapsed && <span className="text-xs">New</span>}
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-16 flex flex-col">
                                                <Search className="w-4 h-4 mb-1" />
                                                {!sidebarCollapsed && <span className="text-xs">Search</span>}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Items */}
                                {modeConfig.showRecentItems && !sidebarCollapsed && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <Users className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">Patient List</span>
                                                <Clock className="w-3 h-3 text-gray-400 ml-auto" />
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <Calendar className="w-4 h-4 text-green-500" />
                                                <span className="text-sm">Appointments</span>
                                                <Clock className="w-3 h-3 text-gray-400 ml-auto" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Favorites */}
                                {modeConfig.showFavorites && !sidebarCollapsed && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Favorites</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-sm">Dashboard</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-sm">Patients</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Settings */}
                        <div className="p-4 border-t border-gray-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full justify-start"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                {!sidebarCollapsed && <span>Settings</span>}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Bar */}
                    <div className="bg-white border-b border-gray-200 px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-lg font-semibold text-gray-900">Workspace</h1>
                                <Badge variant="outline">{modeConfig.name}</Badge>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div
                        className="flex-1 overflow-auto"
                        style={{ padding: modeConfig.contentPadding }}
                    >
                        {children}
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Workspace Settings</h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                                    <XCircle className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Layout Preferences */}
                                <div>
                                    <h4 className="font-medium mb-3">Layout Preferences</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Show Quick Actions</span>
                                            <Button variant="outline" size="sm">
                                                {modeConfig.showQuickActions ? 'On' : 'Off'}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Show Recent Items</span>
                                            <Button variant="outline" size="sm">
                                                {modeConfig.showRecentItems ? 'On' : 'Off'}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Show Favorites</span>
                                            <Button variant="outline" size="sm">
                                                {modeConfig.showFavorites ? 'On' : 'Off'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Workspace Modes */}
                                <div>
                                    <h4 className="font-medium mb-3">Workspace Modes</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(WORKSPACE_MODES).map(([key, config]) => (
                                            <Button
                                                key={key}
                                                variant={currentMode === key ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleModeChange(key)}
                                                className="flex flex-col h-16"
                                            >
                                                <config.icon className="w-4 h-4 mb-1" />
                                                <span className="text-xs">{config.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button className="w-full">
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Settings
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reset to Default
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Workspace Grid Component
export const WorkspaceGrid = ({
    items = [],
    columns = 3,
    gap = 4,
    className = '',
    ...props
}) => {
    return (
        <div
            className={cn("grid", `grid-cols-${columns}`, `gap-${gap}`, className)}
            {...props}
        >
            {items.map((item: any, index: number) => (
                <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="workspace-grid-item"
                >
                    {item.content}
                </motion.div>
            ))}
        </div>
    );
};

// Workspace Panel Component
export const WorkspacePanel = ({
    title,
    icon,
    children,
    actions = [],
    className = '',
    ...props
}) => {
    return (
        <Card className={cn("workspace-panel", className)} {...props}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {icon && <icon className="w-5 h-5 text-blue-600" />}
                        <CardTitle className="text-base">{title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                        {actions.map((action, index) => (
                            <Button key={index} variant="ghost" size="sm" onClick={action.onClick}>
                                <action.icon className="w-4 h-4" />
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};

// Workspace Metrics Component
export const WorkspaceMetrics = ({
    metrics = [],
    layout = 'grid', // grid, list, compact
    className = '',
    ...props
}) => {
    const getLayoutClasses = () => {
        switch (layout) {
            case 'list':
                return 'space-y-4';
            case 'compact':
                return 'grid grid-cols-2 md:grid-cols-4 gap-2';
            default:
                return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4';
        }
    };

    return (
        <div className={cn(getLayoutClasses(), className)} {...props}>
            {metrics.map((metric, index) => (
                <motion.div
                    key={metric.id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <Card className={cn("metric-card", layout === 'compact' && "p-3")}>
                        <CardContent className={cn("p-6", layout === 'compact' && "p-3")}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={cn("text-sm font-medium text-gray-600", layout === 'compact' && "text-xs")}>
                                        {metric.label}
                                    </p>
                                    <p className={cn("text-2xl font-bold text-gray-900", layout === 'compact' && "text-lg")}>
                                        {metric.value}
                                    </p>
                                    {metric.change && (
                                        <div className={cn("flex items-center text-sm mt-1",
                                            metric.change > 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            <TrendingUp className={cn("w-4 h-4 mr-1", metric.change < 0 && "rotate-180")} />
                                            <span>{Math.abs(metric.change)}%</span>
                                        </div>
                                    )}
                                </div>
                                {metric.icon && (
                                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center",
                                        metric.color || "bg-blue-100"
                                    )}>
                                        <metric.icon className={cn("w-6 h-6", metric.iconColor || "text-blue-600")} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};

// Workspace Quick Actions Component
export const WorkspaceQuickActions = ({
    actions = [],
    layout = 'grid', // grid, horizontal, compact
    className = '',
    ...props
}) => {
    const getLayoutClasses = () => {
        switch (layout) {
            case 'horizontal':
                return 'flex space-x-2 overflow-x-auto';
            case 'compact':
                return 'grid grid-cols-3 gap-2';
            default:
                return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4';
        }
    };

    return (
        <div className={cn(getLayoutClasses(), className)} {...props}>
            {actions.map((action, index) => (
                <motion.div
                    key={action.id || index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={action.onClick}
                        className={cn(
                            "h-16 flex flex-col items-center justify-center p-2",
                            action.color || "bg-blue-500 hover:bg-blue-600",
                            layout === 'horizontal' && "w-20 flex-shrink-0",
                            layout === 'compact' && "h-12"
                        )}
                        size="sm"
                    >
                        <action.icon className={cn("w-4 h-4 mb-1", layout === 'compact' && "mb-0")} />
                        <span className={cn("text-xs font-medium text-center", layout === 'compact' && "text-xs")}>
                            {action.label}
                        </span>
                    </Button>
                </motion.div>
            ))}
        </div>
    );
};

export default WorkspaceLayout;
