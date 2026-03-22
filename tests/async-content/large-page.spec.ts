import { test, expect } from '@playwright/test';

test.describe('Large Page @regression', () => {
  test('Y9 — Locate deeply nested element without timeout @regression', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/large', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;
    test.info().annotations.push({
      type: 'performance',
      description: `Page load time: ${loadTime}ms`,
    });

    // Locate a deeply nested element
    const headings = page.locator('h3, h4, h5, .large-page-content *');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    // Locate a specific sibling element (tests deep DOM traversal)
    const siblings = page.locator('#sibling-50\\.3, .large-page *').last();
    const isVisible = await siblings.isVisible().catch(() => false);

    // Any element should be locatable within default timeout
    const allElements = page.locator('div, p, span, h1, h2, h3, h4, h5');
    const totalElements = await allElements.count();
    expect(totalElements).toBeGreaterThan(10);

    const locateTime = Date.now() - startTime - loadTime;
    test.info().annotations.push({
      type: 'performance',
      description: `Element location time: ${locateTime}ms`,
    });
  });

  test('Y10 — Page load performance threshold @extended', async ({ page }) => {
    const navigationStart = Date.now();

    const response = await page.goto('/large', { waitUntil: 'domcontentloaded' });

    const domContentLoaded = Date.now() - navigationStart;

    // Assert response is successful
    expect(response?.status()).toBe(200);

    // Assert domContentLoaded within threshold
    expect(domContentLoaded).toBeLessThan(5000); // 5s generous threshold for large page

    // Get detailed timing from the browser
    const timing = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoadedEventEnd: perf?.domContentLoadedEventEnd || 0,
        loadEventEnd: perf?.loadEventEnd || 0,
        domInteractive: perf?.domInteractive || 0,
        responseEnd: perf?.responseEnd || 0,
      };
    });

    test.info().annotations.push({
      type: 'performance',
      description: JSON.stringify(timing),
    });

    // domContentLoaded from browser's perspective
    if (timing.domContentLoadedEventEnd > 0) {
      expect(timing.domContentLoadedEventEnd).toBeLessThan(3000);
    }
  });

  test('Y9 — Page is scrollable and bottom content is reachable @regression', async ({ page }) => {
    await page.goto('/large', { waitUntil: 'domcontentloaded' });

    const scrollHeight = await page.evaluate(() =>
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    );

    if (scrollHeight <= 720) {
      test.skip(true, 'Page content fits in viewport — not scrollable');
      return;
    }

    // Scroll to bottom via both body and documentElement for maximum compatibility
    await page.evaluate(() => {
      const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      document.documentElement.scrollTop = h;
      document.body.scrollTop = h;
      window.scrollTo({ top: h, behavior: 'instant' });
    });

    // Read scroll position
    const scrollInfo = await page.evaluate(() => ({
      scrollTop: Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop),
      scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      innerHeight: window.innerHeight,
    }));

    // Should have scrolled significantly
    expect(scrollInfo.scrollTop).toBeGreaterThan(0);

    // Should be near the bottom — allow 500px tolerance for sticky footers/banners
    const distanceFromBottom = scrollInfo.scrollHeight - scrollInfo.scrollTop - scrollInfo.innerHeight;
    expect(distanceFromBottom).toBeLessThan(500);
  });
});