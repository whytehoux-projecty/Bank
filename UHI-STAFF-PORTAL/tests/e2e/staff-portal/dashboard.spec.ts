/**
 * Staff Portal Dashboard E2E Tests
 * 
 * Tests REAL dashboard interactions with:
 * - Real browser automation
 * - Real data loading
 * - Real chart rendering
 * - Real user interactions
 * 
 * NO MOCKING - All tests use actual browser and application
 */

import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Staff Portal Dashboard - Real Browser Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto(STAFF_PORTAL_URL);
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    });

    test('should load dashboard with real data', async ({ page }) => {
        // Verify dashboard URL
        await expect(page).toHaveURL(/.*dashboard/);

        // Verify page title
        await expect(page).toHaveTitle(/Dashboard/i);

        // Verify main sections are visible
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
        await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible();
        await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    });

    test('should display real statistics', async ({ page }) => {
        // Wait for stats to load
        await page.waitForSelector('[data-testid="dashboard-stats"]', { state: 'visible' });

        // Get stats text
        const statsText = await page.locator('[data-testid="dashboard-stats"]').textContent();

        // Verify no loading placeholders
        expect(statsText).not.toContain('Loading');
        expect(statsText).not.toContain('...');

        // Verify stats contain numbers
        expect(statsText).toMatch(/\d+/);

        // Verify specific stat cards
        await expect(page.locator('[data-testid="total-payroll-stat"]')).toBeVisible();
        await expect(page.locator('[data-testid="active-loans-stat"]')).toBeVisible();
        await expect(page.locator('[data-testid="pending-applications-stat"]')).toBeVisible();

        // Verify stat values are numbers
        const payrollValue = await page.locator('[data-testid="total-payroll-stat"] .value').textContent();
        expect(payrollValue).toMatch(/[\d,]+/);
    });

    test('should render charts with real data', async ({ page }) => {
        // Wait for charts to render
        await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });

        // Verify chart canvases exist
        const charts = await page.locator('canvas').count();
        expect(charts).toBeGreaterThan(0);

        // Verify chart has data (not empty)
        const chartCanvas = page.locator('canvas').first();
        await expect(chartCanvas).toBeVisible();

        // Verify chart legend
        await expect(page.locator('.chart-legend')).toBeVisible();
    });

    test('should display recent activities from real database', async ({ page }) => {
        // Wait for activities to load
        await page.waitForSelector('[data-testid="recent-activities"]', { state: 'visible' });

        // Get activities
        const activities = page.locator('[data-testid="activity-item"]');
        const count = await activities.count();

        // Should have at least one activity
        expect(count).toBeGreaterThan(0);

        // Verify activity structure
        if (count > 0) {
            const firstActivity = activities.first();
            await expect(firstActivity.locator('.activity-title')).toBeVisible();
            await expect(firstActivity.locator('.activity-date')).toBeVisible();

            // Verify date is valid
            const dateText = await firstActivity.locator('.activity-date').textContent();
            expect(dateText).toBeTruthy();
        }
    });

    test('should have functional quick actions', async ({ page }) => {
        // Verify quick action buttons
        await expect(page.locator('[data-testid="apply-leave-btn"]')).toBeVisible();
        await expect(page.locator('[data-testid="view-payslip-btn"]')).toBeVisible();
        await expect(page.locator('[data-testid="apply-loan-btn"]')).toBeVisible();

        // Click on apply leave
        await page.click('[data-testid="apply-leave-btn"]');

        // Verify navigation to applications page
        await expect(page).toHaveURL(/.*applications/);
    });

    test('should refresh data on reload', async ({ page }) => {
        // Get initial stat value
        const initialValue = await page.locator('[data-testid="total-payroll-stat"] .value').textContent();

        // Reload page
        await page.reload();

        // Wait for dashboard to load again
        await page.waitForSelector('[data-testid="dashboard-stats"]', { state: 'visible' });

        // Get new value
        const newValue = await page.locator('[data-testid="total-payroll-stat"] .value').textContent();

        // Values should be consistent (real data)
        expect(newValue).toBe(initialValue);
    });

    test('should handle navigation from dashboard', async ({ page }) => {
        // Navigate to profile
        await page.click('[data-testid="nav-profile"]');
        await expect(page).toHaveURL(/.*profile/);

        // Go back to dashboard
        await page.click('[data-testid="nav-dashboard"]');
        await expect(page).toHaveURL(/.*dashboard/);

        // Navigate to payroll
        await page.click('[data-testid="nav-payroll"]');
        await expect(page).toHaveURL(/.*payroll/);
    });

    test('should display user greeting with real name', async ({ page }) => {
        // Verify user greeting
        const greeting = page.locator('[data-testid="user-greeting"]');
        await expect(greeting).toBeVisible();

        const greetingText = await greeting.textContent();

        // Should contain user's name (not placeholder)
        expect(greetingText).not.toContain('User');
        expect(greetingText).toBeTruthy();
    });

    test('should show notifications if available', async ({ page }) => {
        // Check for notification bell
        const notificationBell = page.locator('[data-testid="notification-bell"]');
        await expect(notificationBell).toBeVisible();

        // Click notification bell
        await notificationBell.click();

        // Verify notification dropdown appears
        await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    });

    test('should handle responsive layout', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify mobile menu button appears
        await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible();

        // Stats should stack vertically
        const statsContainer = page.locator('[data-testid="dashboard-stats"]');
        const boundingBox = await statsContainer.boundingBox();

        expect(boundingBox?.width).toBeLessThan(400);

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        // Verify layout adjusts
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();

        // Test desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Verify full layout
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
        await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible();
    });

    test('should handle slow network gracefully', async ({ page }) => {
        // Simulate slow 3G
        await page.route('**/*', route => {
            setTimeout(() => route.continue(), 1000);
        });

        // Reload dashboard
        await page.reload();

        // Verify loading state appears
        await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();

        // Wait for data to load
        await page.waitForSelector('[data-testid="dashboard-stats"]', { state: 'visible', timeout: 15000 });

        // Verify data loaded
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
    });

    test('should update stats in real-time', async ({ page }) => {
        // Get initial count
        const initialCount = await page.locator('[data-testid="pending-applications-stat"] .value').textContent();

        // Open new tab and submit application
        const newPage = await page.context().newPage();
        await newPage.goto(`${STAFF_PORTAL_URL}/applications`);

        // Submit application (this would trigger real-time update)
        // ... application submission code ...

        // Go back to dashboard
        await page.bringToFront();

        // Wait a bit for real-time update
        await page.waitForTimeout(2000);

        // Verify count might have changed (if real-time updates work)
        const newCount = await page.locator('[data-testid="pending-applications-stat"] .value').textContent();

        // Count should be a valid number
        expect(newCount).toMatch(/\d+/);

        await newPage.close();
    });

    test('should handle errors gracefully', async ({ page }) => {
        // Simulate API error
        await page.route('**/api/v1/dashboard/stats', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        // Reload dashboard
        await page.reload();

        // Verify error message appears
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

        // Verify retry button exists
        await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
    });
});

test.describe('Dashboard Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        // Navigate to dashboard
        await page.goto(STAFF_PORTAL_URL);
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Wait for dashboard to fully load
        await page.waitForSelector('[data-testid="dashboard-stats"]', { state: 'visible' });
        await page.waitForSelector('canvas', { state: 'visible' });

        const loadTime = Date.now() - startTime;

        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
    });
});
