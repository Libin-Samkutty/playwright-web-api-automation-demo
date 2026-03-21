import { test, expect } from '@playwright/test';

test.describe('Dynamic Table Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic-table');
  });

  test('D1 — Extract Chrome CPU value without static locators @critical', async ({ page }) => {
    // Get the comparison value from the page's label/note
    const noteText = await page.locator('.bg-warning, [class*="warning"]').textContent();

    // Get all table headers to find CPU column index dynamically
    const headers = page.locator('table th, [role="columnheader"], th, .table thead span');
    const headerTexts: string[] = [];
    const headerCount = await headers.count();

    for (let i = 0; i < headerCount; i++) {
      const text = await headers.nth(i).textContent();
      headerTexts.push(text?.trim() || '');
    }

    let cpuColumnIndex = headerTexts.findIndex(
      (h) => h.toLowerCase().includes('cpu')
    );

    // If standard table headers don't work, try role-based table
    if (cpuColumnIndex === -1) {
      const roleHeaders = page.locator('[role="columnheader"]');
      const roleHeaderCount = await roleHeaders.count();
      const roleHeaderTexts: string[] = [];

      for (let i = 0; i < roleHeaderCount; i++) {
        const text = await roleHeaders.nth(i).textContent();
        roleHeaderTexts.push(text?.trim() || '');
      }

      cpuColumnIndex = roleHeaderTexts.findIndex(
        (h) => h.toLowerCase().includes('cpu')
      );
    }

    // Find the Chrome row
    const rows = page.locator('table tbody tr, [role="row"]');
    const rowCount = await rows.count();
    let chromeCpuValue = '';

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td, [role="cell"]');
      const cellCount = await cells.count();

      for (let j = 0; j < cellCount; j++) {
        const cellText = await cells.nth(j).textContent();
        if (cellText?.trim().toLowerCase() === 'chrome') {
          // Found Chrome row — get CPU value
          if (cpuColumnIndex >= 0 && cpuColumnIndex < cellCount) {
            chromeCpuValue = (await cells.nth(cpuColumnIndex).textContent())?.trim() || '';
          }
          break;
        }
      }

      if (chromeCpuValue) break;
    }

    // Validate the value is a numeric percentage
    expect(chromeCpuValue).toBeTruthy();
    expect(chromeCpuValue).toMatch(/[\d.]+%?/);

    // Cross-validate with the note on the page if available
    if (noteText) {
      expect(noteText).toContain(chromeCpuValue.replace('%', ''));
    }
  });

  test('D2 — Header-relative traversal is stable across reloads @regression', async ({ page }) => {
    const extractChromeCpu = async (): Promise<string> => {
      const rows = page.locator('[role="row"], table tbody tr');
      const headers = page.locator('[role="columnheader"], table thead th');

      // Find CPU column index
      const headerCount = await headers.count();
      let cpuIdx = -1;
      for (let i = 0; i < headerCount; i++) {
        const text = await headers.nth(i).textContent();
        if (text?.toLowerCase().includes('cpu')) {
          cpuIdx = i;
          break;
        }
      }

      // Find Chrome row
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const cells = rows.nth(i).locator('[role="cell"], td');
        const cellCount = await cells.count();
        for (let j = 0; j < cellCount; j++) {
          const text = await cells.nth(j).textContent();
          if (text?.trim().toLowerCase() === 'chrome' && cpuIdx >= 0) {
            return (await cells.nth(cpuIdx).textContent())?.trim() || '';
          }
        }
      }
      return '';
    };

    // Run extraction 3 times with page reloads
    const values: string[] = [];
    for (let run = 0; run < 3; run++) {
      const value = await extractChromeCpu();
      expect(value).toBeTruthy();
      expect(value).toMatch(/[\d.]+%?/);
      values.push(value);

      if (run < 2) {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      }
    }

    // All extractions should succeed (values may differ between loads)
    expect(values.every((v) => v.length > 0)).toBeTruthy();
  });
});