import { Page, Locator, Dialog } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class AlertsPage extends BasePage {
  protected readonly path = '/js-alerts';

  readonly alertButton: Locator;
  readonly confirmButton: Locator;
  readonly promptButton: Locator;
  readonly resultText: Locator;

  constructor(page: Page) {
    super(page);
    this.alertButton = page.locator('button:has-text("JS Alert"), button:has-text("Alert")').first();
    this.confirmButton = page.locator('button:has-text("JS Confirm"), button:has-text("Confirm")').first();
    this.promptButton = page.locator('button:has-text("JS Prompt"), button:has-text("Prompt")').first();
    this.resultText = page.locator('#result');
  }

  async triggerAlertAndAccept(): Promise<string> {
    return step('Trigger alert and accept', async () => {
      let alertText = '';
      this.page.once('dialog', async (dialog: Dialog) => {
        alertText = dialog.message();
        await dialog.accept();
      });
      await this.alertButton.click();
      await this.page.waitForTimeout(200);
      return alertText;
    });
  }

  async triggerConfirmAndAccept(): Promise<string> {
    return step('Trigger confirm and accept', async () => {
      let dialogText = '';
      this.page.once('dialog', async (dialog: Dialog) => {
        dialogText = dialog.message();
        await dialog.accept();
      });
      await this.confirmButton.click();
      await this.page.waitForTimeout(200);
      return dialogText;
    });
  }

  async triggerConfirmAndDismiss(): Promise<string> {
    return step('Trigger confirm and dismiss', async () => {
      let dialogText = '';
      this.page.once('dialog', async (dialog: Dialog) => {
        dialogText = dialog.message();
        await dialog.dismiss();
      });
      await this.confirmButton.click();
      await this.page.waitForTimeout(200);
      return dialogText;
    });
  }

  async triggerPromptAndSubmit(inputText: string): Promise<string> {
    return step(`Trigger prompt and submit: ${inputText}`, async () => {
      let dialogText = '';
      this.page.once('dialog', async (dialog: Dialog) => {
        dialogText = dialog.message();
        await dialog.accept(inputText);
      });
      await this.promptButton.click();
      await this.page.waitForTimeout(200);
      return dialogText;
    });
  }

  async getResultText(): Promise<string> {
    await this.resultText.waitFor({ state: 'visible' });
    return (await this.resultText.textContent())?.trim() ?? '';
  }
}