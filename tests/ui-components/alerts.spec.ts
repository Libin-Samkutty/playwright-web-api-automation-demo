import { test, expect } from '@playwright/test';

test.describe('Alerts / Dialogs Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/js-alerts');
  });

  test('U5 — Accept JS alert @critical', async ({ page }) => {
    let alertMessage = '';

    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('button:has-text("JS Alert")');

    // Wait for the result to appear
    const result = page.locator('#result');
    await expect(result).toHaveText(/You successfully clicked an alert/i);
    expect(alertMessage).toBeTruthy();
  });

  test('U6 — Dismiss confirm dialog @critical', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    await page.click('button:has-text("JS Confirm")');

    const result = page.locator('#result');
    await expect(result).toHaveText(/Cancel/i);
  });

  test('U6 — Accept confirm dialog @regression', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.click('button:has-text("JS Confirm")');

    const result = page.locator('#result');
    await expect(result).toHaveText(/Ok/i);
  });

  test('U7 — Prompt dialog with input @regression', async ({ page }) => {
    const inputText = 'Playwright Test Input';

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept(inputText);
    });

    await page.click('button:has-text("JS Prompt")');

    const result = page.locator('#result');
    await expect(result).toContainText(inputText);
  });

  test('U7 — Dismiss prompt dialog (cancel) @regression', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });

    await page.click('button:has-text("JS Prompt")');

    const result = page.locator('#result');
    await expect(result).toHaveText(/null/i);
  });
});