import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OptimizedStatsCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    subtitle?: string;
    isLoading?: boolean;
    hasError?: boolean;
    onRetry?: () => void;
    priority?: 'high' | 'medium' | 'low';
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'stable';
    };
    status?: 'normal' | 'warning' | 'critical';
    compact?: boolean;
    showDetails?: boolean;
    valueType?: 'currency' | 'percentage' | 'count' | 'health' | 'time';
    thresholds?: {
        low?: number;
        medium?: number;
        high?: number;
    };
}

export default function OptimizedStatsCard({
    title,
    value,
    icon: Icon,
    gradient,
    subtitle,
    isLoading,
    hasError = false,
    onRetry,
    priority = 'medium',
    trend,
    status = 'normal',
    compact = false,
    showDetails = true,
    valueType = 'count',
    thresholds
}: OptimizedStatsCardProps) {
    // Color coding utility functions
    const getNumericValue = (val: string | number): number => {
        if (typeof val === 'number') return val;
        // Extract number from string (handles currency, percentages, etc.)
        const match = val.toString().match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
    };

    const getValueColor = (val: string | number, type: string, thresholds?: any): string => {
        const numericValue = getNumericValue(val);

        if (type === 'health' || type === 'percentage') {
            // For health/percentage: green > 80%, yellow 60-80%, red < 60%
            if (numericValue >= 80) return 'text-green-600';
            if (numericValue >= 60) return 'text-yellow-600';
            return 'text-red-600';
        }

        if (type === 'currency') {
            // For currency: green for positive, red for negative
            return numericValue >= 0 ? 'text-green-600' : 'text-red-600';
        }

        if (thresholds) {
            // Use custom thresholds if provided
            if (numericValue >= (thresholds.high || 100)) return 'text-green-600';
            if (numericValue >= (thresholds.medium || 50)) return 'text-yellow-600';
            return 'text-red-600';
        }

        // Default: use trend direction for color
        if (trend) {
            switch (trend.direction) {
                case 'up': return 'text-green-600';
                case 'down': return 'text-red-600';
                default: return 'text-gray-600';
            }
        }

        return 'text-gray-900';
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'critical': return 'text-red-600';
            case 'warning': return 'text-yellow-600';
            case 'normal': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getBackgroundColor = (status: string): string => {
        switch (status) {
            case 'critical': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'normal': return 'bg-white';
            default: return 'bg-gray-50';
        }
    };

    if (isLoading) {
        return (
            <Card className={cn(
                'relative overflow-hidden border-none shadow-lg',
                priority === 'high' && 'ring-2 ring-blue-100'
            )}>
                <CardContent className={cn(compact ? 'p-4' : 'p-6')}>
                    <Skeleton className={cn(compact ? 'h-16' : 'h-20', 'w-full')} />
                </CardContent>
            </Card>
        );
    }

    if (hasError) {
        return (
            <Card className="relative overflow-hidden border-none shadow-lg border-red-200 bg-red-50">
                <CardContent className={cn(compact ? 'p-4' : 'p-6')}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className={cn(
                                'font-medium text-red-600 mb-1',
                                compact ? 'text-xs' : 'text-sm'
                            )}>
                                {title}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className={cn(
                                    'text-red-600',
                                    compact ? 'text-xs' : 'text-sm'
                                )}>
                                    Failed to load
                                </span>
                            </div>
                            {onRetry && !compact && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onRetry}
                                    className="text-xs"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Retry
                                </Button>
                            )}
                        </div>
                        <div className={cn(
                            'rounded-xl bg-red-100',
                            compact ? 'p-2' : 'p-3'
                        )}>
                            <Icon className={cn('text-red-600', compact ? 'w-4 h-4' : 'w-6 h-6')} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getStatusIndicator = () => {
        switch (status) {
            case 'critical':
                return <div className="w-2 h-2 bg-red-500 rounded-full" />;
            case 'warning':
                return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
            default:
                return null;
        }
    };

    const getTrendIcon = () => {
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

    const getTrendColor = () => {
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                'relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300',
                priority === 'high' && 'ring-2 ring-blue-100',
                status === 'critical' && 'border-l-4 border-l-red-500',
                status === 'warning' && 'border-l-4 border-l-yellow-500',
                getBackgroundColor(status)
            )}>
                {/* Background decoration - minimized for compact mode */}
                {!compact && (
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full transform translate-x-12 -translate-y-12`} />
                )}

                <CardContent className={cn(compact ? 'p-4' : 'p-6')}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            {/* Title with status indicator */}
                            <div className="flex items-center gap-2 mb-1">
                                <p className={cn(
                                    'font-medium text-gray-600',
                                    compact ? 'text-xs' : 'text-sm'
                                )}>
                                    {title}
                                </p>
                                {getStatusIndicator()}
                            </div>

                            {/* Main value - emphasized with color coding */}
                            <h3 className={cn(
                                'font-bold mb-1',
                                compact ? 'text-xl' : 'text-3xl',
                                priority === 'high' && 'text-blue-900',
                                getValueColor(value, valueType, thresholds)
                            )}>
                                {value}
                            </h3>

                            {/* Trend information - only if showDetails is true */}
                            {showDetails && trend && (
                                <div className="flex items-center gap-1 mb-1">
                                    {getTrendIcon()}
                                    <span className={cn(
                                        'font-medium',
                                        compact ? 'text-xs' : 'text-sm',
                                        getTrendColor()
                                    )}>
                                        {trend.value > 0 ? '+' : ''}{trend.value}%
                                    </span>
                                    <span className={cn(
                                        'text-gray-500',
                                        compact ? 'text-xs' : 'text-sm'
                                    )}>
                                        {trend.label}
                                    </span>
                                </div>
                            )}

                            {/* Subtitle - minimized */}
                            {subtitle && showDetails && (
                                <p className={cn(
                                    'text-gray-500',
                                    compact ? 'text-xs' : 'text-xs'
                                )}>
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Icon - size based on compact mode */}
                        <div className={cn(
                            'rounded-xl bg-gradient-to-br shadow-lg',
                            gradient,
                            compact ? 'p-2' : 'p-3'
                        )}>
                            <Icon className={cn('text-white', compact ? 'w-4 h-4' : 'w-6 h-6')} />
                        </div>
                    </div>

                    {/* Additional info for high priority cards */}
                    {priority === 'high' && showDetails && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                                <Badge variant="outline" className="text-xs">
                                    High Priority
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

// Compact version for secondary information
export function CompactStatsCard({
    title,
    value,
    icon: Icon,
    color,
    trend,
    onClick
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: { value: number; direction: 'up' | 'down' | 'stable' };
    onClick?: () => void;
}) {
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={onClick}
        >
            <CardContent className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 truncate">{title}</p>
                        <p className="text-lg font-semibold text-gray-900">{value}</p>
                        {trend && (
                            <div className="flex items-center gap-1">
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
                            </div>
                        )}
                    </div>
                    <div className={cn('p-2 rounded-lg', color)}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
