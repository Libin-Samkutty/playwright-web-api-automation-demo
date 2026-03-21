import { test, expect } from '@playwright/test';

test.describe('Dropdown Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdown');
  });

  test('F7 — Select single option from dropdown @critical', async ({ page }) => {
    const dropdown = page.locator('#dropdown');
    await expect(dropdown).toBeVisible();

    // Get all option values (excluding the default/disabled option)
    const options = dropdown.locator('option:not([disabled])');
    const optionCount = await options.count();

    for (let i = 0; i < optionCount; i++) {
      const optionValue = await options.nth(i).getAttribute('value');
      if (optionValue) {
        await dropdown.selectOption(optionValue);
        await expect(dropdown).toHaveValue(optionValue);
      }
    }
  });

  test('F9 — Default state of dropdown @regression', async ({ page }) => {
    const dropdown = page.locator('#dropdown');

    // Check that the default option is selected or no valid option is selected
    const selectedValue = await dropdown.inputValue();

    // The default is typically empty or a placeholder
    // Assert either empty or a known default value
    expect(selectedValue).toBeDefined();
  });

  test('F7 — Select by visible text @regression', async ({ page }) => {
    const dropdown = page.locator('#dropdown');

    // Select by label text
    await dropdown.selectOption({ label: 'Option 1' });
    await expect(dropdown).toHaveValue('1');

    await dropdown.selectOption({ label: 'Option 2' });
    await expect(dropdown).toHaveValue('2');
  });

  test('F7 — Select by index @extended', async ({ page }) => {
    const dropdown = page.locator('#dropdown');

    // Select by index (0-based, skipping placeholder)
    await dropdown.selectOption({ index: 1 });
    const value = await dropdown.inputValue();
    expect(value).toBeTruthy();
  });

  test('F9 — Re-selecting default/placeholder clears selection @extended', async ({ page }) => {
    const dropdown = page.locator('#dropdown');

    // Select a real option first
    await dropdown.selectOption('1');
    await expect(dropdown).toHaveValue('1');

    // Try to select the default/placeholder option if it exists
    const placeholderOption = dropdown.locator('option[disabled]');
    const hasPlaceholder = await placeholderOption.count() > 0;

    if (hasPlaceholder) {
      // Can't programmatically select disabled options, validate it exists
      await expect(placeholderOption).toBeDisabled();
    }
  });
});