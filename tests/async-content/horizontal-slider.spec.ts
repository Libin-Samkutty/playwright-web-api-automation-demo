import { test, expect } from '@playwright/test';

test.describe('Horizontal Slider Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/horizontal-slider');
  });

  test('Y4 — Drag slider to specific value via mouse @critical', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    const valueDisplay = page.locator('#range, #value, [id*="range"], output, span');

    // Get slider properties
    const min = parseFloat((await slider.getAttribute('min')) || '0');
    const max = parseFloat((await slider.getAttribute('max')) || '5');
    const step = parseFloat((await slider.getAttribute('step')) || '0.5');

    // Get slider bounding box
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();

    // Calculate target position for value 3 (middle of range)
    const targetValue = Math.min(3, max);
    const ratio = (targetValue - min) / (max - min);
    const targetX = box!.x + box!.width * ratio;
    const targetY = box!.y + box!.height / 2;

    // Click at the target position
    await page.mouse.click(targetX, targetY);
    await page.waitForTimeout(300);

    // Verify the value
    const currentValue = await slider.inputValue();
    const numericValue = parseFloat(currentValue);

    // Allow for step-size approximation
    expect(Math.abs(numericValue - targetValue)).toBeLessThanOrEqual(step * 2);
  });

  test('Y5 — Increment slider via keyboard arrow keys @regression', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    const step = parseFloat((await slider.getAttribute('step')) || '0.5');

    // Focus the slider
    await slider.focus();

    // Get initial value
    const initialValue = parseFloat(await slider.inputValue());

    // Press ArrowRight 3 times
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const afterRight = parseFloat(await slider.inputValue());
    expect(afterRight).toBeGreaterThan(initialValue);

    // Press ArrowLeft to go back
    await page.keyboard.press('ArrowLeft');
    const afterLeft = parseFloat(await slider.inputValue());
    expect(afterLeft).toBeLessThan(afterRight);

    // Verify step increments are correct
    const expectedAfterRight = Math.min(initialValue + 3 * step, parseFloat((await slider.getAttribute('max')) || '5'));
    expect(Math.abs(afterRight - expectedAfterRight)).toBeLessThanOrEqual(step);
  });

  test('Y6 — Slider cannot exceed max or min @regression', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    const min = parseFloat((await slider.getAttribute('min')) || '0');
    const max = parseFloat((await slider.getAttribute('max')) || '5');

    // Focus slider and press ArrowRight many times to go past max
    await slider.focus();
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const maxValue = parseFloat(await slider.inputValue());
    expect(maxValue).toBeLessThanOrEqual(max);
    expect(maxValue).toBe(max);

    // Press ArrowLeft many times to go past min
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('ArrowLeft');
    }

    const minValue = parseFloat(await slider.inputValue());
    expect(minValue).toBeGreaterThanOrEqual(min);
    expect(minValue).toBe(min);
  });
});