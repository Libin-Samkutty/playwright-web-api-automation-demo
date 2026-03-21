import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class RedirectPage extends BasePage {
  protected readonly path = '/redirector';

  readonly redirectLink: Locator;

  constructor(page: Page) {
    super(page);
    this.redirectLink = page.locator(
      'a[href*="redirect"], a:has-text("here"), a:has-text("Redirect")',
    ).first();
  }

  async clickRedirectAndGetFinalUrl(): Promise<string> {
    return step('Click redirect and get final URL', async () => {
      await this.redirectLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      return this.page.url();
    });
  }

  async interceptRedirectResponse(): Promise<{
    status: number;
    location: string;
  }> {
    return step('Intercept redirect response', async () => {
      let status = 0;
      let location = '';

      await this.page.route('**/redirect*', async (route) => {
        const response = await route.fetch();
        status = response.status();
        location = response.headers()['location'] ?? '';
        await route.fulfill({ response });
      });

      await this.redirectLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      return { status, location };
    });
  }

  async navigateAndFollowRedirect(url: string): Promise<string> {
    const response = await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
    });
    return this.page.url();
  }
}