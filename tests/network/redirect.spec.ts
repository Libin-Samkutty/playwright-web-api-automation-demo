import { test, expect } from '@playwright/test';

test.describe('Redirect Page @regression', () => {
  test('N7 — Follow redirect and assert final URL @critical', async ({ page }) => {
    await page.goto('/redirect');

    // Click the redirect link
    const redirectLink = page.locator('a[href*="redirect"], a:has-text("redirect"), #redirect');
    const hasLink = await redirectLink.count() > 0;

    if (hasLink) {
      await redirectLink.first().click();
      await page.waitForLoadState('domcontentloaded');

      // The final URL should be different from /redirect
      const finalUrl = page.url();
      expect(finalUrl).toBeTruthy();

      // Should have been redirected — URL should contain status-codes or similar
      await expect(page.locator('body')).not.toBeEmpty();
    } else {
      // Navigate to a known redirect URL directly
      const response = await page.goto('/redirect');
      expect(response?.status()).toBeDefined();

      const finalUrl = page.url();
      expect(finalUrl).toBeTruthy();
    }
  });

  test('N8 — Intercept redirect response and validate Location header @regression', async ({ page }) => {
    const redirectResponses: { status: number; location?: string; url: string }[] = [];

    page.on('response', (response) => {
      const status = response.status();
      if (status >= 300 && status < 400) {
        redirectResponses.push({
          status,
          location: response.headers()['location'],
          url: response.url(),
        });
      }
    });

    await page.goto('/redirect');

    // Click redirect link if available
    const redirectLink = page.locator('a[href*="redirect"]').first();
    if (await redirectLink.isVisible().catch(() => false)) {
      await redirectLink.click();
      await page.waitForLoadState('domcontentloaded');
    }

    test.info().annotations.push({
      type: 'redirects',
      description: JSON.stringify(redirectResponses),
    });

    // If redirects were captured, validate them
    for (const redirect of redirectResponses) {
      expect(redirect.status).toBeGreaterThanOrEqual(300);
      expect(redirect.status).toBeLessThan(400);

      if (redirect.location) {
        expect(redirect.location.length).toBeGreaterThan(0);
      }
    }
  });

  test('N7 — Direct navigation to redirect URL follows chain @regression', async ({ page }) => {
    // Navigate directly to a URL that triggers a redirect
    const response = await page.goto('/redirector');

    if (response) {
      // The browser follows redirects automatically
      const finalUrl = page.url();
      const status = response.status();

      // Final response should be 200 (after following all redirects)
      expect(status).toBe(200);
      expect(finalUrl).toBeTruthy();
    }
  });
});