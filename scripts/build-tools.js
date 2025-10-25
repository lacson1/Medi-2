#!/usr/bin/env node

/**
 * Build Tools for MediFlow Frontend
 * Advanced build automation, optimization, and deployment utilities
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
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

// Build configurations
const buildConfigs = {
    development: {
        env: 'development',
        minify: false,
        sourcemap: true,
        analyze: false
    },
    staging: {
        env: 'staging',
        minify: true,
        sourcemap: true,
        analyze: true
    },
    production: {
        env: 'production',
        minify: true,
        sourcemap: false,
        analyze: true
    }
};

// Build commands
const commands = {
    'build': {
        description: 'Build the application',
        usage: 'node scripts/build-tools.js build [environment]',
        action: build
    },
    'build-analyze': {
        description: 'Build and analyze bundle',
        usage: 'node scripts/build-tools.js build-analyze [environment]',
        action: buildAnalyze
    },
    'build-optimize': {
        description: 'Build with advanced optimizations',
        usage: 'node scripts/build-tools.js build-optimize [environment]',
        action: buildOptimize
    },
    'preview': {
        description: 'Preview production build',
        usage: 'node scripts/build-tools.js preview',
        action: preview
    },
    'deploy-check': {
        description: 'Check deployment readiness',
        usage: 'node scripts/build-tools.js deploy-check',
        action: deployCheck
    },
    'generate-manifest': {
        description: 'Generate PWA manifest',
        usage: 'node scripts/build-tools.js generate-manifest',
        action: generateManifest
    },
    'optimize-assets': {
        description: 'Optimize static assets',
        usage: 'node scripts/build-tools.js optimize-assets',
        action: optimizeAssets
    },
    'generate-sitemap': {
        description: 'Generate sitemap for SEO',
        usage: 'node scripts/build-tools.js generate-sitemap',
        action: generateSitemap
    },
    'bundle-report': {
        description: 'Generate detailed bundle report',
        usage: 'node scripts/build-tools.js bundle-report',
        action: bundleReport
    },
    'help': {
        description: 'Show help message',
        usage: 'node scripts/build-tools.js help',
        action: showHelp
    }
};

// Main build function
function build(environment = 'production') {
    const config = buildConfigs[environment] || buildConfigs.production;

    logInfo(`Building for ${config.env} environment...`);

    // Set environment variables
    process.env.NODE_ENV = config.env;
    process.env.VITE_NODE_ENV = config.env;

    try {
        // Clean previous build
        logInfo('Cleaning previous build...');
        execSync('rm -rf dist', { cwd: projectRoot });

        // Run build
        logInfo('Running Vite build...');
        execSync('npx vite build', {
            stdio: 'inherit',
            cwd: projectRoot,
            env: {...process.env, NODE_ENV: config.env }
        });

        // Post-build optimizations
        if (config.env === 'production') {
            logInfo('Running post-build optimizations...');
            optimizeBuild();
        }

        logSuccess(`Build completed successfully for ${config.env}`);

        // Show build stats
        showBuildStats();

    } catch (error) {
        logError(`Build failed: ${error.message}`);
        process.exit(1);
    }
}

// Build with analysis
function buildAnalyze(environment = 'production') {
    build(environment);

    logInfo('Analyzing bundle...');

    try {
        // Check if bundle analyzer is available
        execSync('npx vite-bundle-analyzer dist', {
            stdio: 'inherit',
            cwd: projectRoot
        });
    } catch (error) {
        logWarning('Bundle analyzer not available. Install with: npm install -D vite-bundle-analyzer');

        // Fallback analysis
        analyzeDistFolder();
    }
}

// Build with optimizations
function buildOptimize(environment = 'production') {
    logInfo(`Building with optimizations for ${environment}...`);

    // Pre-build optimizations
    optimizeAssets();

    // Build
    build(environment);

    // Post-build optimizations
    optimizeBuild();

    logSuccess('Optimized build completed');
}

// Preview build
function preview() {
    logInfo('Starting preview server...');

    try {
        spawn('npm', ['run', 'preview'], {
            stdio: 'inherit',
            cwd: projectRoot,
            shell: true
        });
    } catch (error) {
        logError(`Failed to start preview: ${error.message}`);
    }
}

// Deployment check
function deployCheck() {
    logInfo('Checking deployment readiness...');

    const checks = [
        { name: 'Build exists', check: () => existsSync(join(projectRoot, 'dist')) },
        { name: 'Index file exists', check: () => existsSync(join(projectRoot, 'dist/index.html')) },
        { name: 'Assets exist', check: () => existsSync(join(projectRoot, 'dist/assets')) },
        { name: 'Manifest exists', check: () => existsSync(join(projectRoot, 'dist/manifest.json')) },
        { name: 'Service worker exists', check: () => existsSync(join(projectRoot, 'dist/sw.js')) }
    ];

    let allPassed = true;

    checks.forEach(({ name, check }) => {
        if (check()) {
            logSuccess(`${name}: ✓`);
        } else {
            logError(`${name}: ✗`);
            allPassed = false;
        }
    });

    if (allPassed) {
        logSuccess('Deployment check passed!');
    } else {
        logError('Deployment check failed. Run build first.');
        process.exit(1);
    }
}

// Generate PWA manifest
function generateManifest() {
    logInfo('Generating PWA manifest...');

    const manifest = {
        name: "MediFlow - Healthcare Management",
        short_name: "MediFlow",
        description: "Comprehensive healthcare management system",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0ea5e9",
        icons: [{
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png"
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ],
        categories: ["health", "medical", "productivity"],
        lang: "en-US",
        orientation: "portrait-primary"
    };

    const manifestPath = join(projectRoot, 'public/manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    logSuccess('PWA manifest generated');
}

// Optimize assets
function optimizeAssets() {
    logInfo('Optimizing static assets...');

    const publicPath = join(projectRoot, 'public');
    const distPath = join(projectRoot, 'dist');

    if (!existsSync(publicPath)) {
        logWarning('Public directory not found');
        return;
    }

    // Copy and optimize images
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'];
    const images = readdirSync(publicPath).filter(file =>
        imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    images.forEach(image => {
        const srcPath = join(publicPath, image);
        const destPath = join(distPath, image);

        try {
            copyFileSync(srcPath, destPath);
            logSuccess(`Optimized ${image}`);
        } catch (error) {
            logWarning(`Failed to optimize ${image}: ${error.message}`);
        }
    });
}

// Optimize build
function optimizeBuild() {
    logInfo('Running build optimizations...');

    const distPath = join(projectRoot, 'dist');

    if (!existsSync(distPath)) {
        logError('Dist directory not found. Run build first.');
        return;
    }

    // Add compression headers
    addCompressionHeaders();

    // Optimize HTML
    optimizeHTML();

    // Generate robots.txt
    generateRobotsTxt();

    logSuccess('Build optimizations completed');
}

// Add compression headers
function addCompressionHeaders() {
    logInfo('Adding compression headers...');

    const nginxConf = `
# Compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
`;

    const nginxPath = join(projectRoot, 'nginx.compression.conf');
    writeFileSync(nginxPath, nginxConf);

    logSuccess('Compression headers added');
}

// Optimize HTML
function optimizeHTML() {
    logInfo('Optimizing HTML files...');

    const distPath = join(projectRoot, 'dist');
    const indexPath = join(distPath, 'index.html');

    if (!existsSync(indexPath)) {
        logWarning('Index.html not found');
        return;
    }

    let html = readFileSync(indexPath, 'utf8');

    // Add meta tags for better SEO
    const metaTags = `
    <meta name="description" content="MediFlow - Comprehensive healthcare management system">
    <meta name="keywords" content="healthcare, medical, management, patients, appointments">
    <meta name="author" content="MediFlow Team">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="MediFlow - Healthcare Management">
    <meta property="og:description" content="Comprehensive healthcare management system">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
`;

    html = html.replace('<head>', `<head>${metaTags}`);

    writeFileSync(indexPath, html);

    logSuccess('HTML optimized');
}

// Generate robots.txt
function generateRobotsTxt() {
    logInfo('Generating robots.txt...');

    const robotsTxt = `User-agent: *
Allow: /

Sitemap: /sitemap.xml
`;

    const robotsPath = join(projectRoot, 'dist/robots.txt');
    writeFileSync(robotsPath, robotsTxt);

    logSuccess('robots.txt generated');
}

// Generate sitemap
function generateSitemap() {
    logInfo('Generating sitemap...');

    const pages = [
        '/',
        '/dashboard',
        '/patients',
        '/appointments',
        '/prescriptions',
        '/lab-tests',
        '/billing',
        '/reports',
        '/settings'
    ];

    const baseUrl = process.env.VITE_BASE_URL || 'https://mediflow.com';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    
    const sitemapPath = join(projectRoot, 'dist/sitemap.xml');
    writeFileSync(sitemapPath, sitemap);
    
    logSuccess('Sitemap generated');
}

// Bundle report
function bundleReport() {
    logInfo('Generating bundle report...');
    
    const distPath = join(projectRoot, 'dist');
    
    if (!existsSync(distPath)) {
        logError('Dist directory not found. Run build first.');
        return;
    }
    
    const report = {
        timestamp: new Date().toISOString(),
        buildInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        },
        assets: analyzeAssets(distPath),
        recommendations: generateRecommendations(distPath)
    };
    
    const reportPath = join(projectRoot, 'bundle-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    logSuccess(`Bundle report generated: ${reportPath}`);
}

// Analyze assets
function analyzeAssets(distPath) {
    const assets = [];
    
    function analyzeDirectory(dirPath, prefix = '') {
        const items = readdirSync(dirPath);
        
        items.forEach(item => {
            const itemPath = join(dirPath, item);
            const stats = statSync(itemPath);
            
            if (stats.isDirectory()) {
                analyzeDirectory(itemPath, prefix + item + '/');
            } else {
                const size = stats.size;
                const ext = extname(item);
                
                assets.push({
                    path: prefix + item,
                    size: size,
                    sizeFormatted: formatBytes(size),
                    type: getAssetType(ext),
                    extension: ext
                });
            }
        });
    }
    
    analyzeDirectory(distPath);
    
    return assets.sort((a, b) => b.size - a.size);
}

// Get asset type
function getAssetType(ext) {
    const types = {
        '.js': 'JavaScript',
        '.css': 'Stylesheet',
        '.html': 'HTML',
        '.png': 'Image',
        '.jpg': 'Image',
        '.jpeg': 'Image',
        '.svg': 'Image',
        '.gif': 'Image',
        '.webp': 'Image',
        '.woff': 'Font',
        '.woff2': 'Font',
        '.ttf': 'Font',
        '.eot': 'Font',
        '.json': 'Data',
        '.xml': 'Data'
    };
    
    return types[ext.toLowerCase()] || 'Other';
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate recommendations
function generateRecommendations(distPath) {
    const recommendations = [];
    
    // Check for large files
    const assets = analyzeAssets(distPath);
    const largeAssets = assets.filter(asset => asset.size > 100000); // > 100KB
    
    if (largeAssets.length > 0) {
        recommendations.push({
            type: 'warning',
            message: `Large assets detected: ${largeAssets.map(a => a.path).join(', ')}`,
            suggestion: 'Consider optimizing or lazy loading these assets'
        });
    }
    
    // Check for missing files
    const requiredFiles = ['index.html', 'manifest.json', 'sw.js'];
    const missingFiles = requiredFiles.filter(file => !existsSync(join(distPath, file)));
    
    if (missingFiles.length > 0) {
        recommendations.push({
            type: 'error',
            message: `Missing required files: ${missingFiles.join(', ')}`,
            suggestion: 'Ensure all required files are generated during build'
        });
    }
    
    return recommendations;
}

// Show build stats
function showBuildStats() {
    const distPath = join(projectRoot, 'dist');
    
    if (!existsSync(distPath)) {
        return;
    }
    
    logInfo('Build Statistics:');
    
    const assets = analyzeAssets(distPath);
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    
    log(`Total size: ${formatBytes(totalSize)}`);
    log(`Number of assets: ${assets.length}`);
    
    // Show largest files
    const largestFiles = assets.slice(0, 5);
    log('Largest files:');
    largestFiles.forEach(asset => {
        log(`  ${asset.path}: ${asset.sizeFormatted}`);
    });
}

// Analyze dist folder
function analyzeDistFolder(distPath) {
    logInfo('Analyzing dist folder...');
    
    const assets = analyzeAssets(distPath);
    
    log('Asset Analysis:');
    assets.forEach(asset => {
        log(`  ${asset.path} (${asset.sizeFormatted}) - ${asset.type}`);
    });
}

// Show help
function showHelp() {
    log(`${colors.bright}MediFlow Build Tools${colors.reset}`);
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
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { commands, buildConfigs };