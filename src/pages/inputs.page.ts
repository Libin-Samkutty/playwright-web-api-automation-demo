import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class InputsPage extends BasePage {
  protected readonly path = '/inputs';

  readonly textInput: Locator;
  readonly numberInput: Locator;
  readonly dateInput: Locator;
  readonly colorInput: Locator;
  readonly rangeInput: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    super(page);
    this.textInput = page.locator('input[type="text"]').first();
    this.numberInput = page.locator('input[type="number"]').first();
    this.dateInput = page.locator('input[type="date"]').first();
    this.colorInput = page.locator('input[type="color"]').first();
    this.rangeInput = page.locator('input[type="range"]').first();
    this.clearButton = page.locator('button:has-text("Clear"), button[type="reset"], input[type="reset"]');
  }

  async fillText(value: string): Promise<void> {
    await step(`Fill text input: ${value}`, async () => {
      await this.textInput.fill(value);
    });
  }

  async fillNumber(value: string): Promise<void> {
    await step(`Fill number input: ${value}`, async () => {
      await this.numberInput.fill(value);
    });
  }

  async fillDate(value: string): Promise<void> {
    await step(`Fill date input: ${value}`, async () => {
      await this.dateInput.fill(value);
    });
  }

  async clearAll(): Promise<void> {
    await step('Clear all inputs', async () => {
      if (await this.clearButton.isVisible()) {
        await this.clearButton.click();
      } else {
        await this.textInput.clear();
        await this.numberInput.clear();
        await this.dateInput.clear();
      }
    });
  }

  async getTextValue(): Promise<string> {
    return this.textInput.inputValue();
  }

  async getNumberValue(): Promise<string> {
    return this.numberInput.inputValue();
  }

  async getDateValue(): Promise<string> {
    return this.dateInput.inputValue();
  }

  async isNumberInputInvalid(): Promise<boolean> {
    return this.page.evaluate(() => {
      const input = document.querySelector(
        'input[type="number"]',
      ) as HTMLInputElement | null;
      return input ? !input.validity.valid : false;
    });
  }
}