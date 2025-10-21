import { useEffect, useRef, useCallback } from 'react';
import { PerformanceTracker } from '@/utils/performance';
import { logger } from '@/lib/logger';

// Hook for monitoring component performance
export function usePerformanceMonitor(componentName: string) {
    const renderStartTime = useRef<number>(0);
    const mountTime = useRef<number>(0);

    useEffect(() => {
        mountTime.current = performance.now();
        PerformanceTracker.start(`${componentName}-mount`);

        return () => {
            const mountDuration = performance.now() - mountTime.current;
            PerformanceTracker.end(`${componentName}-mount`);

            if (import.meta.env.DEV) {
                logger.info(`${componentName} mounted in ${mountDuration.toFixed(2)}ms`);
            }
        };
    }, [componentName]);

    const trackRender = useCallback(() => {
        renderStartTime.current = performance.now();
    }, []);

    const endRender = useCallback(() => {
        if (renderStartTime.current > 0) {
            const renderDuration = performance.now() - renderStartTime.current;
            PerformanceTracker.end(`${componentName}-render`);

            if (import.meta.env.DEV && renderDuration > 16) {
                logger.warn(`${componentName} render took ${renderDuration.toFixed(2)}ms (slow)`);
            }
        }
    }, [componentName]);

    return { trackRender, endRender };
}

// Hook for monitoring API calls
export function useApiPerformanceMonitor() {
    const trackApiCall = useCallback(async <T>(
        apiName: string,
        apiCall: () => Promise<T>
    ): Promise<T> => {
        return PerformanceTracker.measureAsync(`api-${apiName}`, apiCall);
    }, []);

    return { trackApiCall };
}

// Hook for monitoring user interactions
export function useInteractionMonitor() {
    const trackInteraction = useCallback((interactionName: string, callback: () => void) => {
        return PerformanceTracker.measure(`interaction-${interactionName}`, callback);
    }, []);

    return { trackInteraction };
}

// Hook for monitoring memory usage
export function useMemoryMonitor() {
    useEffect(() => {
        if (!('memory' in performance)) return;

        const checkMemory = () => {
            const memory = (performance as any).memory;
            if (memory) {
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const totalMB = memory.totalJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

                if (import.meta.env.DEV) {
                    logger.info(`Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB (limit: ${limitMB.toFixed(2)}MB)`);
                }

                // Warn if memory usage is high
                if (usedMB / limitMB > 0.8) {
                    logger.warn('High memory usage detected:', {
                        used: `${usedMB.toFixed(2)}MB`,
                        limit: `${limitMB.toFixed(2)}MB`,
                        percentage: `${((usedMB / limitMB) * 100).toFixed(1)}%`
                    });
                }
            }
        };

        // Check memory every 30 seconds
        const interval = setInterval(checkMemory, 30000);

        return () => clearInterval(interval);
    }, []);
}

// Hook for monitoring bundle size impact
export function useBundleMonitor() {
    useEffect(() => {
        if (import.meta.env.DEV) {
            // Log when components are loaded
            const originalImport = window.__webpack_require__ || window.require;
            if (originalImport) {
                logger.info('Bundle monitoring enabled');
            }
        }
    }, []);
}

// Hook for monitoring network performance
export function useNetworkMonitor() {
    useEffect(() => {
        if (!('connection' in navigator)) return;

        const connection = (navigator as any).connection;
        if (connection) {
            const logConnectionInfo = () => {
                if (import.meta.env.DEV) {
                    logger.info('Network connection:', {
                        effectiveType: connection.effectiveType,
                        downlink: `${connection.downlink}Mbps`,
                        rtt: `${connection.rtt}ms`,
                        saveData: connection.saveData
                    });
                }
            };

            logConnectionInfo();
            connection.addEventListener('change', logConnectionInfo);

            return () => connection.removeEventListener('change', logConnectionInfo);
        }
    }, []);
}

// Hook for monitoring Core Web Vitals
export function useWebVitalsMonitor() {
    useEffect(() => {
        // Monitor Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];

                if (import.meta.env.DEV) {
                    logger.info('LCP:', lastEntry.startTime.toFixed(2) + 'ms');
                }
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (import.meta.env.DEV) {
                        logger.info('FID:', entry.processingStart - entry.startTime + 'ms');
                    }
                });
            });

            fidObserver.observe({ entryTypes: ['first-input'] });

            // Monitor Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                    }
                });

                if (import.meta.env.DEV) {
                    logger.info('CLS:', clsValue.toFixed(4));
                }
            });

            clsObserver.observe({ entryTypes: ['layout-shift'] });

            return () => {
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);
}

// Combined performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
    usePerformanceMonitor(componentName);
    useMemoryMonitor();
    useBundleMonitor();
    useNetworkMonitor();
    useWebVitalsMonitor();

    return {
        trackApiCall: useApiPerformanceMonitor().trackApiCall,
        trackInteraction: useInteractionMonitor().trackInteraction
    };
}
