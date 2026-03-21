import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class BrokenImagesPage extends BasePage {
  protected readonly path = '/broken-images';

  readonly images: Locator;

  constructor(page: Page) {
    super(page);
    this.images = page.locator('img');
  }

  async getImageCount(): Promise<number> {
    return this.images.count();
  }

  async getBrokenImages(): Promise<{ src: string; index: number }[]> {
    return step('Detect broken images', async () => {
      const count = await this.images.count();
      const broken: { src: string; index: number }[] = [];

      for (let i = 0; i < count; i++) {
        const img = this.images.nth(i);
        const naturalWidth = await img.evaluate(
          (el) => (el as HTMLImageElement).naturalWidth,
        );
        if (naturalWidth === 0) {
          const src = (await img.getAttribute('src')) ?? '';
          broken.push({ src, index: i });
        }
      }
      return broken;
    });
  }

  async getValidImages(): Promise<{ src: string; index: number }[]> {
    const count = await this.images.count();
    const valid: { src: string; index: number }[] = [];

    for (let i = 0; i < count; i++) {
      const img = this.images.nth(i);
      const naturalWidth = await img.evaluate(
        (el) => (el as HTMLImageElement).naturalWidth,
      );
      if (naturalWidth > 0) {
        const src = (await img.getAttribute('src')) ?? '';
        valid.push({ src, index: i });
      }
    }
    return valid;
  }

  async interceptImageRequests(): Promise<Map<string, number>> {
    return step('Intercept image HTTP responses', async () => {
      const statusMap = new Map<string, number>();

      await this.page.route(
        /\.(jpg|jpeg|png|gif|svg|webp)/,
        async (route) => {
          const response = await route.fetch().catch(() => null);
          statusMap.set(route.request().url(), response?.status() ?? 0);
          if (response) {
            await route.fulfill({ response });
          } else {
            await route.abort();
          }
        },
      );

      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(2000);
      return statusMap;
    });
  }
}