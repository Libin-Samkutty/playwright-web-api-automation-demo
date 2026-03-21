import { test, expect } from '@playwright/test';

test.describe('Drag and Drop Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag-and-drop');
  });

  test('V1 — Drag element A to drop zone B @critical @flaky', async ({ page }) => {
    test.info().annotations.push({ type: 'retries', description: '2' });

    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    // Get initial text
    const initialAText = await columnA.locator('header').textContent();
    const initialBText = await columnB.locator('header').textContent();

    // Perform drag and drop
    await columnA.dragTo(columnB);

    // Assert the positions have swapped
    const finalAText = await columnA.locator('header').textContent();
    const finalBText = await columnB.locator('header').textContent();

    expect(finalAText).toBe(initialBText);
    expect(finalBText).toBe(initialAText);
  });

  test('V2 — Post-drop state validation @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const initialAText = await columnA.locator('header').textContent();

    // Perform drag
    await columnA.dragTo(columnB);

    // Validate both zones reflect the swap
    await expect(columnB.locator('header')).toHaveText(initialAText!);

    // Validate visual state — both columns should still be visible
    await expect(columnA).toBeVisible();
    await expect(columnB).toBeVisible();
  });

  test('V1 — Double drag returns to original state @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const originalA = await columnA.locator('header').textContent();
    const originalB = await columnB.locator('header').textContent();

    // First drag
    await columnA.dragTo(columnB);

    // Second drag — should swap back
    await columnA.dragTo(columnB);

    const finalA = await columnA.locator('header').textContent();
    const finalB = await columnB.locator('header').textContent();

    expect(finalA).toBe(originalA);
    expect(finalB).toBe(originalB);
  });
});