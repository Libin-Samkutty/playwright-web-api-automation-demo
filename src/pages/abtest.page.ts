import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class ABTestPage extends BasePage {
  protected readonly path = '/abtest';

  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h3').first();
    this.description = page.locator('p').first();
  }

  async getVariant(): Promise<string> {
    return step('Detect A/B test variant', async () => {
      const heading = await this.heading.textContent();
      return heading?.trim() ?? '';
    });
  }

  async isVariantA(): Promise<boolean> {
    const variant = await this.getVariant();
    return variant.includes('A') || variant.includes('Control');
  }

  async isVariantB(): Promise<boolean> {
    const variant = await this.getVariant();
    return variant.includes('B') || variant.includes('Variation');
  }

  async isValidVariant(): Promise<boolean> {
    return (await this.isVariantA()) || (await this.isVariantB());
  }

  async collectVariantsOverRuns(
    page: Page,
    runs: number,
  ): Promise<string[]> {
    const variants: string[] = [];
    for (let i = 0; i < runs; i++) {
      await page.goto('/abtest', { waitUntil: 'domcontentloaded' });
      const variant = (await page.locator('h3').first().textContent())?.trim() ?? '';
      variants.push(variant);
    }
    return variants;
  }
}