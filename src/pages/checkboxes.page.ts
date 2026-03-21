import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class CheckboxesPage extends BasePage {
  protected readonly path = '/checkboxes';

  readonly checkboxes: Locator;

  constructor(page: Page) {
    super(page);
    this.checkboxes = page.locator('input[type="checkbox"]');
  }

  async getCheckbox(index: number): Promise<Locator> {
    return this.checkboxes.nth(index);
  }

  async check(index: number): Promise<void> {
    await step(`Check checkbox ${index}`, async () => {
      await this.checkboxes.nth(index).check();
    });
  }

  async uncheck(index: number): Promise<void> {
    await step(`Uncheck checkbox ${index}`, async () => {
      await this.checkboxes.nth(index).uncheck();
    });
  }

  async isChecked(index: number): Promise<boolean> {
    return this.checkboxes.nth(index).isChecked();
  }

  async getCount(): Promise<number> {
    return this.checkboxes.count();
  }

  async getDefaultStates(): Promise<boolean[]> {
    const count = await this.getCount();
    const states: boolean[] = [];
    for (let i = 0; i < count; i++) {
      states.push(await this.isChecked(i));
    }
    return states;
  }

  async toggleAll(): Promise<void> {
    await step('Toggle all checkboxes', async () => {
      const count = await this.getCount();
      for (let i = 0; i < count; i++) {
        const checkbox = this.checkboxes.nth(i);
        if (await checkbox.isChecked()) {
          await checkbox.uncheck();
        } else {
          await checkbox.check();
        }
      }
    });
  }
}