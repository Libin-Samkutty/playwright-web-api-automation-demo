import { Page, Locator, expect } from '@playwright/test';

export class WaitHelper {
  constructor(private page: Page) {}

  async forDomStable(timeout = 2000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(100); // micro-settle only when needed
  }

  async forSelectorVisible(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout ?? 10_000,
    });
  }

  async forSelectorHidden(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'hidden',
      timeout: timeout ?? 10_000,
    });
  }

  async forUrlContains(substring: string, timeout?: number): Promise<void> {
    await this.page.waitForURL(`**/*${substring}*`, {
      timeout: timeout ?? 10_000,
    });
  }

  async forElementCount(
    locator: Locator,
    expectedCount: number,
    timeout = 10_000,
  ): Promise<void> {
    await expect(locator).toHaveCount(expectedCount, { timeout });
  }

  async forElementCountGreaterThan(
    locator: Locator,
    minCount: number,
    timeout = 10_000,
  ): Promise<void> {
    await expect
      .poll(async () => await locator.count(), { timeout })
      .toBeGreaterThan(minCount);
  }

  async forNetworkIdle(timeout?: number): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: timeout ?? 15_000,
    }).catch(() => {});
  }

  async pollUntil<T>(
    fn: () => Promise<T>,
    predicate: (value: T) => boolean,
    timeout = 10_000,
    interval = 250,
  ): Promise<T> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const value = await fn();
      if (predicate(value)) return value;
      await this.page.waitForTimeout(interval);
    }
    throw new Error(`pollUntil timed out after ${timeout}ms`);
  }
}