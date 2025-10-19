import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { sentryVitePlugin } from '@sentry/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

// Custom plugin to fix MIME types
const mimeTypeFixPlugin = () => ({
    name: 'mime-type-fix',
    configureServer(server) {
        // Hook into Vite's transform middleware
        server.middlewares.use((req, res, next) => {
            const originalWriteHead = res.writeHead;
            res.writeHead = function(statusCode, statusMessage, headers) {
                if (req.url && req.url.match(/\.(js|jsx|ts|tsx)(\?.*)?$/)) {
                    if (typeof headers === 'object') {
                        headers['Content-Type'] = 'application/javascript; charset=utf-8';
                    } else if (typeof statusMessage === 'object') {
                        statusMessage['Content-Type'] = 'application/javascript; charset=utf-8';
                    }
                }
                return originalWriteHead.call(this, statusCode, statusMessage, headers);
            };

            const originalSetHeader = res.setHeader;
            res.setHeader = function(name, value) {
                if (name.toLowerCase() === 'content-type' && req.url && req.url.match(/\.(js|jsx|ts|tsx)(\?.*)?$/)) {
                    value = 'application/javascript; charset=utf-8';
                }
                return originalSetHeader.call(this, name, value);
            };

            next();
        });
    }
});

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        mimeTypeFixPlugin(),
        react({
            include: "**/*.{jsx,tsx}",
            jsxRuntime: 'automatic',
            jsxImportSource: 'react',
            babel: {
                plugins: []
            }
        }),
        // Sentry plugin for source maps and release tracking (disabled for development)
        // Uncomment and configure when deploying to production
        // sentryVitePlugin({
        //     org: process.env.SENTRY_ORG,
        //     project: process.env.SENTRY_PROJECT,
        //     authToken: process.env.SENTRY_AUTH_TOKEN,
        //     sourcemaps: {
        //         assets: './dist/**',
        //         ignore: ['node_modules'],
        //     },
        //     release: {
        //         name: process.env.VITE_APP_VERSION || '1.0.0',
        //         setCommits: {
        //             auto: true,
        //         },
        //     },
        //     disable: process.env.NODE_ENV !== 'production',
        // }),
    ],
    server: {
        port: 5173, // Vite's default development port
        strictPort: false, // Allow fallback to next available port
        host: true, // Allow external connections
        allowedHosts: true,
        fs: {
            strict: false
        },
        middlewareMode: false,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Last-Modified': new Date().toUTCString()
        },
        // Ensure proper MIME type handling
        hmr: {
            overlay: true
        },
        // SPA fallback - serve index.html for all routes
        historyApiFallback: true,
        // Enable compression
        compress: true,
        // Optimize file watching
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
        },
        // Force correct MIME types for JavaScript modules
        cors: true,
        // Additional middleware for MIME type fixes
        configureServer: (server) => {
            server.middlewares.use((req, res, next) => {
                // Force correct MIME type for all JS/TS files
                if (req.url && req.url.match(/\.(js|jsx|ts|tsx)(\?.*)?$/)) {
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                }
                // Handle service worker requests
                if (req.url === '/sw.js') {
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    res.setHeader('Service-Worker-Allowed', '/');
                }
                // Handle manifest requests
                if (req.url === '/manifest.json') {
                    res.setHeader('Content-Type', 'application/json; charset=utf-8');
                }
                next();
            });
        }
    },
    // Explicit MIME type configuration
    define: {
        __VITE_MIME_FIX__: true
    },
    // Force JSX files to be treated as JavaScript modules
    assetsInclude: [],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src',
                import.meta.url)),
            'react': fileURLToPath(new URL('./node_modules/react',
                import.meta.url)),
            'react-dom': fileURLToPath(new URL('./node_modules/react-dom',
                import.meta.url)),
        },
        extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
                '.jsx': 'jsx',
            },
        },
        include: [
            'react',
            'react-dom',
            'react-dom/client',
            'react-router-dom',
            '@tanstack/react-query',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'clsx',
            'tailwind-merge',
            'lucide-react',
            'date-fns',
            '@radix-ui/react-tabs',
            '@radix-ui/react-slot',
            'class-variance-authority'
        ],
        exclude: ['@base44/sdk'],
        force: true
    },
    build: {
        // Enable source maps for production debugging
        sourcemap: true,

        // Optimize chunk splitting
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Core React libraries
                    if (id.includes('react') || id.includes('react-dom')) {
                        return 'vendor-react';
                    }

                    // Router
                    if (id.includes('react-router')) {
                        return 'vendor-router';
                    }

                    // Query management
                    if (id.includes('@tanstack/react-query')) {
                        return 'vendor-query';
                    }

                    // UI Components - split by usage frequency
                    if (id.includes('@radix-ui')) {
                        if (id.includes('dialog') || id.includes('dropdown') || id.includes('popover')) {
                            return 'vendor-ui-core';
                        }
                        if (id.includes('accordion') || id.includes('tabs') || id.includes('collapsible')) {
                            return 'vendor-ui-layout';
                        }
                        if (id.includes('checkbox') || id.includes('radio') || id.includes('switch')) {
                            return 'vendor-ui-inputs';
                        }
                        return 'vendor-ui-misc';
                    }

                    // Form handling
                    if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
                        return 'vendor-forms';
                    }

                    // Utilities
                    if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
                        return 'vendor-utils-core';
                    }

                    // Icons and date utilities
                    if (id.includes('lucide-react') || id.includes('date-fns')) {
                        return 'vendor-icons-dates';
                    }

                    // Charts and visualization
                    if (id.includes('recharts')) {
                        return 'vendor-charts';
                    }

                    // Animation
                    if (id.includes('framer-motion')) {
                        return 'vendor-motion';
                    }

                    // PDF and document generation
                    if (id.includes('jspdf') || id.includes('html2canvas')) {
                        return 'vendor-documents';
                    }

                    // WebRTC and communication
                    if (id.includes('peerjs') || id.includes('simple-peer')) {
                        return 'vendor-webrtc';
                    }

                    // Monitoring and analytics
                    if (id.includes('@sentry')) {
                        return 'vendor-monitoring';
                    }

                    // Application pages - split by feature
                    if (id.includes('/pages/')) {
                        if (id.includes('Dashboard') || id.includes('Patient')) {
                            return 'pages-core';
                        }
                        if (id.includes('Lab') || id.includes('Prescription') || id.includes('Pharmacy')) {
                            return 'pages-clinical';
                        }
                        if (id.includes('Billing') || id.includes('Financial')) {
                            return 'pages-financial';
                        }
                        if (id.includes('Admin') || id.includes('Settings') || id.includes('User')) {
                            return 'pages-admin';
                        }
                        return 'pages-misc';
                    }

                    // Application components
                    if (id.includes('/components/')) {
                        if (id.includes('/ui/')) {
                            return 'components-ui';
                        }
                        if (id.includes('/dashboard/') || id.includes('/patient')) {
                            return 'components-core';
                        }
                        return 'components-misc';
                    }
                },
                // Optimize chunk file names
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
                    return `js/${facadeModuleId}-[hash].js`;
                },
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(css)$/.test(assetInfo.name)) {
                        return `css/[name]-[hash].${ext}`;
                    }
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
                        return `images/[name]-[hash].${ext}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                        return `fonts/[name]-[hash].${ext}`;
                    }
                    return `assets/[name]-[hash].${ext}`;
                }
            }
        },

        // Optimize build performance
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
        },

        // Set chunk size warning limit
        chunkSizeWarningLimit: 1000,

        // Enable CSS code splitting
        cssCodeSplit: true,

        // Optimize asset handling
        assetsInlineLimit: 4096, // 4kb
    },

    // Optimize dependencies (merged above)

    // Enable experimental features for better performance
    experimental: {
        renderBuiltUrl(filename, { hostType }) {
            if (hostType === 'js') {
                return { js: `/${filename}` }
            } else {
                return { relative: true }
            }
        }
    }
})