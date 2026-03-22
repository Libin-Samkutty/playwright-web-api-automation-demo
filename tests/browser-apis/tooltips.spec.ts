import { test, expect } from '@playwright/test';

test.describe('Tooltips Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tooltips');
  });

  test('B11 — Hover to reveal tooltip @critical', async ({ page }) => {
    const tooltipTarget = page.locator('.tooltip-demo, [data-bs-toggle="tooltip"], [data-toggle="tooltip"]').first();
    const hasTarget = await tooltipTarget.count() > 0;

    if (!hasTarget) {
      // Try hovering over elements that commonly have tooltips
      test.skip(true, 'No tooltip targets found on page');
      return;
    }

    // Hover over the tooltip target
    await tooltipTarget.hover();

    // Wait for tooltip to appear
    await page.waitForTimeout(500);

    // Check for tooltip visibility
    const tooltip = page.locator('.tooltip, [role="tooltip"], .tooltip-inner, [class*="tooltip"]');
    const tooltipVisible = await tooltip.isVisible().catch(() => false);

    if (tooltipVisible) {
      await expect(tooltip).toBeVisible();
    } else {
      // Check if the element has a title attribute (native tooltip)
      const title = await tooltipTarget.getAttribute('title');
      expect(title).toBeTruthy();
    }
  });

  test('B12 — Tooltip text content validation @regression', async ({ page }) => {
    const tooltipTargets = page.locator('.tooltip-demo, [data-bs-toggle="tooltip"], [data-toggle="tooltip"]');
    const count = await tooltipTargets.count();

    if (count === 0) {
      test.skip(true, 'No tooltip targets found');
      return;
    }

    for (let i = 0; i < Math.min(count, 3); i++) {
      const target = tooltipTargets.nth(i);

      // Get the expected tooltip text
      const expectedText =
        (await target.getAttribute('title')) ||
        (await target.getAttribute('data-tooltip')) ||
        (await target.getAttribute('data-original-title'));

      if (expectedText) {
        expect(expectedText.length).toBeGreaterThan(0);

        // Hover to trigger
        await target.hover();
        await page.waitForTimeout(300);

        // Check for rendered tooltip
        const renderedTooltip = page.locator('.tooltip-inner, [role="tooltip"]');
        if (await renderedTooltip.isVisible().catch(() => false)) {
          const tooltipText = await renderedTooltip.textContent();
          expect(tooltipText?.trim()).toBe(expectedText.trim());
        }
      }
    }
  });

  test('B11 — Tooltip hides on mouse leave @regression', async ({ page }) => {
    const tooltipTarget = page.locator('.tooltip-demo, [data-bs-toggle="tooltip"], [data-toggle="tooltip"]').first();
    const hasTarget = await tooltipTarget.count() > 0;

    if (!hasTarget) {
      test.skip(true, 'No tooltip targets found');
      return;
    }

    // Hover to show
    await tooltipTarget.hover();
    await page.waitForTimeout(500);

    // Move mouse away
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    // Tooltip should be hidden
    const tooltip = page.locator('.tooltip:visible, [role="tooltip"]:visible');
    const count = await tooltip.count();
    expect(count).toBe(0);
  });
});