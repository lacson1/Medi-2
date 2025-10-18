import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Info,
    Clock,
    Users,
    Activity,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CompactInfoPanelProps {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    data: Array<{
        id: string;
        label: string;
        value: string | number;
        trend?: { value: number; direction: 'up' | 'down' | 'stable' };
        status?: 'normal' | 'warning' | 'critical';
        timestamp?: string;
    }>;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    priority?: 'high' | 'medium' | 'low';
    onItemClick?: (item: any) => void;
}

export default function CompactInfoPanel({
    title,
    icon: Icon,
    data,
    collapsible = true,
    defaultCollapsed = true,
    priority = 'medium',
    onItemClick
}: CompactInfoPanelProps) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'critical':
                return <AlertCircle className="w-3 h-3 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-3 h-3 text-yellow-600" />;
            case 'normal':
                return <CheckCircle className="w-3 h-3 text-green-600" />;
            default:
                return null;
        }
    };

    const getTrendIcon = (trend?: { direction: string }) => {
        if (!trend) return null;

        switch (trend.direction) {
            case 'up':
                return <TrendingUp className="w-3 h-3 text-green-600" />;
            case 'down':
                return <TrendingDown className="w-3 h-3 text-red-600" />;
            default:
                return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
        }
    };

    const getTrendColor = (trend?: { direction: string }) => {
        if (!trend) return 'text-gray-600';

        switch (trend.direction) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getPriorityColor = () => {
        switch (priority) {
            case 'high':
                return 'border-l-blue-500 bg-blue-50';
            case 'medium':
                return 'border-l-gray-300';
            case 'low':
                return 'border-l-gray-200';
            default:
                return '';
        }
    };

    return (
        <Card className={cn(
            'transition-all duration-300',
            priority === 'high' && 'ring-1 ring-blue-200',
            getPriorityColor()
        )}>
            <CardHeader className={cn(
                'pb-3',
                priority === 'high' && 'bg-blue-50'
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
                        <CardTitle className={cn(
                            'text-gray-900',
                            priority === 'high' ? 'text-base' : 'text-sm'
                        )}>
                            {title}
                        </CardTitle>
                        {priority === 'high' && (
                            <Badge variant="secondary" className="text-xs">
                                Priority
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center space-x-1">
                        {collapsible && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="h-6 w-6 p-0"
                            >
                                {isCollapsed ? (
                                    <ChevronDown className="w-3 h-3" />
                                ) : (
                                    <ChevronUp className="w-3 h-3" />
                                )}
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                {data.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={cn(
                                            'flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors',
                                            onItemClick && 'cursor-pointer'
                                        )}
                                        onClick={() => onItemClick?.(item)}
                                    >
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                            {getStatusIcon(item.status)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 truncate">{item.label}</p>
                                                {item.timestamp && (
                                                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {item.trend && (
                                                <div className="flex items-center space-x-1">
                                                    {getTrendIcon(item.trend)}
                                                    <span className={cn(
                                                        'text-xs font-medium',
                                                        getTrendColor(item.trend)
                                                    )}>
                                                        {item.trend.value > 0 ? '+' : ''}{item.trend.value}%
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm font-semibold text-gray-900">
                                                {item.value}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed summary */}
            {isCollapsed && (
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{data.length} items</span>
                        <div className="flex items-center space-x-2">
                            {data.filter(item => item.status === 'critical').length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {data.filter(item => item.status === 'critical').length} critical
                                </Badge>
                            )}
                            {data.filter(item => item.status === 'warning').length > 0 && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                    {data.filter(item => item.status === 'warning').length} warnings
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}

// Minimal icon-based status indicator
export function StatusIndicator({
    status,
    size = 'sm'
}: {
    status: 'online' | 'offline' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}) {
    const sizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    const getStatusColor = () => {
        switch (status) {
            case 'online':
                return 'bg-green-500';
            case 'offline':
                return 'bg-gray-400';
            case 'warning':
                return 'bg-yellow-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div className={cn(
            'rounded-full',
            sizeClasses[size],
            getStatusColor()
        )} />
    );
}

// Compact metric display
export function CompactMetric({
    label,
    value,
    icon: Icon,
    color,
    trend,
    onClick
}: {
    label: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    trend?: { value: number; direction: 'up' | 'down' | 'stable' };
    onClick?: () => void;
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors',
                onClick && 'cursor-pointer'
            )}
            onClick={onClick}
        >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
                {Icon && (
                    <div className={cn('p-1 rounded', color || 'bg-gray-100')}>
                        <Icon className="w-3 h-3 text-gray-600" />
                    </div>
                )}
                <span className="text-xs text-gray-600 truncate">{label}</span>
            </div>

            <div className="flex items-center space-x-1">
                {trend && (
                    <>
                        {trend.direction === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                        {trend.direction === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                        <span className={cn(
                            'text-xs font-medium',
                            trend.direction === 'up' && 'text-green-600',
                            trend.direction === 'down' && 'text-red-600',
                            trend.direction === 'stable' && 'text-gray-600'
                        )}>
                            {trend.value > 0 ? '+' : ''}{trend.value}%
                        </span>
                    </>
                )}
                <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
        </div>
    );
}
