import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';
import { UserData } from '../data/factories/user.factory';

export class RegisterPage extends BasePage {
  protected readonly path = '/notes/app/register';

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly flashMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#name, input[name="name"]');
    this.emailInput = page.locator('#email, input[name="email"]');
    this.passwordInput = page.locator('#password, input[name="password"]');
    this.confirmPasswordInput = page.locator(
      '#confirmPassword, input[name="confirmPassword"], #confirm-password, input[name="confirm-password"]',
    );
    this.submitButton = page.locator('button[type="submit"]');
    this.flashMessage = page.locator('#flash, .flash, .alert');
    this.validationErrors = page.locator('.invalid-feedback, .error-message, .field-error');
  }

  async register(userData: UserData): Promise<void> {
    await step(`Register user: ${userData.email}`, async () => {
      await this.nameInput.fill(userData.name);
      await this.emailInput.fill(userData.email);
      await this.passwordInput.fill(userData.password);
      if (await this.confirmPasswordInput.isVisible()) {
        await this.confirmPasswordInput.fill(userData.confirmPassword);
      }
      await this.submitButton.click();
    });
  }

  async submitEmpty(): Promise<void> {
    await step('Submit empty registration form', async () => {
      await this.submitButton.click();
    });
  }

  async expectSuccessMessage(): Promise<void> {
    await step('Verify registration success', async () => {
      await expect(this.flashMessage).toBeVisible({ timeout: 10_000 });
    });
  }

  async expectValidationErrors(): Promise<void> {
    await step('Verify validation errors are shown', async () => {
      const hasNativeValidation = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[required]');
        return Array.from(inputs).some((input) => !(input as HTMLInputElement).validity.valid);
      });

      if (!hasNativeValidation) {
        await expect(this.validationErrors.first()).toBeVisible();
      }
    });
  }

  async getRequiredFieldCount(): Promise<number> {
    return this.page.locator('input[required]').count();
  }
}