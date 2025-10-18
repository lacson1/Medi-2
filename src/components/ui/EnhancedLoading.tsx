import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
    text?: string;
    className?: string;
}

const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
};

const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
};

export default function EnhancedLoading({
    size = 'md',
    variant = 'spinner',
    text,
    className
}: EnhancedLoadingProps) {
    const renderSpinner = () => (
        <motion.div
            className={cn(
                'border-2 border-gray-200 border-t-blue-600 rounded-full',
                sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    );

    const renderDots = () => (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={cn('bg-blue-600 rounded-full', size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3')}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    );

    const renderPulse = () => (
        <motion.div
            className={cn('bg-blue-600 rounded-full', sizeClasses[size])}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    );

    const renderSkeleton = () => (
        <div className="space-y-2">
            <div className={cn('bg-gray-200 rounded animate-pulse', size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : 'h-6')} />
            <div className={cn('bg-gray-200 rounded animate-pulse w-3/4', size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4')} />
        </div>
    );

    const renderVariant = () => {
        switch (variant) {
            case 'dots':
                return renderDots();
            case 'pulse':
                return renderPulse();
            case 'skeleton':
                return renderSkeleton();
            default:
                return renderSpinner();
        }
    };

    return (
        <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
            {renderVariant()}
            {text && (
                <motion.p
                    className={cn('text-gray-600 font-medium', textSizeClasses[size])}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
}
