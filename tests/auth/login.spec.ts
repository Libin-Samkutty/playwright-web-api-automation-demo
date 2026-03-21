import { test, expect } from '../../src/fixtures/base.fixture';
import { UserFactory } from '../../src/data/factories/user.factory';

test.describe('Login Page — Authentication Flows', () => {
  test.beforeEach(async ({ pm }) => {
    await pm.loginPage.goto();
  });

  test('A1: Successful login with valid credentials @smoke', { tag: '@smoke' }, async ({ pm }) => {
    const creds = UserFactory.defaultLogin();
    await pm.loginPage.login(creds.username, creds.password);
    await expect(pm.loginPage.page).toHaveURL(/.*\/secure/);
    await pm.loginPage.expectSuccessMessage();
  });

  test('A2: Invalid username shows specific error @critical', { tag: '@critical' }, async ({ pm }) => {
    await pm.loginPage.login('invaliduser', 'SuperSecretPassword!');
    await expect(pm.loginPage.page).toHaveURL(/.*\/login/);
    await pm.loginPage.expectInvalidUsernameError();
  });

  test('A3: Invalid password shows specific error @critical', { tag: '@critical' }, async ({ pm }) => {
    await pm.loginPage.login('practice', 'WrongPassword123');
    await expect(pm.loginPage.page).toHaveURL(/.*\/login/);
    await pm.loginPage.expectInvalidPasswordError();
  });

  test('A4: Session persists after page refresh @regression', { tag: '@regression' }, async ({ pm, page, context }) => {
    const creds = UserFactory.defaultLogin();
    await pm.loginPage.login(creds.username, creds.password);
    await expect(page).toHaveURL(/.*\/secure/);

    const storagePath = '.auth/session-test.json';
    await context.storageState({ path: storagePath });

    const newContext = await page.context().browser()!.newContext({
      storageState: storagePath,
    });
    const newPage = await newContext.newPage();
    await newPage.goto('/secure');
    await expect(newPage).toHaveURL(/.*\/secure/);
    await newContext.close();
  });

  test('A5: Logout invalidates session @critical', { tag: '@critical' }, async ({ pm, page }) => {
    const creds = UserFactory.defaultLogin();
    await pm.loginPage.login(creds.username, creds.password);
    await expect(page).toHaveURL(/.*\/secure/);

    await pm.securePage.logout();
    await page.goto('/secure');
    await expect(page).toHaveURL(/.*\/login/);
  });
});