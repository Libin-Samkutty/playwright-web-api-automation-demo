import { test, expect } from '@playwright/test';
import { blockAdNetworks } from './block-ads';

// See ui-components.spec.ts for why `#core` is the scoped locator.
test.describe('Form Validation — Visual Regression @visual @regression', () => {
  test('V4 — Validation error state matches baseline', async ({ page }) => {
    await blockAdNetworks(page);
    await page.goto('/form-validation');

    // Trigger the error state deliberately — an untouched form and an
    // errored form are two different visual states, and the errored one
    // is the operationally risky one (error styling silently regressing
    // would not fail a single functional assertion). Wait for the
    // validation class itself, not a fixed timeout — Bootstrap adds
    // `was-validated` synchronously on submit, so this is deterministic.
    await page.locator('button[type="submit"]').first().click();
    await page.waitForSelector('form.was-validated');

    await expect(page.locator('#core')).toHaveScreenshot('form-validation-errors.png', {
      maxDiffPixelRatio: 0.002,
    });
  });
});
