import { test, expect } from '@playwright/test';

/** Tokens that must never appear in any public HTML/text response. */
const DENYLIST = [
  'dashboard.omniprise',
  'resend',
  'RESEND_',
  'supabase',
  'formspree',
  'NEXT_LOCALE',
  'vercel-scripts',
  'E.A.S',
  'localhost:',
];

const PUBLIC_PAGES = ['/', '/en', '/agent', '/en/agent', '/franchise', '/proveedores', '/prensa', '/privacidad', '/terminos', '/cookies', '/marcas/rocco'];

test.describe('Agent page & llms.txt', () => {
  test('/agent renders in Spanish with the reference sections', async ({ page }) => {
    await page.goto('/agent');
    await expect(page.getByRole('heading', { level: 1, name: /omniprise, en claro/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /invertir en paraguay/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /sobre esta página/i })).toBeVisible();
    // no forms or inputs on the agent page
    expect(await page.locator('form, input, textarea, select').count()).toBe(0);
  });

  test('/en/agent renders in English', async ({ page }) => {
    await page.goto('/en/agent');
    await expect(page.getByRole('heading', { level: 1, name: /omniprise, plainly/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /investing in paraguay/i })).toBeVisible();
  });

  test('/llms.txt is plain text and points to the reference page', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/plain');
    const body = await res.text();
    expect(body).toContain('# Omniprise');
    expect(body).toContain('/agent');
    expect(body).toContain('franquicias@omniprise.com.py');
  });

  test('robots.txt allows AI crawlers and blocks /api', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('GPTBot');
    expect(body).toContain('ClaudeBot');
    expect(body).toContain('Disallow: /api');
  });
});

test.describe('Privacy guard — no internal or stack details in public responses', () => {
  for (const path of [...PUBLIC_PAGES, '/llms.txt', '/robots.txt', '/sitemap.xml']) {
    test(`${path} contains no denylisted tokens`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const body = (await res.text()).toLowerCase();
      for (const token of DENYLIST) {
        expect(body, `"${token}" found in ${path}`).not.toContain(token.toLowerCase());
      }
    });
  }
});
