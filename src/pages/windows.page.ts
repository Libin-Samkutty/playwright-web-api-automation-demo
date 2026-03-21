import { Page, Locator, BrowserContext } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class WindowsPage extends BasePage {
  protected readonly path = '/windows';

  readonly newWindowLink: Locator;

  constructor(page: Page) {
    super(page);
    this.newWindowLink = page.locator(
      'a[href="/windows/new"], a:has-text("Click Here"), a[target="_blank"]',
    ).first();
  }

  async openNewWindowAndGetPage(): Promise<Page> {
    return step('Open new window and capture page', async () => {
      const context = this.page.context();
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        this.newWindowLink.click(),
      ]);
      await newPage.waitForLoadState('domcontentloaded');
      return newPage;
    });
  }

  async getNewWindowContent(newPage: Page): Promise<string> {
    const body = newPage.locator('body');
    return (await body.textContent())?.trim() ?? '';
  }

  async closePageAndReturnToOriginal(newPage: Page): Promise<void> {
    await step('Close new page and return to original', async () => {
      await newPage.close();
    });
  }
}