import { test, expect } from '@playwright/test';

test.describe('Status Codes Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/status-codes');
  });

  test('N1 — Trigger and assert 200 OK @critical', async ({ page }) => {
    const link200 = page.locator('a:has-text("200")');
    await expect(link200).toBeVisible();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('200') && resp.status() === 200
    );

    await link200.click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
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
    const link404 = page.locator('a:has-text("404")');
    await expect(link404).toBeVisible();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('404')
    );

    await link404.click();
    const response = await responsePromise;

    expect(response.status()).toBe(404);
    await expect(page.locator('body')).toContainText('404');
  });

  test('N3 — Trigger and assert 500 with graceful handling @regression', async ({ page }) => {
    const link500 = page.locator('a:has-text("500")');
    await expect(link500).toBeVisible();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('500')
    );

    await link500.click();
    const response = await responsePromise;

    expect(response.status()).toBe(500);

    // Page should display something — not an unhandled crash
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