import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class SecurePage extends BasePage {
  protected readonly path = '/secure';

  readonly logoutButton: Locator;
  readonly flashMessage: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.logoutButton = page.locator('a[href="/logout"], .button.secondary, a:has-text("Logout")');
    this.flashMessage = page.locator('#flash');
    this.heading = page.locator('h2, h1').first();
  }

  async logout(): Promise<void> {
    await step('Click logout button', async () => {
      await this.logoutButton.click();
    });
  }

  async expectSecurePage(): Promise<void> {
    await step('Verify landed on secure page', async () => {
      await expect(this.page).toHaveURL(/.*\/secure/);
      await expect(this.heading).toBeVisible();
    });
  }

  async expectLogoutSuccess(): Promise<void> {
    await step('Verify logout redirect to login', async () => {
      await expect(this.page).toHaveURL(/.*\/login/);
    });
  }

  async getFlashText(): Promise<string> {
    await this.flashMessage.waitFor({ state: 'visible' });
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }
}