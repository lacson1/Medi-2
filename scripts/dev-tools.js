#!/usr/bin/env node

/**
 * Development Tools for MediFlow Frontend
 * Provides utilities for development workflow, code generation, and maintenance
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color utilities for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
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

// Command line interface
const commands = {
    'generate-component': {
        description: 'Generate a new React component with TypeScript',
        usage: 'node scripts/dev-tools.js generate-component <ComponentName> [path]',
        action: generateComponent
    },
    'generate-page': {
        description: 'Generate a new page component',
        usage: 'node scripts/dev-tools.js generate-page <PageName> [path]',
        action: generatePage
    },
    'generate-hook': {
        description: 'Generate a new custom hook',
        usage: 'node scripts/dev-tools.js generate-hook <HookName> [path]',
        action: generateHook
    },
    'analyze-bundle': {
        description: 'Analyze bundle size and dependencies',
        usage: 'node scripts/dev-tools.js analyze-bundle',
        action: analyzeBundle
    },
    'check-deps': {
        description: 'Check for outdated dependencies',
        usage: 'node scripts/dev-tools.js check-deps',
        action: checkDependencies
    },
    'clean-cache': {
        description: 'Clean all caches and temporary files',
        usage: 'node scripts/dev-tools.js clean-cache',
        action: cleanCache
    },
    'validate-env': {
        description: 'Validate environment configuration',
        usage: 'node scripts/dev-tools.js validate-env',
        action: validateEnvironment
    },
    'generate-icons': {
        description: 'Generate icon components from SVG files',
        usage: 'node scripts/dev-tools.js generate-icons [path]',
        action: generateIcons
    },
    'lint-fix': {
        description: 'Run ESLint and auto-fix issues',
        usage: 'node scripts/dev-tools.js lint-fix',
        action: lintFix
    },
    'type-check': {
        description: 'Run TypeScript type checking',
        usage: 'node scripts/dev-tools.js type-check',
        action: typeCheck
    },
    'dev-server': {
        description: 'Start development server with enhanced monitoring',
        usage: 'node scripts/dev-tools.js dev-server',
        action: startDevServer
    },
    'build-analyze': {
        description: 'Build and analyze the application bundle',
        usage: 'node scripts/dev-tools.js build-analyze',
        action: buildAndAnalyze
    },
    'test-watch': {
        description: 'Run tests in watch mode with enhanced output',
        usage: 'node scripts/dev-tools.js test-watch',
        action: testWatch
    },
    'help': {
        description: 'Show this help message',
        usage: 'node scripts/dev-tools.js help',
        action: showHelp
    }
};

// Component generation
function generateComponent(componentName, path = 'src/components') {
    if (!componentName) {
        logError('Component name is required');
        return;
    }

    const componentPath = join(projectRoot, path);
    const componentDir = join(componentPath, componentName);
    const componentFile = join(componentDir, `${componentName}.tsx`);
    const indexFile = join(componentDir, 'index.ts');
    const testFile = join(componentDir, `${componentName}.test.tsx`);

    // Create directory if it doesn't exist
    if (!existsSync(componentDir)) {
        mkdirSync(componentDir, { recursive: true });
    }

    // Generate component template
    const componentTemplate = `import React from 'react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
    className?: string;
    children?: React.ReactNode;
}

export function ${componentName}({ className, children, ...props }: ${componentName}Props) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}

export default ${componentName};
`;

    // Generate test template
    const testTemplate = `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
    it('renders without crashing', () => {
        render(<${componentName}>Test content</${componentName}>);
        expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <${componentName} className="custom-class">Test</${componentName}>
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
`;

    // Generate index file
    const indexTemplate = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}';
`;

    try {
        writeFileSync(componentFile, componentTemplate);
        writeFileSync(testFile, testTemplate);
        writeFileSync(indexFile, indexTemplate);

        logSuccess(`Generated ${componentName} component at ${componentDir}`);
        logInfo(`Files created:`);
        logInfo(`  - ${componentFile}`);
        logInfo(`  - ${testFile}`);
        logInfo(`  - ${indexFile}`);
    } catch (error) {
        logError(`Failed to generate component: ${error.message}`);
    }
}

// Page generation
function generatePage(pageName, path = 'src/pages') {
    if (!pageName) {
        logError('Page name is required');
        return;
    }

    const pagePath = join(projectRoot, path);
    const pageFile = join(pagePath, `${pageName}.tsx`);
    const testFile = join(pagePath, `${pageName}.test.tsx`);

    const pageTemplate = `import React from 'react';
import { cn } from '@/lib/utils';

interface ${pageName}Props {
    className?: string;
}

export function ${pageName}({ className }: ${pageName}Props) {
    return (
        <div className={cn('container mx-auto px-4 py-8', className)}>
            <h1 className="text-3xl font-bold mb-6">${pageName}</h1>
            <div className="space-y-4">
                {/* Page content goes here */}
            </div>
        </div>
    );
}

