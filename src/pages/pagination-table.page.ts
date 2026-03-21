import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class PaginationTablePage extends BasePage {
  protected readonly path = '/tables';

  readonly table: Locator;
  readonly headers: Locator;
  readonly rows: Locator;
  readonly pageSizeSelector: Locator;
  readonly searchInput: Locator;
  readonly paginationButtons: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('table').first();
    this.headers = page.locator('table thead th').first().locator('..').locator('th');
    this.rows = page.locator('table tbody tr');
    this.pageSizeSelector = page.locator(
      'select[name*="length"], select.form-select, .dataTables_length select',
    ).first();
    this.searchInput = page.locator(
      'input[type="search"], input[aria-controls], .dataTables_filter input',
    ).first();
    this.paginationButtons = page.locator('.pagination a, .paginate_button');
    this.nextButton = page.locator(
      'a:has-text("Next"), .paginate_button.next, button:has-text("Next")',
    ).first();
    this.prevButton = page.locator(
      'a:has-text("Previous"), .paginate_button.previous, button:has-text("Previous")',
    ).first();
  }

  async changePageSize(size: number): Promise<void> {
    await step(`Change page size to ${size}`, async () => {
      await this.pageSizeSelector.selectOption(String(size));
      await this.page.waitForTimeout(500);
    });
  }

  async getVisibleRowCount(): Promise<number> {
    return this.rows.count();
  }

  async sortByColumn(headerText: string): Promise<void> {
    await step(`Sort by column: ${headerText}`, async () => {
      const header = this.page.locator(`th:has-text("${headerText}")`).first();
      await header.click();
      await this.page.waitForTimeout(500);
    });
  }

  async getColumnValues(columnIndex: number): Promise<string[]> {
    const rowCount = await this.rows.count();
    const values: string[] = [];
    for (let i = 0; i < rowCount; i++) {
      const cell = this.rows.nth(i).locator('td').nth(columnIndex);
      values.push((await cell.textContent())?.trim() ?? '');
    }
    return values;
  }

  async filterByText(text: string): Promise<void> {
    await step(`Filter table by: ${text}`, async () => {
      await this.searchInput.fill(text);
      await this.page.waitForTimeout(500);
    });
  }

  async clearFilter(): Promise<void> {
    await step('Clear filter', async () => {
      await this.searchInput.clear();
      await this.page.waitForTimeout(500);
    });
  }

  async goToNextPage(): Promise<void> {
    await step('Go to next page', async () => {
      await this.nextButton.click();
      await this.page.waitForTimeout(500);
    });
  }

  async goToPrevPage(): Promise<void> {
    await step('Go to previous page', async () => {
      await this.prevButton.click();
      await this.page.waitForTimeout(500);
    });
  }
}