import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class LargePagePage extends BasePage {
  protected readonly path = '/large';

  readonly siblings: Locator;
  readonly lastElement: Locator;

  constructor(page: Page) {
    super(page);
    this.siblings = page.locator('#siblings div, .sibling');
    this.lastElement = page.locator(
      '#siblings div:last-child, .sibling:last-child, [id*="sibling-50"]',
    ).first();
  }

  async getElementCount(): Promise<number> {
    return this.siblings.count();
  }

  async findDeepElement(selector: string): Promise<Locator> {
    return this.page.locator(selector);
  }

  async measurePageLoadTime(): Promise<number> {
    return step('Measure page load time', async () => {
      const timing = await this.page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return perf.domContentLoadedEventEnd - perf.startTime;
      });
      return timing;
    });
  }

  async isLastElementVisible(): Promise<boolean> {
    await this.lastElement.scrollIntoViewIfNeeded();
    return this.lastElement.isVisible();
  }

  async locateElementWithinTimeout(selector: string, timeout = 5000): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout });
      return true;
    } catch {
      return false;
    }
  }
}