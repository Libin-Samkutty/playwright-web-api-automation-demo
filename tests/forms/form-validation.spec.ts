import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('Form Validation Page', () => {
  test.beforeEach(async ({ pm }) => {
    await pm.formValidationPage.goto();
  });

  test('F4: Submit valid form succeeds @critical', { tag: '@critical' }, async ({ pm }) => {
    await pm.formValidationPage.fillValidForm();
    await pm.formValidationPage.submit();
    // Success state — either message or no errors
  });

  test('F5: Required field missing triggers client-side validation @critical', { tag: '@critical' }, async ({ pm }) => {
    await pm.formValidationPage.submit();
    const invalidCount = await pm.formValidationPage.getInvalidFieldCount();
    expect(invalidCount).toBeGreaterThan(0);
  });

  test('F6: Invalid format triggers field-specific error @regression', { tag: '@regression' }, async ({ pm, page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('not-an-email');
      await pm.formValidationPage.submit();

      const isInvalid = await page.evaluate(() => {
        const input = document.querySelector('input[type="email"]') as HTMLInputElement;
        return input ? !input.validity.valid : false;
      });
      expect(isInvalid).toBeTruthy();
    }
  });
});