import { test, expect } from '@playwright/test';

test.describe('Franchise Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/franchise/apply');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole('heading').filter({ hasText: /solicitud/i })).toBeVisible();
  });

  test('renders step 1 with all fields', async ({ page }) => {
    const form = page.locator('#main-content');
    await expect(form.locator('input[name="firstName"]')).toBeVisible();
    await expect(form.locator('input[name="lastName"]')).toBeVisible();
    await expect(form.locator('input[name="email"]')).toBeVisible();
    await expect(form.locator('input[name="phone"]')).toBeVisible();
    await expect(form.locator('input[name="city"]')).toBeVisible();
  });

  test('next button is disabled when fields are empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });

  test('back button is disabled on first step', async ({ page }) => {
    await expect(page.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  test('page has email contact link', async ({ page }) => {
    await expect(page.getByRole('link', { name: /franquicias@omniprise/i })).toBeVisible();
  });

  test('step indicator shows 4 steps', async ({ page }) => {
    // Step 1 is active (has border), steps 2-4 are inactive
    const steps = page.locator('#main-content').getByText(/^[1-4]$/);
    await expect(steps).toHaveCount(4);
  });
});
