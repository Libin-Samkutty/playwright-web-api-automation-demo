import { Page, Locator, expect } from '@playwright/test';
import { WaitHelper } from '../helpers/wait.helper';
import { NetworkHelper } from '../helpers/network.helper';
import { step } from '../helpers/allure.helper';

export abstract class BasePage {
  readonly page: Page;
  readonly wait: WaitHelper;
  readonly network: NetworkHelper;

  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
    this.wait = new WaitHelper(page);
    this.network = new NetworkHelper(page);
  }

  async goto(): Promise<void> {
    await step(`Navigate to ${this.path}`, async () => {
      await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    });
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageHeading(): Promise<string> {
    const heading = this.page.locator('h1').first();
    await heading.waitFor({ state: 'visible' });
    return (await heading.textContent()) ?? '';
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ fullPage: true, path: `test-results/${name}.png` });
  }

  async dismissAnyDialog(): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      await dialog.dismiss();
    });
  }
}