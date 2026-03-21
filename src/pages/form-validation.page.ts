import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class FormValidationPage extends BasePage {
  protected readonly path = '/form-validation';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('#validationCustom01, input[name="firstName"]').first();
    this.lastNameInput = page.locator('#validationCustom02, input[name="lastName"]').first();
    this.emailInput = page.locator('input[type="email"]').first();
    this.phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
    this.messageInput = page.locator('textarea').first();
    this.submitButton = page.locator('button[type="submit"]');
    this.successMessage = page.locator('.alert-success, .success-message, #flash.success');
    this.validationErrors = page.locator('.invalid-feedback, .was-validated .form-control:invalid');
  }

  async fillValidForm(data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    message?: string;
  }): Promise<void> {
    await step('Fill form with valid data', async () => {
      if (await this.firstNameInput.isVisible()) {
        await this.firstNameInput.fill(data?.firstName ?? 'John');
      }
      if (await this.lastNameInput.isVisible()) {
        await this.lastNameInput.fill(data?.lastName ?? 'Doe');
      }
      if (await this.emailInput.isVisible()) {
        await this.emailInput.fill(data?.email ?? 'john@example.com');
      }
      if (await this.phoneInput.isVisible()) {
        await this.phoneInput.fill(data?.phone ?? '1234567890');
      }
      if (await this.messageInput.isVisible()) {
        await this.messageInput.fill(data?.message ?? 'Test message');
      }
    });
  }

  async submit(): Promise<void> {
    await step('Submit form', async () => {
      await this.submitButton.click();
    });
  }

  async expectValidationErrorsVisible(): Promise<void> {
    const hasValidation = await this.page.evaluate(() => {
      const form = document.querySelector('form');
      return form?.classList.contains('was-validated') || false;
    });
    if (!hasValidation) {
      await expect(this.validationErrors.first()).toBeVisible();
    }
  }

  async expectNoNetworkRequest(): Promise<boolean> {
    let requestFired = false;
    const handler = () => { requestFired = true; };
    this.page.on('request', handler);
    await this.submitButton.click();
    await this.page.waitForTimeout(500);
    this.page.removeListener('request', handler);
    return !requestFired;
  }

  async getInvalidFieldCount(): Promise<number> {
    return this.page.evaluate(() => {
      const form = document.querySelector('form');
      if (!form) return 0;
      const inputs = form.querySelectorAll('input, textarea, select');
      return Array.from(inputs).filter(
        (el) => !(el as HTMLInputElement).validity.valid,
      ).length;
    });
  }
}