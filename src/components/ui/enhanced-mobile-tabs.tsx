import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getTabIconClasses, type TabColorScheme } from '@/utils/tabColors';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { useResponsiveDesign } from '@/components/mobile/MobileOptimizedComponents';
import { useTouchGestures, type TouchGesture } from '@/components/mobile/MobileOptimizedComponents';

// Enhanced Mobile Tab Types
export interface EnhancedMobileTab {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    content: React.ReactNode;
    colorScheme?: TabColorScheme;
    disabled?: boolean;
    loading?: boolean;
    error?: boolean;
    badge?: {
        text: string;
        variant?: 'default' | 'secondary' | 'destructive' | 'outline';
        color?: string;
    };
    tooltip?: string;
    shortcut?: string;
    priority?: 'high' | 'medium' | 'low';
    hidden?: boolean;
    lazy?: boolean;
    compact?: boolean;
}

export interface EnhancedMobileTabsProps {
    tabs: EnhancedMobileTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    swipeable?: boolean;
    keyboardNavigation?: boolean;
    showScrollButtons?: boolean;
    maxVisibleTabs?: number;
    className?: string;
    tabListClassName?: string;
    tabContentClassName?: string;
    animation?: boolean;
    lazyLoading?: boolean;
    errorBoundary?: boolean;
    compact?: boolean;
    showBadges?: boolean;
    showPriority?: boolean;
}

