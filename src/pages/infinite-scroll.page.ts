import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class InfiniteScrollPage extends BasePage {
  protected readonly path = '/infinite-scroll';

  readonly scrollItems: Locator;
  readonly scrollContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.scrollItems = page.locator('.jscroll-added, .scroll-item, .infinite-scroll-item, p').first().locator('..');
    this.scrollContainer = page.locator('#infinite-scroll, .jscroll-inner, body');
  }

  get items(): Locator {
    return this.page.locator('.jscroll-added p, .scroll-item, .infinite-scroll-item');
  }

  async getItemCount(): Promise<number> {
    return this.items.count();
  }

  async scrollAndWaitForMore(currentCount: number, timeout = 5000): Promise<number> {
    return step('Scroll and wait for new items', async () => {
      await this.scrollToBottom();
      await expect
        .poll(async () => this.items.count(), { timeout })
        .toBeGreaterThan(currentCount);
      return this.items.count();
    });
  }

  async scrollMultipleTimes(times: number): Promise<number[]> {
    const counts: number[] = [];
    let currentCount = await this.getItemCount();
    counts.push(currentCount);

    for (let i = 0; i < times; i++) {
      await step(`Scroll cycle ${i + 1}`, async () => {
        currentCount = await this.scrollAndWaitForMore(currentCount);
        counts.push(currentCount);
      });
    }
    return counts;
  }

  async getAllItemTexts(): Promise<string[]> {
    return this.items.allTextContents();
  }

  async getDuplicates(): Promise<string[]> {
    const texts = await this.getAllItemTexts();
    const trimmed = texts.map((t) => t.trim()).filter((t) => t.length > 0);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const text of trimmed) {
      if (seen.has(text)) {
        duplicates.push(text);
      }
      seen.add(text);
    }
    return duplicates;
  }
}