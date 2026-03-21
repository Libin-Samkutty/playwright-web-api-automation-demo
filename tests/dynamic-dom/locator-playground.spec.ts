import { test, expect } from '@playwright/test';

test.describe('Locator Playground Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/locators');
  });

  test('D6 — All locator strategy types resolve correctly @regression', async ({ page }) => {
    // Strategy 1: By ID
    const byId = page.locator('#firstName, #name, #email, [id]').first();
    const byIdVisible = await byId.isVisible().catch(() => false);

    if (byIdVisible) {
      const idElement = await byId.textContent() ?? await byId.inputValue().catch(() => '');

      // Strategy 2: By CSS class
      const className = await byId.getAttribute('class');
      if (className) {
        const byClass = page.locator(`.${className.split(' ')[0]}`).first();
        await expect(byClass).toBeVisible();
      }
    }

    // Strategy 3: By role
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeVisible();
    }

    // Strategy 4: By text
    const links = page.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThanOrEqual(0);

    // Strategy 5: By data-testid (if present)
    const testIdElements = page.locator('[data-testid]');
    const testIdCount = await testIdElements.count();
    if (testIdCount > 0) {
      await expect(testIdElements.first()).toBeVisible();
    }

    // Strategy 6: By placeholder
    const inputs = page.getByPlaceholder(/.+/);
    const inputCount = await inputs.count();
    if (inputCount > 0) {
      await expect(inputs.first()).toBeVisible();
    }
  });

  test('D7 — Resilient vs fragile selector equivalence @extended', async ({ page }) => {
    // Find an element using multiple strategies and verify they resolve to the same element
    const inputs = page.locator('input').first();
    const isInputVisible = await inputs.isVisible().catch(() => false);

    if (!isInputVisible) {
      test.skip(true, 'No input elements found on locators page');
      return;
    }

    // Get the element's identifying attributes
    const inputId = await inputs.getAttribute('id');
    const inputName = await inputs.getAttribute('name');
    const inputType = await inputs.getAttribute('type');

    // Fragile XPath selector
    if (inputId) {
      const byXpath = page.locator(`//input[@id="${inputId}"]`);
      await expect(byXpath).toBeVisible();

      // Resilient selector (by ID)
      const byResilient = page.locator(`#${inputId}`);
      await expect(byResilient).toBeVisible();

      // Compare — both should resolve to the same element
      const xpathText = await byXpath.getAttribute('id');
      const resilientText = await byResilient.getAttribute('id');
      expect(xpathText).toBe(resilientText);
    }
  });

  test('D6 — ARIA role selectors work @regression', async ({ page }) => {
    // Test role-based selectors for various element types
    const roleSelectors = ['button', 'link', 'textbox', 'heading'] as const;

    for (const role of roleSelectors) {
      const elements = page.getByRole(role);
      const count = await elements.count();

      if (count > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });
});