// Enhanced Mobile Tabs Component
export const EnhancedMobileTabs: React.FC<EnhancedMobileTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    swipeable = true,
    keyboardNavigation = true,
    showScrollButtons = true,
    maxVisibleTabs = 6,
    className,
    tabListClassName,
    tabContentClassName,
    animation = true,
    lazyLoading = true,
    errorBoundary = true,
    compact = false,
    showBadges = true,
    showPriority = true
}) => {
    const { screenSize, touchDevice } = useResponsiveDesign();
    // const [scrollPosition, setScrollPosition] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));
    const tabListRef = useRef<HTMLDivElement>(null);

    // Filter visible tabs
    const visibleTabs = useMemo(() =>
        tabs.filter(tab => !tab.hidden).slice(0, maxVisibleTabs),
        [tabs, maxVisibleTabs]
    );

    const hiddenTabsCount = tabs.filter(tab => !tab.hidden).length - maxVisibleTabs;

    // Touch gestures for swipe navigation
    const gestures: TouchGesture[] = [];

    if (swipeable) {
        gestures.push(
            {
                type: 'swipe',
                direction: 'left',
                threshold: 50,
                callback: () => {
                    const nextIndex = Math.min(currentIndex + 1, visibleTabs.length - 1);
                    if (nextIndex < visibleTabs.length && visibleTabs[nextIndex]) {
                        setCurrentIndex(nextIndex);
                        onTabChange(visibleTabs[nextIndex].id);
                    }
                }
            },
            {
                type: 'swipe',
                direction: 'right',
                threshold: 50,
                callback: () => {
                    const prevIndex = Math.max(currentIndex - 1, 0);
                    if (prevIndex >= 0 && visibleTabs[prevIndex]) {
                        setCurrentIndex(prevIndex);
                        onTabChange(visibleTabs[prevIndex].id);
                    }
                }
            }
        );
    }

    const { handleTouchStart, handleTouchEnd } = useTouchGestures(gestures);

    // Handle scroll detection
    const handleScroll = useCallback(() => {
        if (!tabListRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = tabListRef.current;
        setScrollPosition(scrollLeft);
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }, []);

    // Scroll functions
    const scrollLeft = useCallback(() => {
        if (tabListRef.current) {
            tabListRef.current.scrollBy({ left: -150, behavior: 'smooth' });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (tabListRef.current) {
            tabListRef.current.scrollBy({ left: 150, behavior: 'smooth' });
        }
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!keyboardNavigation) return;

        const currentTabIndex = visibleTabs.findIndex(tab => tab.id === activeTab);

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                const prevIndex = currentTabIndex > 0 ? currentTabIndex - 1 : visibleTabs.length - 1;
                onTabChange(visibleTabs[prevIndex].id);
                break;
            case 'ArrowRight':
                e.preventDefault();
                const nextIndex = currentTabIndex < visibleTabs.length - 1 ? currentTabIndex + 1 : 0;
                onTabChange(visibleTabs[nextIndex].id);
                break;
            case 'Home':
                e.preventDefault();
                onTabChange(visibleTabs[0].id);
                break;
            case 'End':
                e.preventDefault();
                onTabChange(visibleTabs[visibleTabs.length - 1].id);
                break;
        }
    }, [keyboardNavigation, visibleTabs, activeTab, onTabChange]);

    // Lazy loading
    const handleTabClick = useCallback((tabId: string) => {
        if (lazyLoading) {
            setLoadedTabs(prev => new Set([...prev, tabId]));
        }
        onTabChange(tabId);
    }, [lazyLoading, onTabChange]);

    // Update scroll state on mount and resize
    useEffect(() => {
        handleScroll();
        const tabList = tabListRef.current;
        if (tabList) {
            tabList.addEventListener('scroll', handleScroll);
            return () => tabList.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Update current index when active tab changes
    useEffect(() => {
        const newIndex = visibleTabs.findIndex(tab => tab.id === activeTab);
        if (newIndex !== -1) {
            setCurrentIndex(newIndex);
        }
    }, [activeTab, visibleTabs]);

    // Get tab list classes
    const getTabListClasses = () => {
        const baseClasses = 'flex bg-white border-b border-gray-200';
        const responsiveClasses = screenSize === 'mobile' ? 'overflow-x-auto scrollbar-hide' : 'justify-start overflow-x-auto scrollbar-hide';
        const touchClasses = touchDevice ? (compact ? 'h-12' : 'h-14') : (compact ? 'h-8' : 'h-10');
        const scrollClasses = showScrollButtons ? 'px-8' : '';

        return cn(baseClasses, responsiveClasses, touchClasses, scrollClasses);
    };

    // Get tab classes
    const getTabClasses = (tab: EnhancedMobileTab, isActive: boolean) => {
        const baseClasses = cn(
            'flex items-center transition-colors duration-200 whitespace-nowrap flex-shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50'
        );

        const sizeClasses = compact ? 'px-2 py-2 space-x-1 min-w-[60px]' : 'px-3 py-3 space-x-2 min-w-[80px]';
        const activeClasses = isActive ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900';

        if (tab.disabled) {
            return cn(baseClasses, sizeClasses, 'opacity-50 cursor-not-allowed');
        }

        if (tab.error) {
            return cn(baseClasses, sizeClasses, 'text-red-600 border-red-200 bg-red-50');
        }

        return cn(baseClasses, sizeClasses, activeClasses);
    };

    // Error Boundary Component
    const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
        children,
        fallback = <div className="p-4 text-center text-red-600">Error loading tab content</div>
    }) => {
        const [hasError, setHasError] = useState(false);

        useEffect(() => {
            const handleError = () => setHasError(true);
            window.addEventListener('error', handleError);
            return () => window.removeEventListener('error', handleError);
        }, []);

        if (hasError) {
            return <>{fallback}</>;
        }

        return <>{children}</>;
    };

    return (
        <TooltipProvider>
            <div className={cn('flex flex-col h-full', className)}>
                {/* Tab List */}
                <div className={cn('relative', tabListClassName)}>
                    {/* Scroll Left Button */}
                    {showScrollButtons && canScrollLeft && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={scrollLeft}
                            className="absolute left-0 top-0 z-10 h-full bg-white/80 backdrop-blur-sm rounded-none"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    )}

                    {/* Tab List Container */}
                    <div
                        ref={tabListRef}
                        className={getTabListClasses()}
                        onKeyDown={handleKeyDown}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        role="tablist"
                        tabIndex={0}
                    >
                        {visibleTabs.map((tab) => {
                            const isActive = tab.id === activeTab;
                            const IconComponent = tab.icon;

                            const tabContent = (
                                <button
                                    key={tab.id}
                                    className={getTabClasses(tab, isActive)}
                                    onClick={() => handleTabClick(tab.id)}
                                    disabled={tab.disabled}
                                    role="tab"
                                    aria-selected={isActive ? 'true' : 'false'}
                                    aria-controls={`tabpanel-${tab.id}`}
                                    id={`tab-${tab.id}`}
                                >
                                    {/* Loading State */}
                                    {tab.loading && (
                                        <Loader2 className={cn(
                                            'animate-spin',
                                            compact ? 'w-3 h-3' : 'w-4 h-4'
                                        )} />
                                    )}

                                    {/* Error State */}
                                    {tab.error && !tab.loading && (
                                        <AlertCircle className={cn(
                                            'text-red-500',
                                            compact ? 'w-3 h-3' : 'w-4 h-4'
                                        )} />
                                    )}

                                    {/* Success State */}
                                    {!tab.loading && !tab.error && IconComponent && (
                                        <IconComponent className={cn(
                                            tab.colorScheme ? getTabIconClasses(tab.id, tab.colorScheme) : '',
                                            compact ? 'w-3 h-3' : 'w-4 h-4'
                                        )} />
                                    )}

                                    {/* Tab Label */}
                                    <span className={cn(
                                        'font-medium',
                                        compact ? 'text-xs' : 'text-sm'
                                    )}>
                                        {tab.label}
                                    </span>

                                    {/* Badge */}
                                    {showBadges && tab.badge && (
                                        <Badge
                                            variant={tab.badge.variant || 'secondary'}
                                            className={cn(
                                                'text-xs',
                                                tab.badge.color && `bg-${tab.badge.color}-100 text-${tab.badge.color}-800`
                                            )}
                                        >
                                            {tab.badge.text}
                                        </Badge>
                                    )}

                                    {/* Priority Indicator */}
                                    {showPriority && tab.priority === 'high' && (
                                        <div className={cn(
                                            'bg-red-500 rounded-full',
                                            compact ? 'w-1.5 h-1.5' : 'w-2 h-2'
                                        )} />
                                    )}
                                </button>
                            );

                            return tab.tooltip ? (
                                <Tooltip key={tab.id}>
                                    <TooltipTrigger asChild>
                                        {tabContent}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tab.tooltip}</p>
                                        {tab.shortcut && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Shortcut: {tab.shortcut}
                                            </p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            ) : tabContent;
                        })}

                        {/* More Tabs Indicator */}
                        {hiddenTabsCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 flex-shrink-0"
                            >
                                <MoreHorizontal className={cn(
                                    'mr-1',
                                    compact ? 'w-3 h-3' : 'w-4 h-4'
                                )} />
                                <span className={cn(
                                    compact ? 'text-xs' : 'text-sm'
                                )}>
                                    +{hiddenTabsCount}
                                </span>
                            </Button>
                        )}
                    </div>

                    {/* Scroll Right Button */}
                    {showScrollButtons && canScrollRight && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={scrollRight}
                            className="absolute right-0 top-0 z-10 h-full bg-white/80 backdrop-blur-sm rounded-none"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Tab Content */}
                <div className={cn('flex-1 overflow-auto', tabContentClassName)}>
                    <AnimatePresence mode="wait">
                        {tabs.map((tab) => {
                            if (tab.id !== activeTab) return null;
                            if (lazyLoading && !loadedTabs.has(tab.id)) return null;

                            const content = (
                                <motion.div
                                    key={tab.id}
                                    initial={animation ? { opacity: 0, x: 20 } : undefined}
                                    animate={animation ? { opacity: 1, x: 0 } : undefined}
                                    exit={animation ? { opacity: 0, x: -20 } : undefined}
                                    transition={{ duration: 0.2 }}
                                    className="h-full"
                                    role="tabpanel"
                                    id={`tabpanel-${tab.id}`}
                                    aria-labelledby={`tab-${tab.id}`}
                                >
                                    {errorBoundary ? (
                                        <ErrorBoundary>
                                            {tab.content}
                                        </ErrorBoundary>
                                    ) : tab.content}
                                </motion.div>
                            );

                            return content;
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default EnhancedMobileTabs;
