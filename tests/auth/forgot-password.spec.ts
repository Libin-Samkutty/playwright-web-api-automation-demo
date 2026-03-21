import { test, expect } from '../../src/fixtures/base.fixture';
import { faker } from '@faker-js/faker';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ pm }) => {
    await pm.forgotPasswordPage.goto();
  });

  test('A10: Valid registered email shows success message @regression', { tag: '@regression' }, async ({ pm }) => {
    await pm.forgotPasswordPage.submitEmail('test@example.com');
    await pm.forgotPasswordPage.expectSuccessMessage();
  });

  test('A11: Invalid email format triggers validation @regression', { tag: '@regression' }, async ({ pm }) => {
    await pm.forgotPasswordPage.submitEmail('notanemail');
    await pm.forgotPasswordPage.expectEmailValidationError();
  });

  test('A12: Unregistered email handling @regression', { tag: '@regression' }, async ({ pm }) => {
    const fakeEmail = faker.internet.email({ provider: 'nonexistent.test' });
    await pm.forgotPasswordPage.submitEmail(fakeEmail);

    // Should either show success (no account leak) or a specific message
    const flashText = await pm.forgotPasswordPage.getFlashText().catch(() => '');
    expect(flashText.length).toBeGreaterThan(0);
  });
});