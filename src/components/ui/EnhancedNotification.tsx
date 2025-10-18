import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
    actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    }>;
}

const typeConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-900',
        textColor: 'text-green-700'
    },
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        textColor: 'text-red-700'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-700'
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900',
        textColor: 'text-blue-700'
    }
};

export default function EnhancedNotification({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose,
    actions
}: NotificationProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    React.useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                'relative max-w-sm w-full rounded-lg border shadow-lg p-4',
                config.bgColor,
                config.borderColor
            )}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Icon className={cn('w-5 h-5', config.iconColor)} />
                </div>

                <div className="ml-3 flex-1">
                    <h3 className={cn('text-sm font-medium', config.titleColor)}>
                        {title}
                    </h3>
                    {message && (
                        <p className={cn('mt-1 text-sm', config.textColor)}>
                            {message}
                        </p>
                    )}

                    {actions && actions.length > 0 && (
                        <div className="mt-3 flex space-x-2">
                            {actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={cn(
                                        'text-sm font-medium rounded px-3 py-1 transition-colors',
                                        action.variant === 'primary'
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={() => onClose(id)}
                        className={cn(
                            'inline-flex rounded-md p-1.5 transition-colors',
                            config.textColor,
                            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface NotificationContainerProps {
    notifications: NotificationProps[];
    onClose: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationContainer({
    notifications,
    onClose,
    position = 'top-right'
}: NotificationContainerProps) {
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    return (
        <div className={cn('fixed z-50 space-y-2', positionClasses[position])}>
            <AnimatePresence>
                {notifications.map((notification) => (
                    <EnhancedNotification
                        key={notification.id}
                        {...notification}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
