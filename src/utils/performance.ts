/**
 * Performance optimization utilities for MediFlow
 */

// Import React for type definitions
import * as React from 'react';

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };

        const callNow = immediate && !timeout;

        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func(...args);
    };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
}

// Performance monitoring utilities
export class PerformanceTracker {
    private static measurements: Map<string, number> = new Map();

    static start(label: string): void {
        this.measurements.set(label, performance.now());
    }

    static end(label: string): number {
        const startTime = this.measurements.get(label);
        if (!startTime) {
            console.warn(`Performance measurement "${label}" was not started`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.measurements.delete(label);

        if (import.meta.env.DEV) {
            console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    static measure<T>(label: string, fn: () => T): T {
        this.start(label);
        const result = fn();
        this.end(label);
        return result;
    }

    static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        this.start(label);
        const result = await fn();
        this.end(label);
        return result;
    }
}

// Resource preloading utilities
export function preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
}

export function preloadModule(importFn: () => Promise<any>): Promise<any> {
    return importFn();
}

// Bundle size optimization utilities
export function createLazyComponent<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    _fallback?: React.ComponentType
) {
    return React.lazy(importFn);
}

// Memory management utilities
export function createWeakMap<K extends object, V>(): WeakMap<K, V> {
    return new WeakMap();
}

export function createWeakSet<T extends object>(): WeakSet<T> {
    return new WeakSet();
}

// Virtual scrolling utilities
export interface VirtualScrollOptions {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}

export function calculateVirtualScrollRange(
    scrollTop: number,
    options: VirtualScrollOptions
): { start: number; end: number; totalHeight: number } {
    const { itemHeight, containerHeight, overscan = 5 } = options;

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount + overscan * 2;

    return {
        start,
        end,
        totalHeight: itemHeight * visibleCount
    };
}

// Cache management utilities
export class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private maxSize: number;

    constructor(maxSize: number = 100) {
        this.maxSize = maxSize;
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    has(key: K): boolean {
        return this.cache.has(key);
    }

    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        return this.cache.size;
    }
}

// React-specific performance utilities
export const ReactPerformanceUtils = {
    // Create a memoized component wrapper
    memo: <P extends object>(Component: React.ComponentType<P>) => {
        return React.memo(Component);
    },

    // Create a callback memoization wrapper
    useCallback: <T extends (...args: any[]) => any>(
        callback: T,
        deps: React.DependencyList
    ): T => {
        return React.useCallback(callback, deps);
    },

    // Create a memoized value wrapper
    useMemo: <T>(factory: () => T, deps: React.DependencyList): T => {
        return React.useMemo(factory, deps);
    }
};
