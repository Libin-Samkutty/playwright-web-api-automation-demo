import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class DynamicTablePage extends BasePage {
  protected readonly path = '/dynamic-table';

  readonly table: Locator;
  readonly headers: Locator;
  readonly rows: Locator;
  readonly comparisonLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('table, [role="table"], .table');
    this.headers = page.locator(
      'table thead th, [role="columnheader"], .table-header span, th',
    );
    this.rows = page.locator(
      'table tbody tr, [role="row"]:not([role="columnheader"]):not(:first-child)',
    );
    this.comparisonLabel = page.locator('.bg-warning, p.bg-warning');
  }

  async getHeaderTexts(): Promise<string[]> {
    const texts = await this.headers.allTextContents();
    return texts.map((t) => t.trim());
  }

  async getColumnIndex(headerName: string): Promise<number> {
    const headerTexts = await this.getHeaderTexts();
    const index = headerTexts.findIndex(
      (h) => h.toLowerCase() === headerName.toLowerCase(),
    );
    if (index === -1) throw new Error(`Column "${headerName}" not found in headers: ${headerTexts}`);
    return index;
  }

  async getCellValue(
    rowName: string,
    columnName: string,
  ): Promise<string> {
    return step(
      `Get cell value: row="${rowName}", column="${columnName}"`,
      async () => {
        const colIndex = await this.getColumnIndex(columnName);
        const rowCount = await this.rows.count();

        for (let i = 0; i < rowCount; i++) {
          const cells = this.rows.nth(i).locator('td, [role="cell"], span');
          const cellTexts = await cells.allTextContents();
          const trimmed = cellTexts.map((c) => c.trim());

          if (trimmed.some((c) => c.toLowerCase().includes(rowName.toLowerCase()))) {
            return trimmed[colIndex] ?? '';
          }
        }
        throw new Error(`Row "${rowName}" not found`);
      },
    );
  }

  async getChromeCPU(): Promise<string> {
    return this.getCellValue('Chrome', 'CPU');
  }

  async getComparisonText(): Promise<string> {
    if (await this.comparisonLabel.isVisible()) {
      return (await this.comparisonLabel.textContent())?.trim() ?? '';
    }
    return '';
  }

  async getAllRowData(): Promise<Record<string, string>[]> {
    const headerTexts = await this.getHeaderTexts();
    const rowCount = await this.rows.count();
    const data: Record<string, string>[] = [];

    for (let i = 0; i < rowCount; i++) {
      const cells = this.rows.nth(i).locator('td, [role="cell"], span');
      const cellTexts = await cells.allTextContents();
      const row: Record<string, string> = {};
      headerTexts.forEach((header, idx) => {
        row[header] = cellTexts[idx]?.trim() ?? '';
      });
      data.push(row);
    }
    return data;
  }
}