export default ${pageName};
`;

    const testTemplate = `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ${pageName} } from './${pageName}';

describe('${pageName}', () => {
    it('renders page title', () => {
        render(<${pageName} />);
        expect(screen.getByText('${pageName}')).toBeInTheDocument();
    });
});
`;

    try {
        writeFileSync(pageFile, pageTemplate);
        writeFileSync(testFile, testTemplate);

        logSuccess(`Generated ${pageName} page at ${pageFile}`);
        logInfo(`Files created:`);
        logInfo(`  - ${pageFile}`);
        logInfo(`  - ${testFile}`);
    } catch (error) {
        logError(`Failed to generate page: ${error.message}`);
    }
}

// Hook generation
function generateHook(hookName, path = 'src/hooks') {
    if (!hookName) {
        logError('Hook name is required');
        return;
    }

    const hookPath = join(projectRoot, path);
    const hookFile = join(hookPath, `use${hookName}.ts`);
    const testFile = join(hookPath, `use${hookName}.test.ts`);

    const hookTemplate = `import { useState, useEffect } from 'react';

interface Use${hookName}Options {
    // Add options interface here
}

interface Use${hookName}Return {
    // Add return type interface here
}

export function use${hookName}(options?: Use${hookName}Options): Use${hookName}Return {
    const [state, setState] = useState(null);

    useEffect(() => {
        // Hook logic goes here
    }, []);

    return {
        // Return hook values here
    };
}

export default use${hookName};
`;

    const testTemplate = `import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { use${hookName} } from './use${hookName}';

describe('use${hookName}', () => {
    it('should work correctly', () => {
        const { result } = renderHook(() => use${hookName}());
        // Add test assertions here
        expect(result.current).toBeDefined();
    });
});
`;

    try {
        writeFileSync(hookFile, hookTemplate);
        writeFileSync(testFile, testTemplate);

        logSuccess(`Generated use${hookName} hook at ${hookFile}`);
        logInfo(`Files created:`);
        logInfo(`  - ${hookFile}`);
        logInfo(`  - ${testFile}`);
    } catch (error) {
        logError(`Failed to generate hook: ${error.message}`);
    }
}

// Bundle analysis
function analyzeBundle() {
    logInfo('Analyzing bundle...');

    try {
        // Build the application first
        logInfo('Building application...');
        execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });

        // Check if bundle analyzer is available
        try {
            execSync('npx vite-bundle-analyzer dist', { stdio: 'inherit', cwd: projectRoot });
        } catch {
            logWarning('Bundle analyzer not available. Install with: npm install -D vite-bundle-analyzer');

            // Fallback: analyze dist folder manually
            const distPath = join(projectRoot, 'dist');
            if (existsSync(distPath)) {
                analyzeDistFolder(distPath);
            }
        }
    } catch (error) {
        logError(`Bundle analysis failed: ${error.message}`);
    }
}

function analyzeDistFolder(distPath) {
    logInfo('Analyzing dist folder...');

    function getFileSize(filePath) {
        const stats = statSync(filePath);
        return stats.size;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function analyzeDirectory(dirPath, prefix = '') {
        const items = readdirSync(dirPath);

        items.forEach(item => {
            const itemPath = join(dirPath, item);
            const stats = statSync(itemPath);

            if (stats.isDirectory()) {
                log(`${prefix}📁 ${item}/`);
                analyzeDirectory(itemPath, prefix + '  ');
            } else {
                const size = getFileSize(itemPath);
                log(`${prefix}📄 ${item} (${formatBytes(size)})`);
            }
        });
    }

    analyzeDirectory(distPath);
}

// Dependency checking
function checkDependencies() {
    logInfo('Checking for outdated dependencies...');

    try {
        execSync('npm outdated', { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
        if (error.status === 0) {
            logSuccess('All dependencies are up to date!');
        } else {
            logWarning('Some dependencies are outdated. Consider updating them.');
        }
    }
}

// Cache cleaning
function cleanCache() {
    logInfo('Cleaning caches and temporary files...');

    const cachePaths = [
        'node_modules/.cache',
        'dist',
        'coverage',
        '.vitest',
        'test-results',
        '.next',
        '.turbo'
    ];

    cachePaths.forEach(path => {
        const fullPath = join(projectRoot, path);
        if (existsSync(fullPath)) {
            try {
                execSync(`rm -rf "${fullPath}"`, { cwd: projectRoot });
                logSuccess(`Cleaned ${path}`);
            } catch (error) {
                logWarning(`Failed to clean ${path}: ${error.message}`);
            }
        }
    });

    logSuccess('Cache cleaning completed!');
}

// Environment validation
function validateEnvironment() {
    logInfo('Validating environment configuration...');

    const envExamplePath = join(projectRoot, 'env.example');
    const envPath = join(projectRoot, '.env');

    if (!existsSync(envExamplePath)) {
        logWarning('No env.example file found');
        return;
    }

    if (!existsSync(envPath)) {
        logWarning('.env file not found. Copy from env.example');
        return;
    }

    const envExample = readFileSync(envExamplePath, 'utf8');
    const env = readFileSync(envPath, 'utf8');

    const requiredVars = envExample
        .split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => line.split('=')[0])
        .filter(Boolean);

    const missingVars = requiredVars.filter(varName => {
        const regex = new RegExp(`^${varName}=`);
        return !env.split('\n').some(line => regex.test(line));
    });

    if (missingVars.length === 0) {
        logSuccess('All required environment variables are set');
    } else {
        logWarning(`Missing environment variables: ${missingVars.join(', ')}`);
    }
}

// Icon generation
function generateIcons(svgPath = 'public/icons') {
    logInfo('Generating icon components...');

    const iconsPath = join(projectRoot, svgPath);
    const componentsPath = join(projectRoot, 'src/components/icons');

    if (!existsSync(iconsPath)) {
        logError(`SVG icons directory not found: ${iconsPath}`);
        return;
    }

    if (!existsSync(componentsPath)) {
        mkdirSync(componentsPath, { recursive: true });
    }

    const svgFiles = readdirSync(iconsPath).filter(file => file.endsWith('.svg'));

    if (svgFiles.length === 0) {
        logWarning('No SVG files found in icons directory');
        return;
    }

    svgFiles.forEach(svgFile => {
        const iconName = basename(svgFile, '.svg')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        const iconComponent = `${iconName}Icon`;
        const componentFile = join(componentsPath, `${iconComponent}.tsx`);

        const componentTemplate = `import React from 'react';
