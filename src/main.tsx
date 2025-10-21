import ReactDOM from 'react-dom/client'
import App from '@/App'
import '@/index.css'
import { logger } from '@/lib/logger'

// Service Worker Management
if ('serviceWorker' in navigator) {
    // In development, completely disable service worker
    if (!import.meta.env.PROD && import.meta.env['VITE_ENABLE_SW'] !== 'true') {
        // Force unregister all service workers
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister().then(() => {
                    logger.info('Service worker unregistered for development');
                }).catch((error) => {
                    logger.warn('Failed to unregister service worker', error);
                });
            });
        });

        // Clear all caches
        if ('caches' in window) {
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName).then(() => {
                        logger.info(`Cache "${cacheName}" cleared`);
                    }).catch((error) => {
                        logger.warn(`Failed to clear cache "${cacheName}"`, error);
                    });
                });
            });
        }

        // Prevent any new service worker registration
        const originalRegister = navigator.serviceWorker.register;
        navigator.serviceWorker.register = () => {
            logger.info('Service worker registration blocked in development');
            return Promise.reject(new Error('Service worker disabled in development'));
        };

        // If there's still a service worker trying to run, register a minimal one
        setTimeout(() => {
            navigator.serviceWorker.register('/sw-dev.js')
                .then(() => {
                    logger.info('Development service worker registered (minimal functionality)');
                })
                .catch(() => {
                    logger.info('No service worker needed in development');
                });
        }, 1000);
    } else {
        // Production or explicitly enabled - register service worker
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    logger.info('Service worker registered', registration);
                })
                .catch((registrationError) => {
                    logger.error('Service worker registration failed', registrationError);
                });
        });
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
