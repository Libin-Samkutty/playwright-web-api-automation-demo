import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class DropdownPage extends BasePage {
  protected readonly path = '/dropdown';

  readonly singleDropdown: Locator;
  readonly multipleDropdown: Locator;
  readonly allDropdowns: Locator;

  constructor(page: Page) {
    super(page);
    this.singleDropdown = page.locator('#dropdown, select').first();
    this.multipleDropdown = page.locator('select[multiple]').first();
    this.allDropdowns = page.locator('select');
  }

  async selectByValue(value: string): Promise<void> {
    await step(`Select dropdown value: ${value}`, async () => {
      await this.singleDropdown.selectOption(value);
    });
  }

  async selectByLabel(label: string): Promise<void> {
    await step(`Select dropdown label: ${label}`, async () => {
      await this.singleDropdown.selectOption({ label });
    });
  }

  async selectByIndex(index: number): Promise<void> {
    await step(`Select dropdown index: ${index}`, async () => {
      await this.singleDropdown.selectOption({ index });
    });
  }

  async getSelectedValue(): Promise<string> {
    return this.singleDropdown.inputValue();
  }

  async getSelectedText(): Promise<string> {
    return this.page.evaluate(() => {
      const select = document.querySelector('select') as HTMLSelectElement;
      return select?.options[select.selectedIndex]?.text ?? '';
    });
  }

  async getAllOptions(): Promise<string[]> {
    return this.singleDropdown.locator('option').allTextContents();
  }

  async selectMultiple(values: string[]): Promise<void> {
    await step(`Select multiple values: ${values.join(', ')}`, async () => {
      await this.multipleDropdown.selectOption(values);
    });
  }

  async getMultipleSelectedValues(): Promise<string[]> {
    return this.page.evaluate(() => {
      const select = document.querySelector(
        'select[multiple]',
      ) as HTMLSelectElement;
      if (!select) return [];
      return Array.from(select.selectedOptions).map((opt) => opt.value);
    });
  }

  async isDefaultSelected(): Promise<boolean> {
    const value = await this.getSelectedValue();
    return value === '' || value === '0';
  }
}