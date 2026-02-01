import { defineConfig, devices } from '@playwright/test';
import TEST_CONFIG from './tests/config/test.config';

/**
 * Playwright Configuration for E2E Tests
 * 
 * Configured for REAL browser testing with:
 * - Real browser instances (Chromium, Firefox, WebKit)
 * - Real network conditions
 * - Real viewport sizes
 * - NO MOCKING
 */

export default defineConfig({
    testDir: './tests/e2e',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Test configuration
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    // Reporter configuration
    reporter: [
        ['html', { outputFolder: 'test-results/html' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['list'],
    ],

    // Shared settings for all projects
    use: {
        // Base URL for navigation
        baseURL: TEST_CONFIG.frontend.staffPortalUrl,

        // Collect trace on failure
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',

        // Browser context options
        viewport: TEST_CONFIG.browser.viewport,

        // Timeout for actions
        actionTimeout: 10000,

        // Timeout for navigation
        navigationTimeout: 30000,
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile browsers
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },

        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },

        // Tablet
        {
            name: 'iPad',
            use: { ...devices['iPad Pro'] },
        },
    ],

    // Web server configuration
    webServer: [
        {
            command: 'cd staff_backend && npm run dev',
            url: TEST_CONFIG.api.baseURL,
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            command: 'cd staff_portal && npm run dev',
            url: TEST_CONFIG.frontend.staffPortalUrl,
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
        {
            command: 'cd staff_admin_interface && npm run dev',
            url: TEST_CONFIG.frontend.adminInterfaceUrl,
            reuseExistingServer: !process.env.CI,
            timeout: 120 * 1000,
        },
    ],
});
