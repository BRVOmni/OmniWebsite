import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /no somos/i })).toBeVisible();
  });

  test('renders brands grid with all 7 brands', async ({ page }) => {
    const brands = ['UFO', 'Los Condenados', 'Rocco', "Sammy's", 'PastaBox', 'Mr. Chow', 'Barrio Pizzero'];
    for (const brand of brands) {
      await expect(page.getByText(brand, { exact: false }).first()).toBeVisible();
    }
  });

  test('renders contact form', async ({ page }) => {
    // The form doesn't have an explicit role, look for the submit button instead
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeVisible();
  });

  test('scrolls to contact section via nav link', async ({ page }) => {
    // Use the nav specifically to avoid matching footer link
    await page.getByRole('navigation').getByRole('link', { name: /contacto/i }).click();
    await expect(page.getByRole('button', { name: /enviar mensaje/i })).toBeVisible();
  });
});
