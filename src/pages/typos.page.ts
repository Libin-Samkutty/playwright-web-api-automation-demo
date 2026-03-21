import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class TyposPage extends BasePage {
  protected readonly path = '/typos';

  readonly content: Locator;
  readonly paragraphs: Locator;

  constructor(page: Page) {
    super(page);
    this.content = page.locator('.example, #content, main').first();
    this.paragraphs = page.locator('.example p, #content p, main p');
  }

  async getContentText(): Promise<string> {
    const texts = await this.paragraphs.allTextContents();
    return texts.map((t) => t.trim()).join(' ');
  }

  async matchesKnownVariant(variants: string[]): Promise<boolean> {
    const text = await this.getContentText();
    return variants.some((v) => text.includes(v));
  }

  async collectVariants(runs: number): Promise<string[]> {
    const variants: string[] = [];
    for (let i = 0; i < runs; i++) {
      await this.page.goto('/typos', { waitUntil: 'domcontentloaded' });
      const text = await this.getContentText();
      variants.push(text);
    }
    return variants;
  }
}