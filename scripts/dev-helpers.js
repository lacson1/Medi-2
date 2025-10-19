#!/usr/bin/env node

/**
 * Development Helpers for MediFlow Frontend
 * Enhanced development workflow, monitoring, and debugging utilities
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color utilities
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
    console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
    console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
    console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
    console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Development commands
const commands = {
    'dev': {
        description: 'Start development server with enhanced monitoring',
        usage: 'node scripts/dev-helpers.js dev',
        action: startDevServer
    },
    'dev-debug': {
        description: 'Start development server with debugging enabled',
        usage: 'node scripts/dev-helpers.js dev-debug',
        action: startDevServerDebug
    },
    'dev-mock': {
        description: 'Start development server with mock data',
        usage: 'node scripts/dev-helpers.js dev-mock',
        action: startDevServerMock
    },
    'watch': {
        description: 'Watch files and run commands on changes',
        usage: 'node scripts/dev-helpers.js watch [command]',
        action: watchFiles
    },
    'monitor': {
        description: 'Monitor application performance and errors',
        usage: 'node scripts/dev-helpers.js monitor',
        action: monitorApp
    },
    'debug': {
        description: 'Debug application issues',
        usage: 'node scripts/dev-helpers.js debug',
        action: debugApp
    },
    'profile': {
        description: 'Profile application performance',
        usage: 'node scripts/dev-helpers.js profile',
        action: profileApp
    },
    'check-health': {
        description: 'Check application health',
        usage: 'node scripts/dev-helpers.js check-health',
        action: checkHealth
    },
    'setup-dev': {
        description: 'Setup development environment',
        usage: 'node scripts/dev-helpers.js setup-dev',
        action: setupDev
    },
    'reset-dev': {
        description: 'Reset development environment',
        usage: 'node scripts/dev-helpers.js reset-dev',
        action: resetDev
    },
    'help': {
        description: 'Show help message',
        usage: 'node scripts/dev-helpers.js help',
        action: showHelp
    }
};

// Start development server
function startDevServer() {
    logInfo('Starting development server with enhanced monitoring...');

    // Set development environment variables
    process.env.NODE_ENV = 'development';
    process.env.VITE_NODE_ENV = 'development';
    process.env.VITE_ENABLE_DEBUG_MODE = 'true';

    try {
        // Start the dev server
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true,
            env: {...process.env }
        });

        // Handle process events
        devProcess.on('error', (error) => {
            logError(`Failed to start dev server: ${error.message}`);
        });

        devProcess.on('exit', (code) => {
            if (code !== 0) {
                logError(`Dev server exited with code ${code}`);
            }
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            logInfo('Shutting down development server...');
            devProcess.kill('SIGINT');
            process.exit(0);
        });

    } catch (error) {
        logError(`Failed to start dev server: ${error.message}`);
    }
}

// Start development server with debugging
function startDevServerDebug() {
    logInfo('Starting development server with debugging enabled...');

    // Set debug environment variables
    process.env.NODE_ENV = 'development';
    process.env.VITE_NODE_ENV = 'development';
    process.env.VITE_ENABLE_DEBUG_MODE = 'true';
    process.env.VITE_DEBUG_LEVEL = 'verbose';
    process.env.VITE_ENABLE_DEVTOOLS = 'true';

    try {
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true,
            env: {...process.env }
        });

        logInfo('Debug mode enabled. Check browser dev tools for additional logging.');

        devProcess.on('error', (error) => {
            logError(`Failed to start debug server: ${error.message}`);
        });

    } catch (error) {
        logError(`Failed to start debug server: ${error.message}`);
    }
}

// Start development server with mock data
function startDevServerMock() {
    logInfo('Starting development server with mock data...');

    // Set mock environment variables
    process.env.NODE_ENV = 'development';
    process.env.VITE_NODE_ENV = 'development';
    process.env.VITE_USE_MOCK_DATA = 'true';
    process.env.VITE_ENABLE_DEBUG_MODE = 'true';

    try {
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true,
            env: {...process.env }
        });

        logInfo('Mock data mode enabled. API calls will use mock data.');

        devProcess.on('error', (error) => {
            logError(`Failed to start mock server: ${error.message}`);
        });

    } catch (error) {
        logError(`Failed to start mock server: ${error.message}`);
    }
}

// Watch files and run commands
function watchFiles(command = 'npm run test') {
    logInfo(`Watching files and running: ${command}`);

    const watchPaths = [
        'src',
        'public',
        'package.json',
        'vite.config.js',
        'tailwind.config.js',
        'tsconfig.json'
    ];

    const watchers = [];

    watchPaths.forEach(path => {
        const fullPath = join(projectRoot, path);

        if (existsSync(fullPath)) {
            const watcher = watch(fullPath, { recursive: true }, (eventType, filename) => {
                if (filename) {
                    logInfo(`File changed: ${filename}`);

                    try {
                        execSync(command, {
                            stdio: 'inherit',
                            cwd: projectRoot
                        });
                        logSuccess(`Command completed: ${command}`);
                    } catch (error) {
                        logError(`Command failed: ${error.message}`);
                    }
                }
            });

            watchers.push(watcher);
            logSuccess(`Watching: ${path}`);
        } else {
            logWarning(`Path not found: ${path}`);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        logInfo('Stopping file watchers...');
        watchers.forEach(watcher => watcher.close());
        process.exit(0);
    });
}

// Monitor application
function monitorApp() {
    logInfo('Starting application monitoring...');

    const monitoringScript = `
        // Monitor performance metrics
        const performanceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'measure') {
                    console.log(\`Performance: \${entry.name} - \${entry.duration}ms\`);
                }
            });
        });
        
        performanceObserver.observe({ entryTypes: ['measure'] });
        
        // Monitor errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
        
        // Monitor memory usage
        setInterval(() => {
            if (performance.memory) {
                console.log('Memory usage:', {
                    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
                });
            }
        }, 10000);
    `;

    const monitoringPath = join(projectRoot, 'src/lib/monitoring.js');
    writeFileSync(monitoringPath, monitoringScript);

    logSuccess('Monitoring script created. Import it in your main app file.');
    logInfo('Monitoring features:');
    logInfo('  - Performance metrics');
    logInfo('  - Error tracking');
    logInfo('  - Memory usage');
    logInfo('  - Network requests');
}

// Debug application
function debugApp() {
    logInfo('Starting application debugging...');

    // Check for common issues
    const issues = [];

    // Check environment variables
    const requiredEnvVars = ['VITE_API_BASE_URL'];
    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            issues.push(`Missing environment variable: ${varName}`);
        }
    });

    // Check for TypeScript errors
    try {
        execSync('npm run type-check', { cwd: projectRoot });
    } catch (error) {
        issues.push('TypeScript type errors detected');
    }

    // Check for linting errors
    try {
        execSync('npm run lint', { cwd: projectRoot });
    } catch (error) {
        issues.push('ESLint errors detected');
    }

    // Check for test failures
    try {
        execSync('npm run test', { cwd: projectRoot });
    } catch (error) {
        issues.push('Test failures detected');
    }

    // Report issues
    if (issues.length === 0) {
        logSuccess('No issues detected!');
    } else {
        logWarning('Issues detected:');
        issues.forEach(issue => {
            logError(`  - ${issue}`);
        });
    }

    // Generate debug report
    const debugReport = {
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        issues: issues,
        environment: {
            NODE_ENV: process.env.NODE_ENV,
            VITE_NODE_ENV: process.env.VITE_NODE_ENV
        }
    };

    const reportPath = join(projectRoot, 'debug-report.json');
    writeFileSync(reportPath, JSON.stringify(debugReport, null, 2));

    logSuccess(`Debug report generated: ${reportPath}`);
}

// Profile application
function profileApp() {
    logInfo('Starting application profiling...');

    // Create profiling script
    const profilingScript = `
        // Performance profiling utilities
        export const profiler = {
            start: (name) => {
                performance.mark(\`\${name}-start\`);
            },
            
            end: (name) => {
                performance.mark(\`\${name}-end\`);
                performance.measure(name, \`\${name}-start\`, \`\${name}-end\`);
            },
            
            measure: (name, fn) => {
                const start = performance.now();
                const result = fn();
                const end = performance.now();
                console.log(\`\${name}: \${end - start}ms\`);
                return result;
            },
            
            async measureAsync: async (name, fn) => {
                const start = performance.now();
                const result = await fn();
                const end = performance.now();
                console.log(\`\${name}: \${end - start}ms\`);
                return result;
            }
        };
        
        // Component render profiling
        export const withProfiling = (Component, name) => {
            return function ProfiledComponent(props) {
                profiler.start(\`render-\${name}\`);
                const result = Component(props);
                profiler.end(\`render-\${name}\`);
                return result;
            };
        };
        
        // Hook profiling
        export const useProfiling = (name) => {
            const start = () => profiler.start(name);
            const end = () => profiler.end(name);
            return { start, end };
        };
    `;

    const profilingPath = join(projectRoot, 'src/lib/profiling.ts');
    writeFileSync(profilingPath, profilingScript);

    logSuccess('Profiling utilities created. Import and use them in your components.');
    logInfo('Available profiling features:');
    logInfo('  - Performance timing');
    logInfo('  - Component render profiling');
    logInfo('  - Hook profiling');
    logInfo('  - Async operation profiling');
}

// Check application health
function checkHealth() {
    logInfo('Checking application health...');

    const healthChecks = [{
            name: 'Dependencies',
            check: () => {
                try {
                    execSync('npm list --depth=0', { cwd: projectRoot });
                    return true;
                } catch {
                    return false;
                }
            }
        },
        {
            name: 'TypeScript',
            check: () => {
                try {
                    execSync('npm run type-check', { cwd: projectRoot });
                    return true;
                } catch {
                    return false;
                }
            }
        },
        {
            name: 'Linting',
            check: () => {
                try {
                    execSync('npm run lint', { cwd: projectRoot });
                    return true;
                } catch {
                    return false;
                }
            }
        },
        {
            name: 'Tests',
            check: () => {
                try {
                    execSync('npm run test', { cwd: projectRoot });
                    return true;
                } catch {
                    return false;
                }
            }
        },
        {
            name: 'Build',
            check: () => {
                try {
                    execSync('npm run build', { cwd: projectRoot });
                    return true;
                } catch {
                    return false;
                }
            }
        }
    ];

    let allHealthy = true;

    healthChecks.forEach(({ name, check }) => {
        if (check()) {
            logSuccess(`${name}: ✓`);
        } else {
            logError(`${name}: ✗`);
            allHealthy = false;
        }
    });

    if (allHealthy) {
        logSuccess('Application is healthy!');
    } else {
        logWarning('Some health checks failed. Review the issues above.');
    }
}

// Setup development environment
function setupDev() {
    logInfo('Setting up development environment...');

    try {
        // Install dependencies
        logInfo('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit', cwd: projectRoot });

        // Copy environment file
        const envExamplePath = join(projectRoot, 'env.example');
        const envPath = join(projectRoot, '.env');

        if (existsSync(envExamplePath) && !existsSync(envPath)) {
            logInfo('Creating .env file...');
            execSync(`cp "${envExamplePath}" "${envPath}"`, { cwd: projectRoot });
        }

        // Run initial checks
        logInfo('Running initial checks...');
        execSync('npm run type-check', { cwd: projectRoot });
        execSync('npm run lint', { cwd: projectRoot });

        logSuccess('Development environment setup completed!');
        logInfo('Next steps:');
        logInfo('  1. Edit .env file with your configuration');
        logInfo('  2. Run "npm run dev" to start development server');
        logInfo('  3. Run "npm run test" to run tests');

    } catch (error) {
        logError(`Setup failed: ${error.message}`);
    }
}

// Reset development environment
function resetDev() {
    logInfo('Resetting development environment...');

    try {
        // Clean caches
        logInfo('Cleaning caches...');
        execSync('rm -rf node_modules/.cache', { cwd: projectRoot });
        execSync('rm -rf dist', { cwd: projectRoot });
        execSync('rm -rf coverage', { cwd: projectRoot });
        execSync('rm -rf .vitest', { cwd: projectRoot });

        // Reinstall dependencies
        logInfo('Reinstalling dependencies...');
        execSync('rm -rf node_modules', { cwd: projectRoot });
        execSync('npm install', { stdio: 'inherit', cwd: projectRoot });

        logSuccess('Development environment reset completed!');

    } catch (error) {
        logError(`Reset failed: ${error.message}`);
    }
}

// Show help
function showHelp() {
    log(`${colors.bright}MediFlow Development Helpers${colors.reset}`);
    log(`${colors.dim}Available commands:${colors.reset}\n`);

    Object.entries(commands).forEach(([command, config]) => {
        log(`${colors.green}${command}${colors.reset}`);
        log(`  ${colors.dim}${config.description}${colors.reset}`);
        log(`  ${colors.yellow}Usage: ${config.usage}${colors.reset}\n`);
    });
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);

    if (!command || !commands[command]) {
        logError(`Unknown command: ${command || 'none'}`);
        showHelp();
        process.exit(1);
    }

    try {
        commands[command].action(...commandArgs);
    } catch (error) {
        logError(`Command failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (
    import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { commands };