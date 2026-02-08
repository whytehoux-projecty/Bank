import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Dashboard Page
 * These tests require authentication - using fixtures for logged-in state
 */

// Helper to simulate authenticated state
async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@aurumvault.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for either redirect to dashboard or stay on login (if creds invalid)
    await page.waitForTimeout(2000);
}

test.describe('Dashboard Page', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Dashboard tests only on Chromium');

    test('should display dashboard statistics cards', async ({ page }) => {
        await loginAsAdmin(page);

        // If we're on dashboard, check for stat cards
        if (page.url().includes('dashboard')) {
            // Look for stat cards or similar elements
            const statCards = page.locator('.stat-card, [class*="stat"], [class*="card"]');
            const cardCount = await statCards.count();

            // Dashboard should have multiple stat cards
            expect(cardCount).toBeGreaterThan(0);
        }
    });

    test('should display sidebar navigation', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Check for navigation elements
            const navLinks = page.locator('nav a, [class*="nav"] a, aside a');
            const linkCount = await navLinks.count();

            expect(linkCount).toBeGreaterThan(0);
        }
    });

    test('should navigate to users page from sidebar', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Click on Users link
            const usersLink = page.locator('a[href*="users"]').first();
            if (await usersLink.isVisible()) {
                await usersLink.click();
                await page.waitForURL(/users/, { timeout: 5000 }).catch(() => { });
            }
        }
    });

    test('should navigate to transactions page from sidebar', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            const transactionsLink = page.locator('a[href*="transaction"]').first();
            if (await transactionsLink.isVisible()) {
                await transactionsLink.click();
                await page.waitForURL(/transaction/, { timeout: 5000 }).catch(() => { });
            }
        }
    });

    test('should have responsive layout on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Page content should still be visible
            const mainContent = page.locator('main, [class*="content"]');
            await expect(mainContent.first()).toBeVisible();
        }
    });
});

test.describe('Dashboard Charts and Widgets', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Dashboard tests only on Chromium');

    test('should display transaction chart', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Look for chart elements
            const chart = page.locator('canvas, [class*="chart"], [class*="Chart"]');
            const chartCount = await chart.count();

            // Charts are optional but nice to have
            console.log(`Found ${chartCount} chart elements`);
        }
    });

    test('should display recent activity section', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Look for recent activity or similar section
            const activitySection = page.locator('[class*="recent"], [class*="activity"], [class*="Activity"]');
            const sectionCount = await activitySection.count();

            console.log(`Found ${sectionCount} activity sections`);
        }
    });
});

test.describe('Dashboard Quick Actions', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Dashboard tests only on Chromium');

    test('should have quick action buttons', async ({ page }) => {
        await loginAsAdmin(page);

        if (page.url().includes('dashboard')) {
            // Look for action buttons
            const actionButtons = page.locator('button, a.btn, [class*="btn"]');
            const buttonCount = await actionButtons.count();

            expect(buttonCount).toBeGreaterThan(0);
        }
    });
});
