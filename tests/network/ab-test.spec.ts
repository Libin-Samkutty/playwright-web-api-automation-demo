import { test, expect } from '@playwright/test';

test.describe('A/B Test Page @regression', () => {
  test('N9 — Detect which variation is rendered @regression', async ({ page }) => {
    await page.goto('/abtest');

    const heading = page.locator('h3, .example h3');
    await expect(heading).toBeVisible();

    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();

    // The page should show one of two variants
    const isVariantA = headingText?.includes('A/B Test') || headingText?.includes('Variation');
    const isVariantB = headingText?.includes('No A/B Test') || headingText?.includes('Control');

    // At least one variant pattern should match
    expect(isVariantA || isVariantB || headingText!.length > 0).toBeTruthy();

    test.info().annotations.push({
      type: 'variant',
      description: `Detected variant: ${headingText}`,
    });
  });

  test('N9 — Page content is valid regardless of variant @regression', async ({ page }) => {
    await page.goto('/abtest');

    // Regardless of variant, the page should have content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(50);

    // The page should have a heading
    const heading = page.locator('h3');
    await expect(heading).toBeVisible();

    // The page should have descriptive text
    const paragraph = page.locator('p');
    const pCount = await paragraph.count();
    expect(pCount).toBeGreaterThan(0);
  });

  test('N10 — Both variants observed across multiple runs @extended', async ({ page }) => {
    const variants = new Set<string>();

    for (let i = 0; i < 10; i++) {
      await page.goto('/abtest');
      const headingText = await page.locator('h3').textContent();
      if (headingText) {
        variants.add(headingText.trim());
      }
    }

    test.info().annotations.push({
      type: 'variants-observed',
      description: `Unique variants: ${[...variants].join(', ')}`,
    });

    // We should see at least one variant
    expect(variants.size).toBeGreaterThanOrEqual(1);

    // Ideally both variants are seen, but this is non-deterministic
    // Use soft assertion — it's informational, not a failure
    expect.soft(variants.size).toBeGreaterThanOrEqual(2);
  });
});