import { useEffect, useRef, useCallback, useState } from 'react';
import { PerformanceMonitor, ErrorLogger } from '@/lib/monitoring';

/**
 * Hook for monitoring component performance
 */
export const usePerformanceMonitoring = (componentName) => {
    const startTimeRef = useRef(null);
    const renderCountRef = useRef(0);

    useEffect(() => {
        startTimeRef.current = PerformanceMonitor.startTiming(`Component: ${componentName}`);
        renderCountRef.current += 1;

        return () => {
            if (startTimeRef.current) {
                const duration = PerformanceMonitor.endTiming(`Component: ${componentName}`, startTimeRef.current);

                // Log slow renders
                if (duration > 100) { // More than 100ms
                    ErrorLogger.log(new Error(`Slow component render: ${componentName}`), {
                        tags: { type: 'performance_warning' },
                        extra: {
                            duration,
                            renderCount: renderCountRef.current,
                            component: componentName
                        },
                    });
                }
            }
        };
    });

    return {
        renderCount: renderCountRef.current,
    };
};

/**
 * Hook for monitoring API calls
 */
export const useApiMonitoring = () => {
    const trackApiCall = useCallback(async(apiCall, context = {}) => {
        return PerformanceMonitor.measureApiCall(apiCall, context);
    }, []);

    return { trackApiCall };
};

/**
 * Hook for monitoring user interactions
 */
export const useUserInteractionMonitoring = () => {
    const trackInteraction = useCallback((action, context = {}) => {
        // Track user interactions for analytics
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: 'user_interaction',
                ...context,
            });
        }
    }, []);

    return { trackInteraction };
};

/**
 * Hook for monitoring component errors
 */
export const useErrorMonitoring = (componentName) => {
    const logError = useCallback((error, context = {}) => {
        ErrorLogger.log(error, {
            tags: {
                type: 'component_error',
                component: componentName
            },
            extra: context,
        });
    }, [componentName]);

    return { logError };
};

/**
 * Hook for monitoring memory usage
 */
export const useMemoryMonitoring = () => {
    const getMemoryInfo = useCallback(() => {
        if ('memory' in performance) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
            };
        }
        return null;
    }, []);

    const checkMemoryUsage = useCallback(() => {
        const memoryInfo = getMemoryInfo();
        if (memoryInfo && memoryInfo.used > memoryInfo.limit * 0.8) {
            ErrorLogger.log(new Error('High memory usage detected'), {
                tags: { type: 'memory_warning' },
                extra: memoryInfo,
            });
        }
        return memoryInfo;
    }, [getMemoryInfo]);

    return { getMemoryInfo, checkMemoryUsage };
};

/**
 * Hook for monitoring network status
 */
export const useNetworkMonitoring = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionType, setConnectionType] = useState(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check connection type if available
        if ('connection' in navigator) {
            setConnectionType(navigator.connection.effectiveType);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline, connectionType };
};

/**
 * Hook for monitoring scroll performance
 */
export const useScrollMonitoring = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollDirection, setScrollDirection] = useState('down');
    const lastScrollY = useRef(0);

    useEffect(() => {
        let ticking = false;

        const updateScrollPosition = () => {
            const currentScrollY = window.scrollY;

            setScrollPosition(currentScrollY);
            setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up');

            lastScrollY.current = currentScrollY;
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return { scrollPosition, scrollDirection };
};

/**
 * Hook for monitoring component visibility
 */
export const useVisibilityMonitoring = (componentName) => {
    const [isVisible, setIsVisible] = useState(false);
    const [visibilityRatio, setVisibilityRatio] = useState(0);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                    setVisibilityRatio(entry.intersectionRatio);

                    // Track visibility changes
                    if (entry.isIntersecting) {
                        PerformanceMonitor.trackPageLoad(`${componentName} - visible`);
                    }
                });
            }, { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [componentName]);

    return {
        elementRef,
        isVisible,
        visibilityRatio
    };
};

export default {
    usePerformanceMonitoring,
    useApiMonitoring,
    useUserInteractionMonitoring,
    useErrorMonitoring,
    useMemoryMonitoring,
    useNetworkMonitoring,
    useScrollMonitoring,
    useVisibilityMonitoring,
};