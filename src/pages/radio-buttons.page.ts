import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class RadioButtonsPage extends BasePage {
  protected readonly path = '/radio-buttons';

  readonly radioButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.radioButtons = page.locator('input[type="radio"]');
  }

  async selectByIndex(index: number): Promise<void> {
    await step(`Select radio button ${index}`, async () => {
      await this.radioButtons.nth(index).check();
    });
  }

  async selectByValue(value: string): Promise<void> {
    await step(`Select radio button with value: ${value}`, async () => {
      await this.page.locator(`input[type="radio"][value="${value}"]`).check();
    });
  }

  async isSelected(index: number): Promise<boolean> {
    return this.radioButtons.nth(index).isChecked();
  }

  async getSelectedValue(): Promise<string | null> {
    const count = await this.radioButtons.count();
    for (let i = 0; i < count; i++) {
      if (await this.radioButtons.nth(i).isChecked()) {
        return this.radioButtons.nth(i).getAttribute('value');
      }
    }
    return null;
  }

  async getCount(): Promise<number> {
    return this.radioButtons.count();
  }

  async getCheckedCount(): Promise<number> {
    const count = await this.getCount();
    let checked = 0;
    for (let i = 0; i < count; i++) {
      if (await this.isSelected(i)) checked++;
    }
    return checked;
  }
}