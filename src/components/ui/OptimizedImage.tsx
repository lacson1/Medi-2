import React, { memo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
}

// Optimized Image Component with lazy loading and error handling
const OptimizedImage = memo<OptimizedImageProps>(({
    src,
    alt,
    className,
    width,
    height,
    loading = 'lazy',
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
    fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIGVycm9yPC90ZXh0Pjwvc3ZnPg==',
    onLoad,
    onError
}) => {
    const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleLoad = useCallback(() => {
        setImageState('loaded');
        onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
        setImageState('error');
        setCurrentSrc(fallback);
        onError?.();
    }, [fallback, onError]);

    const imageProps = {
        src: currentSrc,
        alt,
        className: cn(
            'transition-opacity duration-300',
            imageState === 'loading' && 'opacity-0',
            imageState === 'loaded' && 'opacity-100',
            imageState === 'error' && 'opacity-75',
            className
        ),
        loading,
        onLoad: handleLoad,
        onError: handleError,
        ...(width && { width }),
        ...(height && { height })
    };

    return (
        <div className="relative overflow-hidden">
            {/* Placeholder */}
            {imageState === 'loading' && (
                <img
                    src={placeholder}
                    alt=""
                    className={cn('absolute inset-0 w-full h-full object-cover', className)}
                    aria-hidden="true"
                />
            )}

            {/* Main image */}
            <img {...imageProps} />

            {/* Loading indicator */}
            {imageState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

// Avatar component with optimization
interface OptimizedAvatarProps {
    src?: string;
    alt: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const OptimizedAvatar = memo<OptimizedAvatarProps>(({
    src,
    alt,
    fallback,
    size = 'md',
    className
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <OptimizedImage
            src={src || fallback || ''}
            alt={alt}
            className={cn(
                'rounded-full object-cover',
                sizeClasses[size],
                className
            )}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNmM2Y0ZjYiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAxMi4yMzg2IDIyLjc2MTQgMTAgMjAgMTBDMTcuMjM4NiAxMCAxNSAxMi4yMzg2IDE1IDE1QzE1IDE3Ljc2MTQgMTcuMjM4NiAyMCAyMCAyMFoiIGZpbGw9IiM5Y2EzYWYiLz4KPHBhdGggZD0iTTIwIDIyQzE1LjAyOTQgMjIgMTAgMjQuMjM4NiAxMCAyN1YzMEgzMFYyN0MzMCAyNC4yMzg2IDI0Ljk3MDYgMjIgMjAgMjJaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo="
        />
    );
});

OptimizedAvatar.displayName = 'OptimizedAvatar';

// Responsive image component
interface ResponsiveImageProps {
    src: string;
    alt: string;
    className?: string;
    sizes?: string;
    srcSet?: string;
}

const ResponsiveImage = memo<ResponsiveImageProps>(({
    src,
    alt,
    className,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    srcSet
}) => {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
});

ResponsiveImage.displayName = 'ResponsiveImage';

export { OptimizedImage, OptimizedAvatar, ResponsiveImage };
export default OptimizedImage;
