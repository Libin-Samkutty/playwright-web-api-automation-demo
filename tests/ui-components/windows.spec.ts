import { test, expect } from '@playwright/test';

test.describe('Windows / Tabs Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/windows');
  });

  test('U8 — Open new window and validate content @critical', async ({ page, context }) => {
    // Listen for the new page event BEFORE clicking
    const pagePromise = context.waitForEvent('page');

    await page.click('a[href="/windows/new"]');

    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Assert the new page has the expected content
    expect(newPage.url()).toContain('/windows/new');
    const heading = newPage.locator('h3, .example h3');
    await expect(heading).toBeVisible();

    const content = await newPage.textContent('body');
    expect(content).toBeTruthy();
  });

  test('U9 — Close new window and return to original @regression', async ({ page, context }) => {
    const originalUrl = page.url();
    const originalTitle = await page.title();

    const pagePromise = context.waitForEvent('page');
    await page.click('a[href="/windows/new"]');

    const newPage = await pagePromise;
    await newPage.waitForLoadState();

    // Close the new page
    await newPage.close();

    // Verify original page is still functional
    expect(page.url()).toBe(originalUrl);
    const currentTitle = await page.title();
    expect(currentTitle).toBe(originalTitle);

    // Verify original page is still interactive
    await expect(page.locator('a[href="/windows/new"]')).toBeVisible();
  });

  test('U8 — Multiple windows can be opened @regression', async ({ page, context }) => {
    const page1Promise = context.waitForEvent('page');
    await page.click('a[href="/windows/new"]');
    const page1 = await page1Promise;
    await page1.waitForLoadState();

    const page2Promise = context.waitForEvent('page');
    await page.click('a[href="/windows/new"]');
    const page2 = await page2Promise;
    await page2.waitForLoadState();

    // All three pages should be accessible
    expect(context.pages().length).toBeGreaterThanOrEqual(3);

    // Cleanup
    await page2.close();
    await page1.close();
  });
});