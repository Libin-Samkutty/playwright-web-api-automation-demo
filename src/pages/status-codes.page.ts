import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class StatusCodesPage extends BasePage {
  protected readonly path = '/status-codes';

  readonly codeLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.codeLinks = page.locator('a[href*="status-codes/"], a[href*="status_codes/"]');
  }

  getCodeLink(code: number): Locator {
    return this.page.locator(`a[href*="${code}"]`).first();
  }

  async clickCodeAndGetResponse(code: number): Promise<{ status: number; url: string }> {
    return step(`Click status code link: ${code}`, async () => {
      const responsePromise = this.page.waitForResponse(
        (resp) => resp.url().includes(String(code)),
        { timeout: 10_000 },
      );
      await this.getCodeLink(code).click();
      const response = await responsePromise.catch(() => null);
      return {
        status: response?.status() ?? -1,
        url: this.page.url(),
      };
    });
  }

  async navigateToStatusCode(code: number): Promise<number> {
    const response = await this.page.goto(`/status-codes/${code}`);
    return response?.status() ?? -1;
  }

  async getAllCodeLinks(): Promise<string[]> {
    return this.codeLinks.allTextContents();
  }
}