import { cn } from '@/lib/utils';

interface ${iconComponent}Props {
    className?: string;
    size?: number;
}

export function ${iconComponent}({ className, size = 24 }: ${iconComponent}Props) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('', className)}
        >
            {/* SVG content will be inserted here */}
        </svg>
    );
}

export default ${iconComponent};
`;

        try {
            writeFileSync(componentFile, componentTemplate);
            logSuccess(`Generated ${iconComponent} component`);
        } catch (error) {
            logError(`Failed to generate ${iconComponent}: ${error.message}`);
        }
    });
}

// Lint fixing
function lintFix() {
    logInfo('Running ESLint with auto-fix...');

    try {
        execSync('npm run lint -- --fix', { stdio: 'inherit', cwd: projectRoot });
        logSuccess('ESLint auto-fix completed');
    } catch (error) {
        logError(`ESLint failed: ${error.message}`);
    }
}

// Type checking
function typeCheck() {
    logInfo('Running TypeScript type checking...');

    try {
        execSync('npm run type-check', { stdio: 'inherit', cwd: projectRoot });
        logSuccess('TypeScript type checking passed');
    } catch (error) {
        logError(`TypeScript type checking failed: ${error.message}`);
    }
}

// Development server
function startDevServer() {
    logInfo('Starting development server with enhanced monitoring...');

    try {
        spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true
        });
    } catch (error) {
        logError(`Failed to start dev server: ${error.message}`);
    }
}

// Build and analyze
function buildAndAnalyze() {
    logInfo('Building and analyzing application...');

    try {
        execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
        logSuccess('Build completed successfully');

        // Run bundle analysis
        analyzeBundle();
    } catch (error) {
        logError(`Build failed: ${error.message}`);
    }
}

// Test watch
function testWatch() {
    logInfo('Starting tests in watch mode...');

    try {
        spawn('npm', ['run', 'test:watch'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true
        });
    } catch (error) {
        logError(`Failed to start test watch: ${error.message}`);
    }
}

// Help
function showHelp() {
    log(`${colors.bright}MediFlow Development Tools${colors.reset}`);
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