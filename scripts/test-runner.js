#!/usr/bin/env node

/**
 * Comprehensive test runner for TypeScript tests
 * Provides different test modes and configurations
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const args = process.argv.slice(2);
const command = args[0] || 'test';

// Test configurations
const testConfigs = {
    unit: {
        description: 'Run unit tests only',
        command: 'vitest run src/tests/components src/tests/utils src/tests/lib src/tests/types',
        coverage: true,
    },
    integration: {
        description: 'Run integration tests only',
        command: 'vitest run src/tests/api src/tests/contexts src/tests/hooks',
        coverage: true,
    },
    e2e: {
        description: 'Run end-to-end tests',
        command: 'playwright test',
        coverage: false,
    },
    all: {
        description: 'Run all tests',
        command: 'vitest run',
        coverage: true,
    },
    watch: {
        description: 'Run tests in watch mode',
        command: 'vitest',
        coverage: false,
    },
    coverage: {
        description: 'Run tests with coverage report',
        command: 'vitest run --coverage',
        coverage: true,
    },
    ui: {
        description: 'Run tests with UI',
        command: 'vitest --ui',
        coverage: false,
    },
    typecheck: {
        description: 'Run TypeScript type checking',
        command: 'tsc --noEmit',
        coverage: false,
    },
    lint: {
        description: 'Run ESLint',
        command: 'eslint src --ext .ts,.tsx',
        coverage: false,
    },
    format: {
        description: 'Format code with Prettier',
        command: 'prettier --write src/**/*.{ts,tsx}',
        coverage: false,
    },
    clean: {
        description: 'Clean test artifacts',
        command: 'rm -rf coverage dist .vitest',
        coverage: false,
    },
};

// Helper functions
function log(message, type = 'info') {
    const colors = {
        info: '\x1b[36m', // Cyan
        success: '\x1b[32m', // Green
        error: '\x1b[31m', // Red
        warning: '\x1b[33m', // Yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}${message}${reset}`);
}

function runCommand(cmd, description) {
    log(`\n🚀 ${description}`, 'info');
    log(`Running: ${cmd}`, 'info');

    try {
        execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
        log(`✅ ${description} completed successfully`, 'success');
        return true;
    } catch {
        log(`❌ ${description} failed`, 'error');
        return false;
    }
}

function checkDependencies() {
    const requiredFiles = [
        'package.json',
        'vitest.config.ts',
        'tsconfig.json',
    ];

    const missingFiles = requiredFiles.filter(file => !existsSync(file));

    if (missingFiles.length > 0) {
        log(`Missing required files: ${missingFiles.join(', ')}`, 'error');
        return false;
    }

    return true;
}

function showHelp() {
    log('\n📋 Available Commands:', 'info');
    log('====================', 'info');

    Object.entries(testConfigs).forEach(([key, config]) => {
        log(`  ${key.padEnd(12)} - ${config.description}`, 'info');
    });

    log('\n📖 Usage Examples:', 'info');
    log('==================', 'info');
    log('  npm run test:unit        # Run unit tests only', 'info');
    log('  npm run test:integration # Run integration tests only', 'info');
    log('  npm run test:coverage    # Run tests with coverage', 'info');
    log('  npm run test:watch       # Run tests in watch mode', 'info');
    log('  npm run test:ui          # Run tests with UI', 'info');
    log('  npm run test:all         # Run all tests', 'info');
    log('  npm run test:typecheck   # Run TypeScript type checking', 'info');
    log('  npm run test:lint        # Run ESLint', 'info');
    log('  npm run test:format      # Format code', 'info');
    log('  npm run test:clean       # Clean test artifacts', 'info');

    log('\n🔧 Test Configuration:', 'info');
    log('======================', 'info');
    log('  Test files: src/**/*.{test,spec}.{js,ts,tsx}', 'info');
    log('  Setup file: src/tests/setup.ts', 'info');
    log('  Config file: vitest.config.ts', 'info');
    log('  Coverage threshold: 80%', 'info');

    log('\n📊 Coverage Reports:', 'info');
    log('====================', 'info');
    log('  Text: Console output', 'info');
    log('  JSON: coverage/coverage-final.json', 'info');
    log('  HTML: coverage/index.html', 'info');
}

function runTestSuite() {
    log('🧪 TypeScript Test Suite', 'info');
    log('========================', 'info');

    if (!checkDependencies()) {
        process.exit(1);
    }

    const config = testConfigs[command];

    if (!config) {
        log(`Unknown command: ${command}`, 'error');
        showHelp();
        process.exit(1);
    }

    const success = runCommand(config.command, config.description);

    if (config.coverage && success) {
        log('\n📊 Coverage Report Generated:', 'success');
        log('  - Console: Check output above', 'info');
        log('  - HTML: Open coverage/index.html', 'info');
        log('  - JSON: Check coverage/coverage-final.json', 'info');
    }

    if (success) {
        log('\n🎉 All tests completed successfully!', 'success');
    } else {
        log('\n💥 Some tests failed. Please check the output above.', 'error');
        process.exit(1);
    }
}

// Main execution
if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
} else {
    runTestSuite();
}