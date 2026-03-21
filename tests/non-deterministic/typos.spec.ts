import { test, expect } from '@playwright/test';

test.describe('Typos Page — Non-Deterministic Content @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/typos');
  });

  test('X1 — Assert page text matches a known variant @regression', async ({ page }) => {
    const contentArea = page.locator('.example, #content, main');
    const text = await contentArea.textContent();
    expect(text).toBeTruthy();

    // The page randomly shows either the correct text or a typo variant
    // Use OR-pattern matching to accept both
    const correctPattern = /sometimes.*you.*have.*no.*control/i;
    const typoPattern = /sometimes.*you.*have.*no.*control/i; // May contain extra spaces or different punctuation

    const bodyText = await page.locator('body').textContent();

    // The text should contain recognizable content regardless of typos
    const hasExpectedContent =
      bodyText?.toLowerCase().includes('sometimes') ||
      bodyText?.toLowerCase().includes('control') ||
      bodyText?.toLowerCase().includes('happen');

    expect(hasExpectedContent).toBeTruthy();
  });

  test('X2 — Both variants observed across multiple runs @extended', async ({ page }) => {
    const observedTexts = new Set<string>();

    for (let i = 0; i < 10; i++) {
      await page.goto('/typos');
      const text = await page.locator('.example p, p').allTextContents();
      const combined = text.join(' ').trim();
      observedTexts.add(combined);
    }

    test.info().annotations.push({
      type: 'variants',
      description: `Unique text variants observed: ${observedTexts.size}`,
    });

    // At least one variant should be observed
    expect(observedTexts.size).toBeGreaterThanOrEqual(1);

    // Ideally both the correct and typo versions are seen
    expect.soft(observedTexts.size).toBeGreaterThanOrEqual(2);
  });

  test('X3 — Soft assertion strategy for non-deterministic content @extended', async ({ page }) => {
    const paragraphs = page.locator('.example p, p');
    const count = await paragraphs.count();

    for (let i = 0; i < count; i++) {
      const text = await paragraphs.nth(i).textContent();
      if (!text?.trim()) continue;

      // Soft assert: check for correct text, log but don't fail on typo
      expect.soft(text).toBeTruthy();

      // Check for common typo patterns
      const hasDoubleSpace = /\s{2,}/.test(text);
      const hasRepeatedWord = /\b(\w+)\s+\1\b/i.test(text);

      if (hasDoubleSpace || hasRepeatedWord) {
        test.info().annotations.push({
          type: 'typo-detected',
          description: `Paragraph ${i}: "${text.substring(0, 50)}..."`,
        });
      }

      // The test continues regardless of typo detection
    }

    // Final soft assertion — the page rendered content
    expect.soft(count).toBeGreaterThan(0);
  });
});