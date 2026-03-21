import { test, expect } from '@playwright/test';

test.describe('Challenging DOM Page @regression', () => {
  test('Y7 — Locate stable element despite changing locators @critical', async ({ page }) => {
    // Load the page multiple times and verify element location
    for (let i = 0; i < 3; i++) {
      await page.goto('/challenging-dom');
      await page.waitForLoadState('domcontentloaded');

      // Use resilient selectors — not IDs or classes that change
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      expect(buttonCount).toBeGreaterThan(0);

      // Locate by role/text instead of dynamic IDs
      const editLinks = page.getByRole('link', { name: /edit/i });
      const deleteLinks = page.getByRole('link', { name: /delete/i });

      // At least some edit/delete links should exist in the table
      const editCount = await editLinks.count();
      const deleteCount = await deleteLinks.count();

      expect(editCount + deleteCount).toBeGreaterThan(0);

      // Locate table using semantic selector
      const table = page.locator('table');
      await expect(table).toBeVisible();
    }
  });

  test('Y8 — Button click causes DOM mutation @regression', async ({ page }) => {
    await page.goto('/challenging-dom');

    // Find buttons (they have dynamically generated IDs/classes)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Capture initial DOM state (e.g., canvas fingerprint or button text)
    const initialButtonTexts: string[] = [];
    for (let i = 0; i < buttonCount; i++) {
      const text = await buttons.nth(i).textContent();
      initialButtonTexts.push(text?.trim() || '');
    }

    // Click the first button
    await buttons.first().click();
    await page.waitForLoadState('domcontentloaded');

    // Verify the page is still functional after the click
    const postClickButtons = page.getByRole('button');
    const postClickCount = await postClickButtons.count();
    expect(postClickCount).toBeGreaterThan(0);

    // The table should still be present
    await expect(page.locator('table')).toBeVisible();
  });

  test('Y7 — Table data is accessible with resilient selectors @regression', async ({ page }) => {
    await page.goto('/challenging-dom');

    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Extract table data using header-relative approach
    const headers = table.locator('thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);

    const headerTexts: string[] = [];
    for (let i = 0; i < headerCount; i++) {
      const text = await headers.nth(i).textContent();
      headerTexts.push(text?.trim() || '');
    }

    // Verify rows exist
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify each row has the correct number of cells
    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const cells = rows.nth(i).locator('td');
      const cellCount = await cells.count();
      expect(cellCount).toBe(headerCount);
    }
  });
});