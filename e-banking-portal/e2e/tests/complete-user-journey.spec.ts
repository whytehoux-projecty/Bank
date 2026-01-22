import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display login page', async ({ page }) => {
        await expect(page).toHaveTitle(/AURUM VAULT/);
        await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
        // Fill login form
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');

        // Submit form
        await page.getByRole('button', { name: /sign in/i }).click();

        // Wait for redirect to dashboard
        await page.waitForURL('/dashboard');

        // Verify dashboard loaded
        await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.getByLabel(/account number/i).fill('INVALID');
        await page.getByLabel(/password/i).fill('wrong');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');

        // Logout
        await page.getByRole('button', { name: /logout/i }).click();

        // Verify redirected to login
        await expect(page).toHaveURL('/');
    });
});

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/');
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
    });

    test('should display account summary', async ({ page }) => {
        await expect(page.getByText(/total balance/i)).toBeVisible();
        await expect(page.getByText(/recent transactions/i)).toBeVisible();
    });

    test('should navigate to accounts page', async ({ page }) => {
        await page.getByRole('link', { name: /accounts/i }).click();
        await expect(page).toHaveURL('/accounts');
        await expect(page.getByRole('heading', { name: /accounts/i })).toBeVisible();
    });

    test('should navigate to transactions page', async ({ page }) => {
        await page.getByRole('link', { name: /transactions/i }).click();
        await expect(page).toHaveURL('/transactions');
        await expect(page.getByRole('heading', { name: /transactions/i })).toBeVisible();
    });
});

test.describe('Transactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
        await page.goto('/transactions');
    });

    test('should display transaction list', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /transactions/i })).toBeVisible();
        // Wait for transactions to load
        await page.waitForSelector('[data-testid="transaction-item"]', { timeout: 5000 });
    });

    test('should filter transactions by type', async ({ page }) => {
        await page.getByRole('combobox', { name: /filter/i }).selectOption('DEPOSIT');
        await page.waitForTimeout(1000); // Wait for filter to apply

        // Verify filtered results
        const transactions = page.locator('[data-testid="transaction-item"]');
        await expect(transactions.first()).toBeVisible();
    });

    test('should search transactions', async ({ page }) => {
        await page.getByPlaceholder(/search/i).fill('payment');
        await page.waitForTimeout(1000);

        // Verify search results
        await expect(page.getByText(/payment/i).first()).toBeVisible();
    });
});

test.describe('Bill Payment', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
        await page.goto('/bills');
    });

    test('should display bills page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /bill payments/i })).toBeVisible();
    });

    test('should add new payee', async ({ page }) => {
        await page.getByRole('button', { name: /add payee/i }).click();

        await page.getByLabel(/payee name/i).fill('Electric Company');
        await page.getByLabel(/account number/i).fill('EC123456');
        await page.getByLabel(/category/i).selectOption('UTILITIES');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/electric company/i)).toBeVisible();
    });

    test('should upload invoice PDF', async ({ page }) => {
        await page.getByRole('tab', { name: /pay with invoice/i }).click();

        // Create a test PDF file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'test-invoice.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('%PDF-1.4 test content'),
        });

        // Wait for upload to complete
        await page.waitForSelector('[data-testid="invoice-data"]', { timeout: 5000 });

        await expect(page.getByText(/invoice number/i)).toBeVisible();
    });
});

test.describe('Transfers', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
        await page.goto('/transfer');
    });

    test('should display transfer form', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /transfer/i })).toBeVisible();
        await expect(page.getByLabel(/from account/i)).toBeVisible();
        await expect(page.getByLabel(/to account/i)).toBeVisible();
        await expect(page.getByLabel(/amount/i)).toBeVisible();
    });

    test('should validate transfer amount', async ({ page }) => {
        await page.getByLabel(/amount/i).fill('-100');
        await page.getByRole('button', { name: /transfer/i }).click();

        await expect(page.getByText(/invalid amount/i)).toBeVisible();
    });

    test('should complete internal transfer', async ({ page }) => {
        await page.getByLabel(/from account/i).selectOption({ index: 0 });
        await page.getByLabel(/to account/i).selectOption({ index: 1 });
        await page.getByLabel(/amount/i).fill('100');
        await page.getByLabel(/description/i).fill('Test transfer');

        await page.getByRole('button', { name: /transfer/i }).click();

        await expect(page.getByText(/transfer successful/i)).toBeVisible();
    });
});

test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByLabel(/account number/i).fill('AV1234567890');
        await page.getByLabel(/password/i).fill('TestPassword123!');
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/dashboard');
        await page.goto('/settings');
    });

    test('should display settings page', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
    });

    test('should update profile information', async ({ page }) => {
        await page.getByLabel(/first name/i).fill('John');
        await page.getByLabel(/last name/i).fill('Doe');
        await page.getByLabel(/phone/i).fill('+1234567890');

        await page.getByRole('button', { name: /save/i }).click();

        await expect(page.getByText(/profile updated/i)).toBeVisible();
    });

    test('should change password', async ({ page }) => {
        await page.getByRole('tab', { name: /security/i }).click();

        await page.getByLabel(/current password/i).fill('TestPassword123!');
        await page.getByLabel(/new password/i).fill('NewPassword123!');
        await page.getByLabel(/confirm password/i).fill('NewPassword123!');

        await page.getByRole('button', { name: /change password/i }).click();

        await expect(page.getByText(/password changed/i)).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /aurum vault/i })).toBeVisible();
    });

    test('should work on tablets', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        await expect(page.getByRole('heading', { name: /aurum vault/i })).toBeVisible();
    });
});

test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
        await page.goto('/');

        const loginButton = page.getByRole('button', { name: /sign in/i });
        await expect(loginButton).toBeVisible();

        const accountInput = page.getByLabel(/account number/i);
        await expect(accountInput).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/');

        // Tab through form
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Verify focus
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
    });
});
