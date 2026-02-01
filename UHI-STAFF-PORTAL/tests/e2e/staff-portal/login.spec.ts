/**
 * Staff Portal Login E2E Tests
 * 
 * Tests REAL browser interactions with:
 * - Real browser automation (Playwright)
 * - Real form submissions
 * - Real network requests
 * - Real page navigation
 * 
 * NO MOCKING - All tests use actual browser and application
 */

import { test, expect, Page } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Staff Portal Login - Real Browser Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        await page.goto(STAFF_PORTAL_URL);
    });

    test('should display login form correctly', async ({ page }) => {
        // Verify page title
        await expect(page).toHaveTitle(/Staff Portal/i);

        // Verify login form elements exist
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Verify "Remember Me" checkbox
        await expect(page.locator('[name="rememberMe"]')).toBeVisible();

        // Verify "Forgot Password" link
        await expect(page.locator('text=Forgot Password')).toBeVisible();
    });

    test('should login successfully with real credentials', async ({ page }) => {
        // Fill in login form with REAL credentials
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for navigation to dashboard
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Verify successful login
        await expect(page).toHaveURL(/.*dashboard/);

        // Verify user name is displayed
        await expect(page.locator('[data-testid="user-name"]')).toBeVisible();

        // Verify dashboard elements are loaded
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();

        // Verify real data is loaded (not placeholders)
        const statsText = await page.locator('[data-testid="dashboard-stats"]').textContent();
        expect(statsText).not.toContain('Loading');
        expect(statsText).not.toContain('...');
    });

    test('should show error for invalid credentials', async ({ page }) => {
        // Fill in login form with INVALID credentials
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', 'WrongPassword123!');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for error message
        await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });

        // Verify error message is displayed
        const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
        expect(errorMessage).toContain('Invalid');

        // Verify still on login page
        await expect(page).toHaveURL(STAFF_PORTAL_URL);
    });

    test('should show error for non-existent user', async ({ page }) => {
        // Fill in login form with non-existent email
        await page.fill('[name="email"]', 'nonexistent@uhi.org');
        await page.fill('[name="password"]', 'Password123!');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for error message
        await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });

        // Verify error message
        const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
        expect(errorMessage).toContain('Invalid');
    });

    test('should validate email format', async ({ page }) => {
        // Fill in invalid email
        await page.fill('[name="email"]', 'invalid-email');
        await page.fill('[name="password"]', 'Password123!');

        // Submit form
        await page.click('button[type="submit"]');

        // Verify validation error
        const emailInput = page.locator('[name="email"]');
        const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });

    test('should validate required fields', async ({ page }) => {
        // Submit form without filling fields
        await page.click('button[type="submit"]');

        // Verify validation errors
        const emailInput = page.locator('[name="email"]');
        const passwordInput = page.locator('[name="password"]');

        const emailValidation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        const passwordValidation = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);

        expect(emailValidation).toBeTruthy();
        expect(passwordValidation).toBeTruthy();
    });

    test('should toggle password visibility', async ({ page }) => {
        // Fill password
        await page.fill('[name="password"]', 'TestPassword123!');

        // Verify password is hidden
        const passwordInput = page.locator('[name="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle button
        await page.click('[data-testid="toggle-password"]');

        // Verify password is visible
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click toggle again
        await page.click('[data-testid="toggle-password"]');

        // Verify password is hidden again
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should remember user with "Remember Me" checkbox', async ({ page, context }) => {
        // Fill in login form
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);

        // Check "Remember Me"
        await page.check('[name="rememberMe"]');

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Verify cookie is set
        const cookies = await context.cookies();
        const rememberMeCookie = cookies.find(c => c.name === 'rememberMe' || c.name === 'refreshToken');
        expect(rememberMeCookie).toBeDefined();

        // Verify cookie has long expiration (> 7 days)
        if (rememberMeCookie) {
            const expirationDate = new Date(rememberMeCookie.expires * 1000);
            const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            expect(expirationDate.getTime()).toBeGreaterThan(sevenDaysFromNow.getTime());
        }
    });

    test('should navigate to forgot password page', async ({ page }) => {
        // Click "Forgot Password" link
        await page.click('text=Forgot Password');

        // Verify navigation
        await expect(page).toHaveURL(/.*forgot-password/);

        // Verify forgot password form
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle slow network conditions', async ({ page }) => {
        // Simulate slow 3G network
        await page.route('**/*', route => {
            setTimeout(() => route.continue(), 1000); // 1 second delay
        });

        // Fill and submit form
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Verify loading state is shown
        await expect(page.locator('[data-testid="loading"]')).toBeVisible();

        // Wait for dashboard (with longer timeout)
        await page.waitForURL(/.*dashboard/, { timeout: 15000 });

        // Verify successful login
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should handle offline state gracefully', async ({ page }) => {
        // Go offline
        await page.context().setOffline(true);

        // Try to submit form
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');

        // Verify offline error message
        await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
        const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
        expect(errorMessage).toContain('network');

        // Go back online
        await page.context().setOffline(false);

        // Retry submission
        await page.click('button[type="submit"]');

        // Verify successful login
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Click logout button
        await page.click('[data-testid="logout-button"]');

        // Verify redirect to login page
        await expect(page).toHaveURL(STAFF_PORTAL_URL);

        // Verify login form is visible
        await expect(page.locator('[name="email"]')).toBeVisible();
    });

    test('should prevent access to protected pages without login', async ({ page }) => {
        // Try to access dashboard directly
        await page.goto(`${STAFF_PORTAL_URL}/dashboard`);

        // Verify redirect to login
        await expect(page).toHaveURL(STAFF_PORTAL_URL);

        // Verify login form is visible
        await expect(page.locator('[name="email"]')).toBeVisible();
    });

    test('should maintain session across page refreshes', async ({ page }) => {
        // Login
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Refresh page
        await page.reload();

        // Verify still on dashboard (session maintained)
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    });

    test('should handle concurrent login attempts', async ({ browser }) => {
        // Create multiple browser contexts
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        // Navigate both to login
        await page1.goto(STAFF_PORTAL_URL);
        await page2.goto(STAFF_PORTAL_URL);

        // Login simultaneously
        await Promise.all([
            (async () => {
                await page1.fill('[name="email"]', TEST_USER.email);
                await page1.fill('[name="password"]', TEST_USER.password);
                await page1.click('button[type="submit"]');
            })(),
            (async () => {
                await page2.fill('[name="email"]', TEST_USER.email);
                await page2.fill('[name="password"]', TEST_USER.password);
                await page2.click('button[type="submit"]');
            })(),
        ]);

        // Both should succeed
        await expect(page1).toHaveURL(/.*dashboard/);
        await expect(page2).toHaveURL(/.*dashboard/);

        // Cleanup
        await context1.close();
        await context2.close();
    });

    test('should capture and log network requests', async ({ page }) => {
        const requests: string[] = [];

        // Listen to all network requests
        page.on('request', request => {
            requests.push(request.url());
        });

        // Login
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Verify API calls were made
        const apiCalls = requests.filter(url => url.includes('/api/'));
        expect(apiCalls.length).toBeGreaterThan(0);

        // Verify login API was called
        const loginCall = apiCalls.find(url => url.includes('/auth/login'));
        expect(loginCall).toBeDefined();
    });
});

test.describe('Accessibility Tests', () => {
    test('should be keyboard navigable', async ({ page }) => {
        await page.goto(STAFF_PORTAL_URL);

        // Tab to email field
        await page.keyboard.press('Tab');
        await expect(page.locator('[name="email"]')).toBeFocused();

        // Tab to password field
        await page.keyboard.press('Tab');
        await expect(page.locator('[name="password"]')).toBeFocused();

        // Tab to submit button
        await page.keyboard.press('Tab');
        await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
        await page.goto(STAFF_PORTAL_URL);

        // Verify ARIA labels
        const emailInput = page.locator('[name="email"]');
        const passwordInput = page.locator('[name="password"]');

        await expect(emailInput).toHaveAttribute('aria-label', /.+/);
        await expect(passwordInput).toHaveAttribute('aria-label', /.+/);
    });
});
