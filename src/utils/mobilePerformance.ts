// Mobile Performance Optimization Utilities
export class MobilePerformanceOptimizer {
    private static instance: MobilePerformanceOptimizer;
    private isMobile: boolean;
    private isLowEndDevice: boolean;
    private connectionType: string;
    private memoryInfo: any;

    constructor() {
        this.isMobile = this.detectMobile();
        this.isLowEndDevice = this.detectLowEndDevice();
        this.connectionType = this.getConnectionType();
        this.memoryInfo = this.getMemoryInfo();

        this.initializeOptimizations();
    }

    static getInstance(): MobilePerformanceOptimizer {
        if (!MobilePerformanceOptimizer.instance) {
            MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
        }
        return MobilePerformanceOptimizer.instance;
    }

    private detectMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    }

    private detectLowEndDevice(): boolean {
        // Check for low-end device indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const isLowEndUA = userAgent.includes('android 4') ||
            userAgent.includes('android 5') ||
            userAgent.includes('android 6');

        // Check device memory (if available)
        const hasLowMemory = this.memoryInfo && this.memoryInfo.jsHeapSizeLimit < 100000000; // < 100MB

        // Check CPU cores (if available)
        const hasLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

        return isLowEndUA || hasLowMemory || hasLowCores;
    }

    private getConnectionType(): string {
        // @ts-ignore - Connection API is experimental
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        return connection ? connection.effectiveType : 'unknown';
    }

    private getMemoryInfo(): any {
        // @ts-ignore - Memory API is experimental
        return (performance as any).memory;
    }

    private initializeOptimizations(): void {
        if (this.isMobile) {
            this.enableMobileOptimizations();
        }

        if (this.isLowEndDevice) {
            this.enableLowEndOptimizations();
        }

        this.setupConnectionOptimizations();
    }

    private enableMobileOptimizations(): void {
        // Disable hover effects on touch devices
        document.body.classList.add('touch-device');

        // Optimize scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        document.documentElement.style.webkitOverflowScrolling = 'touch';

        // Prevent zoom on input focus
        this.preventZoomOnInputFocus();

        // Optimize images
        this.optimizeImages();

        // Setup intersection observer for lazy loading
        this.setupLazyLoading();
    }

    private enableLowEndOptimizations(): void {
        // Reduce animations for low-end devices
        document.body.classList.add('low-end-device');

        // Disable expensive CSS effects
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            .low-end-device .shadow-lg,
            .low-end-device .shadow-xl {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
            }
        `;
        document.head.appendChild(style);
    }

    private setupConnectionOptimizations(): void {
        const connection = this.connectionType;

        switch (connection) {
            case 'slow-2g':
            case '2g':
                this.enableSlowConnectionOptimizations();
                break;
            case '3g':
                this.enableMediumConnectionOptimizations();
                break;
            case '4g':
            default:
                this.enableFastConnectionOptimizations();
                break;
        }
    }

    private enableSlowConnectionOptimizations(): void {
        // Disable non-critical features
        document.body.classList.add('slow-connection');

        // Reduce image quality
        this.setImageQuality('low');

        // Disable animations
        this.disableAnimations();
    }

    private enableMediumConnectionOptimizations(): void {
        // Moderate optimizations
        document.body.classList.add('medium-connection');

        // Medium image quality
        this.setImageQuality('medium');
    }

    private enableFastConnectionOptimizations(): void {
        // Full features enabled
        document.body.classList.add('fast-connection');

        // High image quality
        this.setImageQuality('high');
    }

    private preventZoomOnInputFocus(): void {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content',
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
                    );
                }
            });

            input.addEventListener('blur', () => {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content',
                        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
                    );
                }
            });
        });
    }

    private optimizeImages(): void {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" for better performance
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // Add decoding="async" for non-blocking image loading
            if (!img.hasAttribute('decoding')) {
                img.setAttribute('decoding', 'async');
            }
        });
    }

    private setupLazyLoading(): void {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    private setImageQuality(quality: 'low' | 'medium' | 'high'): void {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            switch (quality) {
                case 'low':
                    img.style.imageRendering = 'pixelated';
                    break;
                case 'medium':
                    img.style.imageRendering = 'auto';
                    break;
                case 'high':
                    img.style.imageRendering = 'high-quality';
                    break;
            }
        });
    }

    private disableAnimations(): void {
        const style = document.createElement('style');
        style.textContent = `
            .slow-connection * {
                animation: none !important;
                transition: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Public methods for external use
    public isMobileDevice(): boolean {
        return this.isMobile;
    }

    public isLowEndDevice(): boolean {
        return this.isLowEndDevice;
    }

    public getConnectionType(): string {
        return this.connectionType;
    }

    public getMemoryInfo(): any {
        return this.memoryInfo;
    }

    public optimizeForMobile(): void {
        this.enableMobileOptimizations();
    }

    public optimizeForLowEnd(): void {
        this.enableLowEndOptimizations();
    }

    public preloadCriticalResources(): void {
        // Preload critical CSS
        const criticalCSS = document.createElement('link');
        criticalCSS.rel = 'preload';
        criticalCSS.href = '/src/index.css';
        criticalCSS.as = 'style';
        document.head.appendChild(criticalCSS);

        // Preload critical JS
        const criticalJS = document.createElement('link');
        criticalJS.rel = 'preload';
        criticalJS.href = '/src/main.tsx';
        criticalJS.as = 'script';
        document.head.appendChild(criticalJS);
    }

    public setupServiceWorker(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }

    public setupPushNotifications(): Promise<NotificationPermission> {
        return new Promise((resolve) => {
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    resolve(Notification.permission);
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        resolve(permission);
                    });
                } else {
                    resolve(Notification.permission);
                }
            } else {
                resolve('denied');
            }
        });
    }

    public getPerformanceMetrics(): any {
        return {
            isMobile: this.isMobile,
            isLowEndDevice: this.isLowEndDevice,
            connectionType: this.connectionType,
            memoryInfo: this.memoryInfo,
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight
            },
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency
        };
    }
}

