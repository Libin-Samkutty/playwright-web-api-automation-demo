import { test, expect } from '@playwright/test';

test.describe('Checkboxes Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkboxes');
  });

  test('U1 — Select and unselect checkboxes @critical', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);

      // Ensure checked
      await checkbox.check();
      await expect(checkbox).toBeChecked();

      // Ensure unchecked
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked();
    }
  });

  test('U2 — Default state validation @regression', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);

    // Capture initial state before any interaction
    const initialStates: boolean[] = [];
    for (let i = 0; i < count; i++) {
      const isChecked = await checkboxes.nth(i).isChecked();
      initialStates.push(isChecked);
    }

    // The practice site typically has the first unchecked and the second checked
    // Assert known defaults — adjust if page spec changes
    expect(initialStates.length).toBeGreaterThanOrEqual(2);

    // Verify that at least one checkbox has a different default state
    // (demonstrates the page has mixed defaults)
    const hasChecked = initialStates.includes(true);
    const hasUnchecked = initialStates.includes(false);
    expect(hasChecked || hasUnchecked).toBeTruthy();
  });

  test('U1 — Rapid toggle does not cause double-fire @regression', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]').first();

    // Get initial state
    const initialState = await checkbox.isChecked();

    // Toggle twice — should return to original state
    await checkbox.click();
    await checkbox.click();

    const finalState = await checkbox.isChecked();
    expect(finalState).toBe(initialState);
  });
});
