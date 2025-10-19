import { defineConfig, devices } from '@playwright/test';

/* eslint-env node */
/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './src/tests/e2e',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results.json' }],
        ['junit', { outputFile: 'test-results.xml' }]
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:5173',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Take screenshot on failure */
        screenshot: 'only-on-failure',

        /* Record video on failure */
        video: 'retain-on-failure',

        /* Global timeout for each test */
        actionTimeout: 10000,

        /* Global timeout for navigation */
        navigationTimeout: 30000,
    },

    /* Configure projects for major browsers */
    projects: [{
            name: 'chromium',
            use: {...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: {...devices['Desktop Safari'] },
        },
        /* Mobile-First Testing Projects */
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                // Mobile-specific settings
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 2.75,
            },
        },
        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
                // Mobile-specific settings
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 3,
            },
        },
        {
            name: 'Mobile Safari Pro',
            use: {
                ...devices['iPhone 13 Pro'],
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 3,
            },
        },
        {
            name: 'Mobile Android Large',
            use: {
                ...devices['Galaxy S III'],
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 2,
            },
        },
        {
            name: 'Mobile Android Small',
            use: {
                ...devices['Galaxy Note II'],
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 1.5,
            },
        },
        {
            name: 'Mobile Landscape',
            use: {
                ...devices['iPhone 12 landscape'],
                hasTouch: true,
                isMobile: true,
                deviceScaleFactor: 3,
            },
        },
        /* Test against tablet viewports. */
        {
            name: 'Tablet Chrome',
            use: {...devices['iPad Pro'] },
        },

        /* PWA Testing Projects */
        {
            name: 'PWA Chrome',
            use: {
                ...devices['Desktop Chrome'],
                // PWA-specific settings
                permissions: ['notifications'],
                geolocation: { latitude: 40.7128, longitude: -74.0060 },
            },
        },
        {
            name: 'PWA Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                hasTouch: true,
                isMobile: true,
                permissions: ['notifications'],
                geolocation: { latitude: 40.7128, longitude: -74.0060 },
            },
        },

        /* Accessibility Testing */
        {
            name: 'Accessibility Chrome',
            use: {
                ...devices['Desktop Chrome'],
                // Accessibility testing settings
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },
        {
            name: 'Accessibility Mobile',
            use: {
                ...devices['iPhone 12'],
                hasTouch: true,
                isMobile: true,
                reducedMotion: 'reduce',
                forcedColors: 'active',
            },
        },

        /* Performance Testing */
        {
            name: 'Performance Mobile',
            use: {
                ...devices['Pixel 5'],
                hasTouch: true,
                isMobile: true,
                // Slow down for performance testing
                launchOptions: {
                    slowMo: 100,
                },
            },
        },

        /* Test against branded browsers. */
        {
            name: 'Microsoft Edge',
            use: {...devices['Desktop Edge'], channel: 'msedge' },
        },
        {
            name: 'Google Chrome',
            use: {...devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },

    /* Global test timeout */
    timeout: 30000,

    /* Expect timeout */
    expect: {
        timeout: 5000,
    },
});