import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class LocatorsPage extends BasePage {
  protected readonly path = '/locators';

  constructor(page: Page) {
    super(page);
  }

  byId(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  byCss(selector: string): Locator {
    return this.page.locator(selector);
  }

  byXPath(xpath: string): Locator {
    return this.page.locator(`xpath=${xpath}`);
  }

  byText(text: string): Locator {
    return this.page.getByText(text);
  }

  byRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1],
  ): Locator {
    return this.page.getByRole(role, options);
  }

  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  byLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  byPlaceholder(text: string): Locator {
    return this.page.getByPlaceholder(text);
  }

  async getTextContentByMultipleStrategies(
    strategies: Array<() => Locator>,
  ): Promise<string[]> {
    const results: string[] = [];
    for (const strategy of strategies) {
      const locator = strategy();
      try {
        const text = await locator.textContent({ timeout: 3000 });
        results.push(text?.trim() ?? '');
      } catch {
        results.push('NOT_FOUND');
      }
    }
    return results;
  }
}