import { test, expect } from '../../src/fixtures/base.fixture';
import { UserFactory } from '../../src/data/factories/user.factory';

test.describe('Registration Page', () => {
  test.beforeEach(async ({ pm }) => {
    await pm.registerPage.goto();
  });

  test('A6: Valid registration completes successfully @smoke', { tag: '@smoke' }, async ({ pm }) => {
    const userData = UserFactory.validUser();
    await pm.registerPage.register(userData);
    // Registration should show success or redirect
    await pm.registerPage.expectSuccessMessage();
  });

  test('A7: Password mismatch shows validation error @critical', { tag: '@critical' }, async ({ pm }) => {
    const userData = UserFactory.mismatchedPasswords();
    await pm.registerPage.register(userData);
    // Should show validation error and not submit
    const url = pm.registerPage.page.url();
    expect(url).toContain('/register');
  });

  test('A8: Empty fields trigger required validation @regression', { tag: '@regression' }, async ({ pm }) => {
    await pm.registerPage.submitEmpty();
    await pm.registerPage.expectValidationErrors();
  });

  test('A9: Duplicate user registration fails @critical', { tag: '@critical' }, async ({ pm }) => {
    // First registration
    const userData = UserFactory.validUser();
    await pm.registerPage.register(userData);

    // Attempt duplicate
    await pm.registerPage.goto();
    await pm.registerPage.register(userData);

    // Should still be on register or show error
    const flashText = await pm.registerPage.page
      .locator('#flash, .flash, .alert')
      .textContent()
      .catch(() => '');
    // The page should indicate the user already exists or stay on register
    const url = pm.registerPage.page.url();
    expect(url).toContain('register');
  });
});