import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly flashMessage: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash');
    this.errorMessage = page.locator('#flash.error, #flash.alert, .flash.error');
    this.successMessage = page.locator('#flash.success, .flash.success');
  }

  async login(username: string, password: string): Promise<void> {
    await step(`Login with username: ${username}`, async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    });
  }

  async getFlashText(): Promise<string> {
    await this.flashMessage.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }

  async expectSuccessMessage(): Promise<void> {
    await step('Verify success flash message', async () => {
      await expect(this.flashMessage).toBeVisible();
      const text = await this.getFlashText();
      expect(text).toContain('You logged into a secure area');
    });
  }

  async expectInvalidUsernameError(): Promise<void> {
    await step('Verify invalid username error', async () => {
      await expect(this.flashMessage).toBeVisible();
      const text = await this.getFlashText();
      expect(text).toContain('Your username is invalid');
    });
  }

  async expectInvalidPasswordError(): Promise<void> {
    await step('Verify invalid password error', async () => {
      await expect(this.flashMessage).toBeVisible();
      const text = await this.getFlashText();
      expect(text).toContain('Your password is invalid');
    });
  }

  async saveSessionState(path: string): Promise<void> {
    await this.page.context().storageState({ path });
  }
}