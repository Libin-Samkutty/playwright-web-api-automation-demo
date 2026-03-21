import { test, expect } from '@playwright/test';

test.describe('Browser Info Page @regression', () => {
  test('O1 — Detect browser type @regression', async ({ page, browserName }) => {
    await page.goto('/browser-info');

    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();

    // Log detected browser for the report
    test.info().annotations.push({
      type: 'browser',
      description: `Running on: ${browserName}`,
    });

    // The page should display some browser information
    const hasBrowserInfo =
      bodyText?.toLowerCase().includes('browser') ||
      bodyText?.toLowerCase().includes('user agent') ||
      bodyText?.toLowerCase().includes('chrome') ||
      bodyText?.toLowerCase().includes('firefox') ||
      bodyText?.toLowerCase().includes('webkit');

    expect.soft(hasBrowserInfo).toBeTruthy();
  });

  test('O2 — Validate correct browser detection @regression', async ({ page, browserName }) => {
    await page.goto('/browser-info');

    // Get the user agent from the browser context
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toBeTruthy();

    // Map Playwright browser names to expected UA strings
    const expectedPatterns: Record<string, RegExp[]> = {
      chromium: [/chrome/i, /chromium/i],
      firefox: [/firefox/i, /gecko/i],
      webkit: [/webkit/i, /safari/i],
    };

    const patterns = expectedPatterns[browserName] || [];
    const matchesExpected = patterns.some((pattern) => pattern.test(userAgent));

    expect(matchesExpected).toBeTruthy();

    test.info().annotations.push({
      type: 'user-agent',
      description: userAgent,
    });
  });

  test('O1 — Page loads successfully across browsers @regression', async ({ page }) => {
    const response = await page.goto('/browser-info');
    expect(response?.status()).toBe(200);

    // Page should have rendered content
    await expect(page.locator('body')).not.toBeEmpty();

    // Check for key page elements
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible();
  });
});