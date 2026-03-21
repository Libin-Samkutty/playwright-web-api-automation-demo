import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class BrowserInfoPage extends BasePage {
  protected readonly path = '/';

  readonly browserInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.browserInfo = page.locator('#browser-info, .browser-info, [id*="browser"]').first();
  }

  async getDetectedBrowser(): Promise<string> {
    return this.page.evaluate(() => navigator.userAgent);
  }

  async isChromium(): Promise<boolean> {
    const ua = await this.getDetectedBrowser();
    return ua.includes('Chrome') || ua.includes('Chromium');
  }

  async isFirefox(): Promise<boolean> {
    const ua = await this.getDetectedBrowser();
    return ua.includes('Firefox');
  }

  async isWebKit(): Promise<boolean> {
    const ua = await this.getDetectedBrowser();
    return ua.includes('Safari') && !ua.includes('Chrome');
  }

  async getBrowserName(): Promise<string> {
    if (await this.isFirefox()) return 'Firefox';
    if (await this.isWebKit()) return 'WebKit';
    if (await this.isChromium()) return 'Chromium';
    return 'Unknown';
  }
}