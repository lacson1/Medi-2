import ReactDOM from 'react-dom/client'
import App from '@/App'
import '@/index.css'

// Service Worker Management
if ('serviceWorker' in navigator) {
    // In development, completely disable service worker
    if (!import.meta.env.PROD && import.meta.env['VITE_ENABLE_SW'] !== 'true') {
        // Force unregister all service workers
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => {
                registration.unregister().then(() => {
                    console.log('Service worker unregistered for development');
                }).catch((error) => {
                    console.warn('Failed to unregister service worker:', error);
                });
            });
        });

        // Clear all caches
        if ('caches' in window) {
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName).then(() => {
                        console.log(`Cache "${cacheName}" cleared`);
                    }).catch((error) => {
                        console.warn(`Failed to clear cache "${cacheName}":`, error);
                    });
                });
            });
        }

        // Prevent any new service worker registration
        const originalRegister = navigator.serviceWorker.register;
        navigator.serviceWorker.register = () => {
            console.log('Service worker registration blocked in development');
            return Promise.reject(new Error('Service worker disabled in development'));
        };

        // If there's still a service worker trying to run, register a minimal one
        setTimeout(() => {
            navigator.serviceWorker.register('/sw-dev.js')
                .then(() => {
                    console.log('Development service worker registered (minimal functionality)');
                })
                .catch(() => {
                    console.log('No service worker needed in development');
                });
        }, 1000);
    } else {
        // Production or explicitly enabled - register service worker
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
