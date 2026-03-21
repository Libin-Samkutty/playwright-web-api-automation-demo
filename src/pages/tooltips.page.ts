import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class TooltipsPage extends BasePage {
  protected readonly path = '/tooltips';

  readonly hoverTarget: Locator;
  readonly tooltip: Locator;

  constructor(page: Page) {
    super(page);
    this.hoverTarget = page.locator('[title], [data-tooltip], .tooltip-target, [data-bs-toggle="tooltip"]').first();
    this.tooltip = page.locator('.tooltip, [role="tooltip"], .tooltip-inner').first();
  }

  async hoverOverTarget(): Promise<void> {
    await step('Hover over tooltip target', async () => {
      await this.hoverTarget.hover();
      await this.page.waitForTimeout(300);
    });
  }

  async getTooltipText(): Promise<string> {
    return step('Get tooltip text', async () => {
      await this.tooltip.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      if (await this.tooltip.isVisible()) {
        return (await this.tooltip.textContent())?.trim() ?? '';
      }
      return (await this.hoverTarget.getAttribute('title')) ?? '';
    });
  }

  async isTooltipVisible(): Promise<boolean> {
    await this.page.waitForTimeout(300);
    return this.tooltip.isVisible().catch(() => false);
  }

  async hoverAway(): Promise<void> {
    await step('Hover away from target', async () => {
      await this.page.mouse.move(0, 0);
      await this.page.waitForTimeout(300);
    });
  }
}