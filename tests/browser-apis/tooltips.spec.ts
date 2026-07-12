import { test, expect } from '@playwright/test';

test.describe('Tooltips Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tooltips');
  });

  test('B11 — Hover to reveal tooltip @critical', async ({ page }) => {
    // Bootstrap's tooltip plugin is initialized on the wrapping `.tooltip-demo`
    // container as the delegate, but the container itself has no `title` and
    // never triggers a tooltip — only its `[data-bs-toggle="tooltip"]` button
    // children do. Selecting `.tooltip-demo` here would deterministically
    // hover the wrong element and fail every run.
    const tooltipTarget = page.locator('[data-bs-toggle="tooltip"], [data-toggle="tooltip"]').first();
    const hasTarget = await tooltipTarget.count() > 0;

    if (!hasTarget) {
      test.skip(true, 'No tooltip targets found on page');
      return;
    }

    await tooltipTarget.hover();

    // Bootstrap adds `.show` to the rendered tooltip popper once visible, and
    // strips the trigger's `title` attribute the moment it initializes — so
    // falling back to a `title` check here would fail even on a working
    // tooltip. `.show` is also unambiguous, unlike a bare `.tooltip` selector
    // which also matches the popper's arrow/inner sub-elements.
    const tooltip = page.locator('.tooltip.show');
    await expect(tooltip).toBeVisible();
  });

  test('B12 — Tooltip text content validation @regression', async ({ page }) => {
    const tooltipTargets = page.locator('[data-bs-toggle="tooltip"], [data-toggle="tooltip"]');
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

        // `.tooltip-inner` is the single element holding the rendered text —
        // combining it with `[role="tooltip"]` (the outer popper) in one
        // locator matches two different elements and makes `isVisible()`
        // throw under strict mode, which the old `.catch(() => false)` was
        // silently swallowing, skipping the assertion below on every run.
        const renderedTooltip = page.locator('.tooltip-inner');
        await expect(renderedTooltip).toBeVisible();
        const tooltipText = await renderedTooltip.textContent();
        expect(tooltipText?.trim()).toBe(expectedText.replace(/<[^>]+>/g, '').trim());

        await page.mouse.move(0, 0);
      }
    }
  });

  test('B11 — Tooltip hides on mouse leave @regression', async ({ page }) => {
    const tooltipTarget = page.locator('[data-bs-toggle="tooltip"], [data-toggle="tooltip"]').first();
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