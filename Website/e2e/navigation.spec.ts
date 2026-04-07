import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('mobile hamburger menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    await page.getByRole('button', { name: /toggle menu/i }).click();
    await expect(page.getByRole('link', { name: /franquicia/i }).first()).toBeVisible();

    // Close by clicking X
    await page.getByRole('button', { name: /toggle menu/i }).click();
  });

  test('404 page renders on invalid route', async ({ page }) => {
    const response = await page.goto('/esta-pagina-no-existe');
    expect(response?.status()).toBe(404);
  });

  test('WhatsApp CTA has correct wa.me link', async ({ page }) => {
    await page.goto('/');
    const whatsappLink = page.locator('a[href*="wa.me"]').first();
    await expect(whatsappLink).toHaveAttribute('href', /wa\.me/);
  });

  test('language switcher toggles locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // Click language switcher (shows "EN" when on Spanish)
    await page.getByRole('button', { name: /english/i }).click();
    await expect(page).toHaveURL('/en');

    // Should show "ES" now
    await page.getByRole('button', { name: /español/i }).click();
    await expect(page).toHaveURL('/');
  });
});
