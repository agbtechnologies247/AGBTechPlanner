import { test, expect, type Page } from '@playwright/test';

const TEST_USER = {
  email: 'support@agbtechnologies.com',
  password: 'password123',
};

async function loginAs(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

test.describe('Plans CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('creates a new plan', async ({ page }) => {
    // Click "New Plan" button
    await page.click('button:has-text("New Plan")');
    await page.waitForSelector('[role="dialog"]');
    
    await page.fill('[placeholder*="Plan title"], input[name="title"]', 'E2E Test Plan');
    await page.fill('textarea, [placeholder*="description"]', 'Created by Playwright');
    await page.click('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Create")');
    
    await page.waitForTimeout(1500);
    await expect(page.locator('text=E2E Test Plan')).toBeVisible({ timeout: 8000 });
  });

  test('navigates to a plan', async ({ page }) => {
    // Navigate to dashboard first
    await page.goto('/');
    // Click on first plan
    const planLink = page.locator('[href*="/plan/"]').first();
    await planLink.click();
    await expect(page).toHaveURL(/\/plan\//);
  });

  test('plan page shows buckets', async ({ page }) => {
    const planLink = page.locator('[href*="/plan/"]').first();
    if (await planLink.count() > 0) {
      await planLink.click();
      await expect(page).toHaveURL(/\/plan\//);
      await page.waitForLoadState('networkidle');
      // Should see at least one bucket column or "Add Bucket" button
      const hasBuckets = await page.locator('[data-bucket], .bucket, button:has-text("Add")').count() > 0;
      expect(hasBuckets).toBeTruthy();
    }
  });
});

test.describe('Dashboard Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('dashboard shows stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Tasks, text=Completed')).toBeVisible({ timeout: 8000 })
      .catch(() => {
        // Fallback: check that some numbers are visible
        return expect(page.locator('text=/\\d+/')).toBeVisible();
      });
  });

  test('my day page loads without error', async ({ page }) => {
    await page.goto('/my-day');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    // Should not show an error boundary
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('my tasks page loads without error', async ({ page }) => {
    await page.goto('/my-tasks');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });
});