// Initialize mobile performance optimizations
export const initializeMobileOptimizations = (): MobilePerformanceOptimizer => {
    const optimizer = MobilePerformanceOptimizer.getInstance();

    // Setup service worker
    optimizer.setupServiceWorker();

    // Preload critical resources
    optimizer.preloadCriticalResources();

    return optimizer;
};

// Mobile-specific utility functions
export const mobileUtils = {
    // Check if device supports touch
    isTouchDevice: (): boolean => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    // Check if device is iOS
    isIOS: (): boolean => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    // Check if device is Android
    isAndroid: (): boolean => {
        return /Android/.test(navigator.userAgent);
    },

    // Get safe area insets
    getSafeAreaInsets: () => {
        const computedStyle = getComputedStyle(document.documentElement);
        return {
            top: computedStyle.getPropertyValue('env(safe-area-inset-top)'),
            bottom: computedStyle.getPropertyValue('env(safe-area-inset-bottom)'),
            left: computedStyle.getPropertyValue('env(safe-area-inset-left)'),
            right: computedStyle.getPropertyValue('env(safe-area-inset-right)')
        };
    },

    // Prevent body scroll (for modals)
    preventBodyScroll: (): void => {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    },

    // Restore body scroll
    restoreBodyScroll: (): void => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    },

    // Vibrate device (if supported)
    vibrate: (pattern: number | number[]): boolean => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
            return true;
        }
        return false;
    },

    // Share content (if supported)
    share: async (data: ShareData): Promise<boolean> => {
        if ('share' in navigator) {
            try {
                await navigator.share(data);
                return true;
            } catch (error) {
                console.error('Share failed:', error);
                return false;
            }
        }
        return false;
    }
};

export default MobilePerformanceOptimizer;
