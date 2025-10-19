import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Eye,
    EyeOff,
    Mic,
    MicOff,
    FileText,
    Accessibility
} from 'lucide-react';

// Types for mobile optimization
interface TouchGesture {
    type: 'swipe' | 'pinch' | 'tap' | 'longpress';
    direction?: 'left' | 'right' | 'up' | 'down';
    threshold: number;
    callback: () => void;
}

// Mobile-First Responsive Hook
const useResponsiveDesign = () => {
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
    const [touchDevice, setTouchDevice] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width < 768) {
                setScreenSize('mobile');
            } else if (width < 1024) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }

            setOrientation(height > width ? 'portrait' : 'landscape');
        };

        const checkTouchDevice = () => {
            setTouchDevice(
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                // @ts-expect-error - msMaxTouchPoints is a legacy IE property
                navigator.msMaxTouchPoints > 0
            );
        };

        checkScreenSize();
        checkTouchDevice();

        window.addEventListener('resize', checkScreenSize);
        window.addEventListener('orientationchange', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
            window.removeEventListener('orientationchange', checkScreenSize);
        };
    }, []);

    return { screenSize, orientation, touchDevice };
};

// Touch Gesture Handler Hook
const useTouchGestures = (gestures: TouchGesture[]) => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (touch) {
            setTouchStart({
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            });
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;

        // Detect swipe gestures
        gestures.forEach(gesture => {
            if (gesture.type === 'swipe' && gesture.direction) {
                const threshold = gesture.threshold;
                const isSwipe = Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold;

                if (isSwipe) {
                    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
                    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);

                    if (gesture.direction === 'left' && isHorizontalSwipe && deltaX < -threshold) {
                        gesture.callback();
                    } else if (gesture.direction === 'right' && isHorizontalSwipe && deltaX > threshold) {
                        gesture.callback();
                    } else if (gesture.direction === 'up' && isVerticalSwipe && deltaY < -threshold) {
                        gesture.callback();
                    } else if (gesture.direction === 'down' && isVerticalSwipe && deltaY > threshold) {
                        gesture.callback();
                    }
                }
            }
        });

        setTouchStart(null);
    }, [touchStart, gestures]);

    return { handleTouchStart, handleTouchEnd };
};

