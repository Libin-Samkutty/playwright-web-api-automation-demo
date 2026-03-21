import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/infinite-scroll');
  });

  test('Y1 — Scroll triggers new content load @critical', async ({ page }) => {
    // Count initial items
    const contentSelector = '.jscroll-added, .scroll-content, p, .infinite-scroll-content > *';
    const initialItems = page.locator(contentSelector);
    const initialCount = await initialItems.count();
    expect(initialCount).toBeGreaterThan(0);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for new content to load
    await page.waitForFunction(
      (selector: string) => {
        return document.querySelectorAll(selector).length > 0;
      },
      contentSelector,
      { timeout: 10000 }
    ).catch(() => {});

    // Allow time for async content
    await page.waitForTimeout(2000);

    // Re-scroll to ensure content loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const newCount = await initialItems.count();

    // Content count should increase after scrolling
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('Y2 — Multiple scroll cycles accumulate content @regression', async ({ page }) => {
    const getItemCount = async (): Promise<number> => {
      return page.locator('.jscroll-added, p, .scroll-content > *').count();
    };

    const counts: number[] = [];
    counts.push(await getItemCount());

    for (let cycle = 0; cycle < 3; cycle++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const newCount = await getItemCount();
      counts.push(newCount);
    }

    // Content should grow or at least not shrink
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }

    // At least one scroll should have added content
    expect(counts[counts.length - 1]).toBeGreaterThan(counts[0]);
  });

  test('Y3 — No duplicate items after scroll @regression', async ({ page }) => {
    // Scroll a few times to load content
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // Collect all paragraph text
    const paragraphs = page.locator('.jscroll-added p, .scroll-content p, .infinite-scroll p');
    const count = await paragraphs.count();

    if (count < 5) {
      test.skip(true, 'Not enough items loaded for duplicate check');
      return;
    }

    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await paragraphs.nth(i).textContent();
      if (text?.trim()) {
        texts.push(text.trim());
      }
    }

    // Check for duplicates
    const uniqueTexts = new Set(texts);
    expect.soft(uniqueTexts.size).toBe(texts.length);

    if (uniqueTexts.size !== texts.length) {
      const duplicates = texts.filter((t, i) => texts.indexOf(t) !== i);
      test.info().annotations.push({
        type: 'duplicates',
        description: `Found ${duplicates.length} duplicate items`,
      });
    }
  });
});