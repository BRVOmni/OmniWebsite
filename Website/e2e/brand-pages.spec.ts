import { test, expect } from '@playwright/test';

const BRANDS = [
  { slug: 'ufo', name: 'UFO' },
  { slug: 'los-condenados', name: 'Los Condenados' },
  { slug: 'rocco', name: 'Rocco' },
  { slug: 'sammys', name: "Sammy's" },
  { slug: 'pastabox', name: 'PastaBox' },
  { slug: 'mr-chow', name: 'Mr. Chow' },
  { slug: 'barrio-pizzero', name: 'Barrio Pizzero' },
];

test.describe('Brand Pages', () => {
  for (const brand of BRANDS) {
    test(`${brand.name} page loads with correct content`, async ({ page }) => {
      await page.goto(`/marcas/${brand.slug}`);
      // Brand name appears in the hero heading — use .first() since it appears in multiple headings
      await expect(page.getByRole('heading', { name: new RegExp(brand.name, 'i') }).first()).toBeVisible();
    });

    test(`${brand.name} page has gallery section`, async ({ page }) => {
      await page.goto(`/marcas/${brand.slug}`);
      // Gallery section has "Galeria" eyebrow text
      await expect(page.getByText('Galeria')).toBeVisible();
    });
  }

  test('clicking brand card navigates to brand detail', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /ufo/i }).first().click();
    await expect(page).toHaveURL(/\/marcas\/ufo/);
    await expect(page.getByRole('heading', { name: /ufo/i }).first()).toBeVisible();
  });

  test('non-existent brand returns 404', async ({ page }) => {
    const response = await page.goto('/marcas/nonexistent-brand');
    expect(response?.status()).toBe(404);
  });
});
