/**
 * Comprehensive test configuration for TypeScript tests
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/tests/setup.tsx'],
        include: [
            'src/**/*.{test,spec}.{js,ts,tsx}',
            'src/tests/**/*.{test,spec}.{js,ts,tsx}',
        ],
        exclude: [
            'node_modules',
            'dist',
            '.git',
            '.cache',
            'coverage',
            'src/tests/setup.ts',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            include: [
                'src/**/*.{js,ts,tsx}',
            ],
            exclude: [
                'src/**/*.{test,spec}.{js,ts,tsx}',
                'src/tests/**/*',
                'src/**/*.d.ts',
                'src/vite-env.d.ts',
                'src/main.tsx',
                'src/App.tsx',
                'src/pages/index.tsx',
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
            },
        },
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
