import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('skip link focuses main content', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: /skip/i });
    if (await skipLink.isVisible()) {
      await skipLink.click();
      await expect(page.locator('#main-content')).toBeFocused();
    }
  });

  test('Spanish page has lang="es"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('English page has lang="en"', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('contact form shows Spanish validation errors', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /enviar/i }).click();
    await expect(page.getByText(/ingresá tu nombre/i)).toBeVisible();
    await expect(page.getByText(/ingresá tu email/i)).toBeVisible();
  });

  test('brand detail pages have correct document title', async ({ page }) => {
    await page.goto('/marcas/ufo');
    await expect(page).toHaveTitle(/UFO.*Omniprise/i);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt', /.+/);
    }
  });
});
