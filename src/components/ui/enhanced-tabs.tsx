import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getTabClasses, getTabIconClasses, getTabColorScheme, TAB_COLOR_SCHEMES, type TabColorScheme } from '@/utils/tabColors';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Enhanced Tab Types
export interface EnhancedTab {
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
}

export interface EnhancedTabsProps {
    tabs: EnhancedTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'default' | 'pills' | 'underline' | 'cards';
    size?: 'sm' | 'md' | 'lg';
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
}

// Enhanced Tab Component
export const EnhancedTabs: React.FC<EnhancedTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    orientation = 'horizontal',
    variant = 'default',
    size = 'md',
    swipeable = true,
    keyboardNavigation = true,
    showScrollButtons = true,
    maxVisibleTabs = 8,
    className,
    tabListClassName,
    tabContentClassName,
    animation = true,
    lazyLoading = true,
    errorBoundary = true
}) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const tabListRef = useRef<HTMLDivElement>(null);
    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([activeTab]));

    // Filter visible tabs
    const visibleTabs = useMemo(() =>
        tabs.filter(tab => !tab.hidden).slice(0, maxVisibleTabs),
        [tabs, maxVisibleTabs]
    );

    const hiddenTabsCount = tabs.filter(tab => !tab.hidden).length - maxVisibleTabs;

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
            tabListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    }, []);

    const scrollRight = useCallback(() => {
        if (tabListRef.current) {
            tabListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!keyboardNavigation) return;

        const currentIndex = visibleTabs.findIndex(tab => tab.id === activeTab);

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleTabs.length - 1;
                onTabChange(visibleTabs[prevIndex].id);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < visibleTabs.length - 1 ? currentIndex + 1 : 0;
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

    // Touch gestures for mobile
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (!swipeable) return;
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, [swipeable]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!swipeable) return;
        setTouchEnd(e.targetTouches[0].clientX);
    }, [swipeable]);

    const handleTouchEnd = useCallback(() => {
        if (!swipeable || !touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = visibleTabs.findIndex(tab => tab.id === activeTab);
            let newIndex = currentIndex;

            if (isLeftSwipe && currentIndex < visibleTabs.length - 1) {
                newIndex = currentIndex + 1;
            } else if (isRightSwipe && currentIndex > 0) {
                newIndex = currentIndex - 1;
            }

            if (newIndex !== currentIndex) {
                onTabChange(visibleTabs[newIndex].id);
            }
        }
    }, [swipeable, touchStart, touchEnd, visibleTabs, activeTab, onTabChange]);

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

    // Size classes
    const sizeClasses = {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base'
    };

    // Variant classes
    const variantClasses = {
        default: 'rounded-md',
        pills: 'rounded-full',
        underline: 'rounded-none border-b-2 border-transparent',
        cards: 'rounded-lg border shadow-sm'
    };

    // Get tab classes
    const getTabClasses = (tab: EnhancedTab, isActive: boolean) => {
        const baseClasses = cn(
            'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            sizeClasses[size],
            variantClasses[variant]
        );

        if (tab.disabled) {
            return cn(baseClasses, 'opacity-50 cursor-not-allowed');
        }

        if (tab.error) {
            return cn(baseClasses, 'text-red-600 border-red-200 bg-red-50');
        }

        if (isActive) {
            const colorScheme = tab.colorScheme || 'MEDICAL';
            const scheme = TAB_COLOR_SCHEMES[colorScheme];
            return cn(baseClasses, scheme.active, 'shadow-sm');
        }

        const colorScheme = tab.colorScheme || 'MEDICAL';
        const scheme = TAB_COLOR_SCHEMES[colorScheme];
        return cn(baseClasses, scheme.primary, scheme.hover);
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
            <div className={cn('w-full', className)}>
                {/* Tab List */}
                <div className={cn(
                    'relative flex items-center',
                    orientation === 'vertical' ? 'flex-col space-y-1' : 'space-x-1',
                    tabListClassName
                )}>
                    {/* Scroll Left Button */}
                    {showScrollButtons && canScrollLeft && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={scrollLeft}
                            className="absolute left-0 z-10 bg-white/80 backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    )}

                    {/* Tab List Container */}
                    <div
                        ref={tabListRef}
                        className={cn(
                            'flex items-center overflow-x-auto scrollbar-hide',
                            orientation === 'vertical' ? 'flex-col w-full' : 'w-full',
                            showScrollButtons && 'px-8'
                        )}
                        onKeyDown={handleKeyDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
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
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}

                                    {/* Error State */}
                                    {tab.error && !tab.loading && (
                                        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                                    )}

                                    {/* Success State */}
                                    {!tab.loading && !tab.error && IconComponent && (
                                        <IconComponent className={cn(
                                            'w-4 h-4 mr-2',
                                            tab.colorScheme ? getTabIconClasses(tab.id, tab.colorScheme) : ''
                                        )} />
                                    )}

                                    {/* Tab Label */}
                                    <span>{tab.label}</span>

                                    {/* Badge */}
                                    {tab.badge && (
                                        <Badge
                                            variant={tab.badge.variant || 'secondary'}
                                            className={cn(
                                                'ml-2 text-xs',
                                                tab.badge.color && `bg-${tab.badge.color}-100 text-${tab.badge.color}-800`
                                            )}
                                        >
                                            {tab.badge.text}
                                        </Badge>
                                    )}

                                    {/* Priority Indicator */}
                                    {tab.priority === 'high' && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />
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
                                className="ml-2"
                            >
                                <MoreHorizontal className="w-4 h-4 mr-1" />
                                +{hiddenTabsCount}
                            </Button>
                        )}
                    </div>

                    {/* Scroll Right Button */}
                    {showScrollButtons && canScrollRight && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={scrollRight}
                            className="absolute right-0 z-10 bg-white/80 backdrop-blur-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Tab Content */}
                <div className={cn('mt-4', tabContentClassName)}>
                    <AnimatePresence mode="wait">
                        {tabs.map((tab) => {
                            if (tab.id !== activeTab) return null;
                            if (lazyLoading && !loadedTabs.has(tab.id)) return null;

                            const content = (
                                <motion.div
                                    key={tab.id}
                                    initial={animation ? { opacity: 0, y: 10 } : undefined}
                                    animate={animation ? { opacity: 1, y: 0 } : undefined}
                                    exit={animation ? { opacity: 0, y: -10 } : undefined}
                                    transition={{ duration: 0.2 }}
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

// Hook for enhanced tab management
export const useEnhancedTabs = (initialTab?: string) => {
    const [activeTab, setActiveTab] = useState(initialTab || '');
    const [tabHistory, setTabHistory] = useState<string[]>([]);

    const changeTab = useCallback((tabId: string) => {
        setActiveTab(tabId);
        setTabHistory(prev => {
            const newHistory = prev.filter(id => id !== tabId);
            return [tabId, ...newHistory].slice(0, 10); // Keep last 10 tabs
        });
    }, []);

    const goBack = useCallback(() => {
        if (tabHistory.length > 1) {
            const previousTab = tabHistory[1];
            setActiveTab(previousTab);
            setTabHistory(prev => prev.slice(1));
        }
    }, [tabHistory]);

    return {
        activeTab,
        changeTab,
        goBack,
        tabHistory,
        canGoBack: tabHistory.length > 1
    };
};

export default EnhancedTabs;
