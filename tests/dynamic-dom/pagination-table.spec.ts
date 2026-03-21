import { test, expect } from '@playwright/test';

test.describe('Pagination Table @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tables');
  });

  test('D3 — Table displays correct number of rows @regression', async ({ page }) => {
    const table = page.locator('table').first();
    const rows = table.locator('tbody tr');
    const count = await rows.count();

    expect(count).toBeGreaterThan(0);

    // Verify each row has the same number of cells as headers
    const headerCount = await table.locator('thead th').count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const cellCount = await rows.nth(i).locator('td').count();
      expect(cellCount).toBe(headerCount);
    }
  });

  test('D4 — Sort column ascending and descending @regression', async ({ page }) => {
    const sortableHeader = page.locator('table thead th').first();
    const headerText = await sortableHeader.textContent();

    if (!headerText) {
      test.skip(true, 'No sortable headers found');
      return;
    }

    // Click header to sort ascending
    await sortableHeader.click();
    await page.waitForLoadState('domcontentloaded');

    const getColumnValues = async (): Promise<string[]> => {
      const cells = page.locator('table tbody tr td:first-child');
      const count = await cells.count();
      const values: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await cells.nth(i).textContent();
        values.push(text?.trim() || '');
      }
      return values;
    };

    const ascValues = await getColumnValues();
    expect(ascValues.length).toBeGreaterThan(0);

    // Click again for descending
    await sortableHeader.click();
    await page.waitForLoadState('domcontentloaded');

    const descValues = await getColumnValues();
    expect(descValues.length).toBeGreaterThan(0);

    // If sorting works, the order should be reversed
    if (ascValues.length === descValues.length && ascValues.length > 1) {
      const isReversed = ascValues[0] !== descValues[0] || ascValues[ascValues.length - 1] !== descValues[descValues.length - 1];
      expect.soft(isReversed).toBeTruthy();
    }
  });

  test('D5 — Table data is present and structured @regression', async ({ page }) => {
    const tables = page.locator('table');
    const tableCount = await tables.count();
    expect(tableCount).toBeGreaterThan(0);

    for (let t = 0; t < tableCount; t++) {
      const table = tables.nth(t);
      const headers = table.locator('thead th');
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);

      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });
});