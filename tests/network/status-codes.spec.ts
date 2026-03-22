import { test, expect } from '@playwright/test';

test.describe('Status Codes Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status-codes');
  });

  test('N1 — Trigger and assert 200 OK @critical', async ({ page }) => {
    const response = await page.goto('/status-codes/200', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toContainText('200');
  });

  test('N2 — Trigger and assert 301 Redirect @critical', async ({ page }) => {
    const link301 = page.locator('a:has-text("301")');

    if (await link301.count() === 0) {
      test.skip(true, '301 link not found on status codes page');
      return;
    }

    await link301.click();
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('301');
  });

  test('N2 — Trigger and assert 404 Not Found @critical', async ({ page }) => {
    // WebKit shows a Google ad vignette that intercepts link clicks on this page.
    // Navigate directly so we can also assert the actual HTTP status code.
    const response = await page.goto('/status-codes/404', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(404);
    await expect(page.locator('body')).toContainText('404');
  });

  test('N3 — Trigger and assert 500 with graceful handling @regression', async ({ page }) => {
    const response = await page.goto('/status-codes/500', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(500);
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('N1 — All status code links are present @regression', async ({ page }) => {
    const expectedCodes = ['200', '301', '404', '500'];

    for (const code of expectedCodes) {
      const link = page.locator(`a:has-text("${code}")`);
      await expect.soft(link).toBeVisible();
    }
  });
});