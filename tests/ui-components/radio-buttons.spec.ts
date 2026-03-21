import { test, expect } from '@playwright/test';

test.describe('Radio Buttons Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/radio-buttons');
  });

  test('U3 — Select each radio option @critical', async ({ page }) => {
    const radioButtons = page.locator('input[type="radio"]');
    const count = await radioButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const radio = radioButtons.nth(i);
      const isDisabled = await radio.isDisabled();

      if (!isDisabled) {
        await radio.check();
        await expect(radio).toBeChecked();
      }
    }
  });

  test('U4 — Single-selection exclusivity @regression', async ({ page }) => {
    const radioButtons = page.locator('input[type="radio"]:not([disabled])');
    const count = await radioButtons.count();

    if (count < 2) {
      test.skip(true, 'Need at least 2 enabled radio buttons for exclusivity test');
      return;
    }

    // Select first radio
    const radioA = radioButtons.nth(0);
    const radioB = radioButtons.nth(1);

    // If they share the same name group, selecting B should deselect A
    const nameA = await radioA.getAttribute('name');
    const nameB = await radioB.getAttribute('name');

    if (nameA === nameB) {
      await radioA.check();
      await expect(radioA).toBeChecked();

      await radioB.check();
      await expect(radioB).toBeChecked();
      await expect(radioA).not.toBeChecked();
    } else {
      // Different groups — both can be checked
      await radioA.check();
      await radioB.check();
      await expect(radioA).toBeChecked();
      await expect(radioB).toBeChecked();
    }
  });

  test('U3 — Disabled radio cannot be selected @regression', async ({ page }) => {
    const disabledRadios = page.locator('input[type="radio"][disabled]');
    const count = await disabledRadios.count();

    if (count === 0) {
      test.skip(true, 'No disabled radio buttons found on page');
      return;
    }

    for (let i = 0; i < count; i++) {
      const radio = disabledRadios.nth(i);
      await expect(radio).toBeDisabled();
      await expect(radio).not.toBeChecked();
    }
  });
});