import { test, expect, type Page } from '@playwright/test';

const TEST_USER = {
  email: 'support@agbtechnologies.com',
  password: 'password123',
};

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

test.describe('Authentication Flow', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText(/Sign in|Login|Welcome/i);
  });

  test('logs in with valid credentials', async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText(/Good/i); // "Good morning/afternoon..."
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should stay on login page and show error
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('body')).toContainText(/invalid|incorrect|error/i);
  });

  test('logs out successfully', async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    // Click sign-out (in sidebar or profile menu)
    const signOutBtn = page.getByRole('button', { name: /sign out|logout/i });
    await signOutBtn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('login with all seeded users', async ({ page }) => {
    const users = [
      { email: 'agbtech.maheshlakhe@gmail.com', password: 'Mahesh@143' },
      { email: 'agbtech.rushabhkorde@gmail.com', password: 'Rushabh@143' },
      { email: 'agbtech.omkarvani@gmail.com', password: 'Omkar@143' },
      { email: 'agbtech.mehulhotkar@gmail.com', password: 'Mehul@143' },
    ];
    for (const u of users) {
      await loginAs(page, u.email, u.password);
      await expect(page).toHaveURL('/');
      // Sign out before next user
      await page.evaluate(() => localStorage.removeItem('agb_session'));
    }
  });
});