// Mobile-Optimized Button Component
const MobileButton: React.FC<{
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    touchOptimized?: boolean;
}> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    touchOptimized = true
}) => {
        const { screenSize, touchDevice } = useResponsiveDesign();

        const getButtonClasses = () => {
            const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

            // Touch optimization
            const touchClasses = touchOptimized && touchDevice ? 'min-h-[44px] min-w-[44px]' : '';

            // Size classes
            const sizeClasses = {
                sm: screenSize === 'mobile' ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
                md: screenSize === 'mobile' ? 'px-6 py-4 text-base' : 'px-4 py-2 text-sm',
                lg: screenSize === 'mobile' ? 'px-8 py-5 text-lg' : 'px-6 py-3 text-base'
            };

            // Variant classes
            const variantClasses = {
                primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
                secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
                outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
                ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            };

            return `${baseClasses} ${touchClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
        };

        return (
            <button
                className={getButtonClasses()}
                onClick={onClick}
                disabled={disabled}
                aria-label={typeof children === 'string' ? children : 'Button'}
            >
                {children}
            </button>
        );
    };

// Mobile-Optimized Card Component
const MobileCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    touchOptimized?: boolean;
    swipeActions?: {
        left?: { label: string; action: () => void; icon?: React.ComponentType<{ className?: string }> };
        right?: { label: string; action: () => void; icon?: React.ComponentType<{ className?: string }> };
    };
}> = ({ children, className = '', touchOptimized = true, swipeActions }) => {
    const { screenSize, touchDevice } = useResponsiveDesign();
    const gestures: TouchGesture[] = [];

    if (swipeActions?.left) {
        gestures.push({
            type: 'swipe',
            direction: 'right',
            threshold: 50,
            callback: swipeActions.left.action
        });
    }

    if (swipeActions?.right) {
        gestures.push({
            type: 'swipe',
            direction: 'left',
            threshold: 50,
            callback: swipeActions.right.action
        });
    }

    const { handleTouchStart, handleTouchEnd } = useTouchGestures(gestures);

    const getCardClasses = () => {
        const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
        const touchClasses = touchOptimized && touchDevice ? 'p-4' : 'p-3';
        const responsiveClasses = screenSize === 'mobile' ? 'mx-2 my-2' : 'mx-0 my-0';

        return `${baseClasses} ${touchClasses} ${responsiveClasses} ${className}`;
    };

    return (
        <div
            className={getCardClasses()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </div>
    );
};

// Mobile-Optimized Navigation Component
const MobileNavigation: React.FC<{
    items: Array<{
        id: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        active?: boolean;
        onClick: () => void;
    }>;
    orientation?: 'horizontal' | 'vertical';
}> = ({ items, orientation = 'horizontal' }) => {
    const { touchDevice } = useResponsiveDesign();

    const getNavClasses = () => {
        const baseClasses = 'flex bg-white border-t border-gray-200';
        const orientationClasses = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
        const touchClasses = touchDevice ? 'h-16' : 'h-12';

        return `${baseClasses} ${orientationClasses} ${touchClasses}`;
    };

    const getItemClasses = (active: boolean) => {
        const baseClasses = 'flex flex-col items-center justify-center flex-1 transition-colors duration-200';
        const activeClasses = active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
        const touchClasses = touchDevice ? 'py-2 px-1' : 'py-1 px-2';

        return `${baseClasses} ${activeClasses} ${touchClasses}`;
    };

    return (
        <nav className={getNavClasses()}>
            {items.map((item) => {
                const IconComponent = item.icon;
                return (
                    <button
                        key={item.id}
                        className={getItemClasses(item.active || false)}
                        onClick={item.onClick}
                        aria-label={item.label}
                    >
                        <IconComponent className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

// Mobile-Optimized Tab Component
const MobileTabs: React.FC<{
    tabs: Array<{
        id: string;
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        content: React.ReactNode;
        colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan' | 'pink' | 'indigo' | 'gray';
    }>;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    swipeable?: boolean;
}> = ({ tabs, activeTab, onTabChange, swipeable = true }) => {
    const { screenSize, touchDevice } = useResponsiveDesign();
    const [currentIndex, setCurrentIndex] = useState(0);

    const gestures: TouchGesture[] = [];

    if (swipeable) {
        gestures.push(
            {
                type: 'swipe',
                direction: 'left',
                threshold: 50,
                callback: () => {
                    const nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
                    if (nextIndex < tabs.length && tabs[nextIndex]) {
                        setCurrentIndex(nextIndex);
                        onTabChange(tabs[nextIndex].id);
                    }
                }
            },
            {
                type: 'swipe',
                direction: 'right',
                threshold: 50,
                callback: () => {
                    const prevIndex = Math.max(currentIndex - 1, 0);
                    if (prevIndex >= 0 && tabs[prevIndex]) {
                        setCurrentIndex(prevIndex);
                        onTabChange(tabs[prevIndex].id);
                    }
                }
            }
        );
    }

    const { handleTouchStart, handleTouchEnd } = useTouchGestures(gestures);

    const getTabListClasses = () => {
        const baseClasses = 'flex bg-white border-b border-gray-200';
        const responsiveClasses = screenSize === 'mobile' ? 'overflow-x-auto scrollbar-hide' : 'justify-start overflow-x-auto scrollbar-hide';
        const touchClasses = touchDevice ? 'h-14' : 'h-10';

        return `${baseClasses} ${responsiveClasses} ${touchClasses}`;
    };

    const getTabClasses = (active: boolean) => {
        const baseClasses = 'flex items-center space-x-1 px-2 py-3 transition-colors duration-200 whitespace-nowrap flex-shrink-0';
        const activeClasses = active ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900';
        const touchClasses = touchDevice ? 'min-w-[80px]' : 'min-w-[70px]';

        return `${baseClasses} ${activeClasses} ${touchClasses}`;
    };

    return (
        <div className="flex flex-col h-full">
            <div className={getTabListClasses()}>
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={getTabClasses(tab.id === activeTab)}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {IconComponent && <IconComponent className="w-3 h-3" />}
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div
                className="flex-1 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {tabs.find(tab => tab.id === activeTab)?.content}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Accessibility Features Component
const AccessibilityControls: React.FC<{
    onToggleHighContrast: () => void;
    onToggleLargeText: () => void;
    onToggleVoiceNavigation: () => void;
    highContrast: boolean;
    largeText: boolean;
    voiceNavigation: boolean;
}> = ({
    onToggleHighContrast,
    onToggleLargeText,
    onToggleVoiceNavigation,
    highContrast,
    largeText,
    voiceNavigation
}) => {
        return (
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Accessibility className="w-5 h-5" />
                        <span>Accessibility</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4" />
                                <span>High Contrast</span>
                            </div>
                            <Button
                                variant={highContrast ? "default" : "outline"}
                                size="sm"
                                onClick={onToggleHighContrast}
                            >
                                {highContrast ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Large Text</span>
                            </div>
                            <Button
                                variant={largeText ? "default" : "outline"}
                                size="sm"
                                onClick={onToggleLargeText}
                            >
                                {largeText ? "A+" : "A"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Mic className="w-4 h-4" />
                                <span>Voice Navigation</span>
                            </div>
                            <Button
                                variant={voiceNavigation ? "default" : "outline"}
                                size="sm"
                                onClick={onToggleVoiceNavigation}
                            >
                                {voiceNavigation ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

// Performance Optimization Hook
const usePerformanceOptimization = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry) {
                    setIsInViewport(entry.isIntersecting);
                }
            },
            { threshold: 0.1 }
        );

        const element = document.getElementById('patient-workspace');
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, []);

    const lazyLoad = useCallback((callback: () => void) => {
        if (isInViewport && !isVisible) {
            setIsVisible(true);
            callback();
        }
    }, [isInViewport, isVisible]);

    return { isVisible, isInViewport, lazyLoad };
};

// Export all components and hooks
export {
    useResponsiveDesign,
    useTouchGestures,
    MobileButton,
    MobileCard,
    MobileNavigation,
    MobileTabs,
    AccessibilityControls,
    usePerformanceOptimization
};
