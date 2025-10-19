import React, { useState } from 'react';
import { ChevronRight, MoreHorizontal, Heart, Share2, Bookmark } from 'lucide-react';

interface MobileCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    onClick?: () => void;
    onMoreClick?: () => void;
    className?: string;
    variant?: 'default' | 'compact' | 'elevated';
    swipeable?: boolean;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
    children,
    title,
    subtitle,
    onClick,
    onMoreClick,
    className = '',
    variant = 'default',
    swipeable = false,
    onSwipeLeft,
    onSwipeRight
}) => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'compact':
                return 'p-3';
            case 'elevated':
                return 'p-4 shadow-lg';
            default:
                return 'p-4';
        }
    };

    return (
        <div
            className={`
                bg-card border border-border rounded-lg
                transition-all duration-200
                ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}
                ${getVariantClasses()}
                ${className}
            `}
            onClick={onClick}
            onTouchStart={swipeable ? onTouchStart : undefined}
            onTouchMove={swipeable ? onTouchMove : undefined}
            onTouchEnd={swipeable ? onTouchEnd : undefined}
        >
            {(title || subtitle || onMoreClick) && (
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3 className="text-base font-semibold text-card-foreground truncate">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {onMoreClick && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoreClick();
                            }}
                            className="
                                ml-2 p-1 rounded
                                text-muted-foreground hover:text-foreground
                                hover:bg-muted/50
                                touch-target
                            "
                            aria-label="More options"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            <div className="text-sm text-card-foreground">
                {children}
            </div>
        </div>
    );
};

// Mobile List Item Component
interface MobileListItemProps {
    title: string;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    rightContent?: React.ReactNode;
    onClick?: () => void;
    showChevron?: boolean;
    className?: string;
}

export const MobileListItem: React.FC<MobileListItemProps> = ({
    title,
    subtitle,
    icon: IconComponent,
    rightContent,
    onClick,
    showChevron = true,
    className = ''
}) => {
    return (
        <div
            className={`
                flex items-center p-4
                bg-card border-b border-border last:border-b-0
                transition-colors duration-200
                ${onClick ? 'cursor-pointer hover:bg-muted/50 active:bg-muted' : ''}
                touch-target
                ${className}
            `}
            onClick={onClick}
        >
            {IconComponent && (
                <div className="flex-shrink-0 mr-3">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium text-card-foreground truncate">
                    {title}
                </h4>
                {subtitle && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {rightContent && (
                <div className="flex-shrink-0 ml-3">
                    {rightContent}
                </div>
            )}

            {showChevron && onClick && (
                <div className="flex-shrink-0 ml-2">
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
            )}
        </div>
    );
};

// Mobile Stats Card Component
interface MobileStatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    icon?: React.ComponentType<{ className?: string }>;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    className?: string;
}

export const MobileStatsCard: React.FC<MobileStatsCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    icon: IconComponent,
    color = 'blue',
    className = ''
}) => {
    const getColorClasses = () => {
        switch (color) {
            case 'blue':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'green':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'red':
                return 'bg-red-50 text-red-600 border-red-200';
            case 'yellow':
                return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'purple':
                return 'bg-purple-50 text-purple-600 border-purple-200';
            default:
                return 'bg-blue-50 text-blue-600 border-blue-200';
        }
    };

    return (
        <div className={`
            bg-card border border-border rounded-lg p-4
            ${className}
        `}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                    {title}
                </h3>
                {IconComponent && (
                    <div className={`p-2 rounded-lg ${getColorClasses()}`}>
                        <IconComponent className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="mb-1">
                <span className="text-2xl font-bold text-card-foreground">
                    {value}
                </span>
            </div>

            {subtitle && (
                <p className="text-sm text-muted-foreground mb-2">
                    {subtitle}
                </p>
            )}

            {trend && (
                <div className={`
                    text-xs font-medium
                    ${trend.isPositive ? 'text-green-600' : 'text-red-600'}
                `}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                </div>
            )}
        </div>
    );
};

// Mobile Action Card Component
interface MobileActionCardProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    actions?: Array<{
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'destructive';
    }>;
    className?: string;
}

export const MobileActionCard: React.FC<MobileActionCardProps> = ({
    title,
    description,
    icon: IconComponent,
    actions = [],
    className = ''
}) => {
    return (
        <div className={`
            bg-card border border-border rounded-lg p-4
            ${className}
        `}>
            <div className="flex items-start mb-4">
                {IconComponent && (
                    <div className="flex-shrink-0 mr-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-card-foreground">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {actions.length > 0 && (
                <div className="flex flex-col space-y-2">
                    {actions.map((action, index) => {
                        const ActionIcon = action.icon;

                        return (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`
                                    flex items-center justify-center px-4 py-3
                                    rounded-lg font-medium text-sm
                                    transition-colors duration-200
                                    touch-target
                                    ${action.variant === 'destructive'
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : action.variant === 'secondary'
                                            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                    }
                                `}
                            >
                                {ActionIcon && (
                                    <ActionIcon className="w-4 h-4 mr-2" />
                                )}
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MobileCard;
