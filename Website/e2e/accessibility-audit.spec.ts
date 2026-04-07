import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Automated accessibility audits using axe-core.
 *
 * These tests log violations as test output but don't hard-fail,
 * so CI stays green while giving visibility into WCAG issues.
 */
function checkViolations(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  const violationSummary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    description: v.description,
    nodes: v.nodes.length,
  }));

  test.info().annotations.push({
    type: 'axe-violations',
    description: JSON.stringify(violationSummary, null, 2),
  });

  if (results.violations.length > 0) {
    console.log(
      `\n⚠️  ${results.violations.length} axe violation(s) found:\n`,
      JSON.stringify(violationSummary, null, 2),
    );
  }
}

test.describe('Accessibility Audit', () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    checkViolations(results);
  });

  test('brand detail page', async ({ page }) => {
    await page.goto('/marcas/ufo');
    const results = await new AxeBuilder({ page }).analyze();
    checkViolations(results);
  });

  test('franchise landing', async ({ page }) => {
    await page.goto('/franchise');
    const results = await new AxeBuilder({ page }).analyze();
    checkViolations(results);
  });

  test('franchise apply', async ({ page }) => {
    await page.goto('/franchise/apply');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const results = await new AxeBuilder({ page }).analyze();
    checkViolations(results);
  });

  test('privacy page', async ({ page }) => {
    await page.goto('/privacidad');
    const results = await new AxeBuilder({ page }).analyze();
    checkViolations(results);
  });
});
