import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class ForgotPasswordPage extends BasePage {
  protected readonly path = '/forgot-password';

  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly flashMessage: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email, input[name="email"], input[type="email"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash, .flash, .alert');
    this.successMessage = page.locator('.flash.success, .alert-success, #flash.success');
    this.errorMessage = page.locator('.flash.error, .alert-danger, #flash.error');
  }

  async submitEmail(email: string): Promise<void> {
    await step(`Submit forgot password for: ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.submitButton.click();
    });
  }

  async getFlashText(): Promise<string> {
    await this.flashMessage.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.flashMessage.textContent())?.trim() ?? '';
  }

  async expectSuccessMessage(): Promise<void> {
    await step('Verify password reset success message', async () => {
      await expect(this.flashMessage).toBeVisible();
    });
  }

  async expectEmailValidationError(): Promise<void> {
    await step('Verify email validation error', async () => {
      const isInvalid = await this.page.evaluate(() => {
        const input = document.querySelector(
          'input[type="email"]',
        ) as HTMLInputElement | null;
        return input ? !input.validity.valid : false;
      });
      expect(isInvalid).toBeTruthy();
    });
  }
}