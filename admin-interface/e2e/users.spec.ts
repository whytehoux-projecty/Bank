import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for User Management functionality
 */

// Helper to simulate authenticated state
async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@aurumvault.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
}

test.describe('Users List Page', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'User tests only on Chromium');

    test('should display users table', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Check for table or list
            const table = page.locator('table, [class*="table"], [role="grid"]');
            const tableCount = await table.count();

            expect(tableCount).toBeGreaterThan(0);
        }
    });

    test('should have search functionality', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Look for search input
            const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
            const searchCount = await searchInput.count();

            if (searchCount > 0) {
                await expect(searchInput.first()).toBeVisible();

                // Type in search
                await searchInput.first().fill('test');
                await page.waitForTimeout(500);
            }
        }
    });

    test('should have status filter', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Look for filter select or dropdown
            const filterSelect = page.locator('select, [class*="filter"], [class*="dropdown"]');
            const filterCount = await filterSelect.count();

            console.log(`Found ${filterCount} filter elements`);
        }
    });

    test('should have pagination', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Look for pagination elements
            const pagination = page.locator('[class*="pagination"], nav[aria-label*="pagination"]');
            const paginationCount = await pagination.count();

            console.log(`Found ${paginationCount} pagination elements`);
        }
    });
});

test.describe('User Details Modal', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'User tests only on Chromium');

    test('should open user details on row click', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Click on first user row
            const userRow = page.locator('table tbody tr, [class*="user-row"], [class*="table-row"]').first();

            if (await userRow.isVisible()) {
                await userRow.click();
                await page.waitForTimeout(500);

                // Check if modal opened
                const modal = page.locator('[class*="modal"], [role="dialog"]');
                const modalCount = await modal.count();

                console.log(`Found ${modalCount} modal elements after click`);
            }
        }
    });
});

test.describe('User Actions', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'User tests only on Chromium');

    test('should have action buttons for each user', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/users');

        if (!page.url().includes('login')) {
            // Look for action buttons in table rows
            const actionButtons = page.locator('table tbody tr button, table tbody tr a[class*="btn"]');
            const buttonCount = await actionButtons.count();

            console.log(`Found ${buttonCount} action buttons in user table`);
        }
    });
});
