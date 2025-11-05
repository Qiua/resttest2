import { test, expect } from '@playwright/test';

test('verify app is running', async ({ page }) => {
  await page.goto('http://localhost:5193/');
  // Check for the main header, which should always be present
  await expect(page.locator('h1:has-text("REST Test")')).toBeVisible();
});
