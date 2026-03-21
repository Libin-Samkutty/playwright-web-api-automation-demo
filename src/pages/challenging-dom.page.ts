import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class ChallengingDomPage extends BasePage {
  protected readonly path = '/challenging-dom';

  readonly buttons: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly canvas: Locator;

  constructor(page: Page) {
    super(page);
    this.buttons = page.locator('.large-2 a.button, .button');
    this.table = page.locator('table');
    this.tableRows = page.locator('table tbody tr');
    this.canvas = page.locator('canvas, #canvas');
  }

  async getButtonByText(text: string): Promise<Locator> {
    return this.page.locator(`a.button:has-text("${text}"), button:has-text("${text}")`).first();
  }

  async getButtonByRole(): Promise<Locator> {
    return this.page.getByRole('link', { name: /edit|delete/i }).first();
  }

  async clickFirstButton(): Promise<void> {
    await step('Click first button on challenging DOM', async () => {
      await this.buttons.first().click();
    });
  }

  async getTableCellValue(row: number, col: number): Promise<string> {
    const cell = this.tableRows.nth(row).locator('td').nth(col);
    return (await cell.textContent())?.trim() ?? '';
  }

  async getTableRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getButtonTexts(): Promise<string[]> {
    const texts = await this.buttons.allTextContents();
    return texts.map((t) => t.trim());
  }

  async verifyStableElements(): Promise<boolean> {
    return step('Verify elements are locatable after refresh', async () => {
      const tableBefore = await this.table.isVisible();
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
      const tableAfter = await this.table.isVisible();
      return tableBefore && tableAfter;
    });
  }
}