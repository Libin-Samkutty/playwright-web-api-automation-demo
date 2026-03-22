import { test, expect, type Locator, type Page } from '@playwright/test';

// WebKit does not support synthesized drag events via mouse API for HTML5 DnD.
// Dispatching DragEvents directly via evaluate works reliably across all browsers.
async function htmlDragTo(page: Page, source: Locator, target: Locator) {
  const srcBB = await source.boundingBox();
  const tgtBB = await target.boundingBox();
  await page.evaluate(
    ([sx, sy, tx, ty]) => {
      const src = document.elementFromPoint(sx, sy) as HTMLElement;
      const tgt = document.elementFromPoint(tx, ty) as HTMLElement;
      const dt = new DataTransfer();
      src?.dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
      src?.dispatchEvent(new DragEvent('dragend', { dataTransfer: dt, bubbles: true }));
    },
    [
      srcBB!.x + srcBB!.width / 2,
      srcBB!.y + srcBB!.height / 2,
      tgtBB!.x + tgtBB!.width / 2,
      tgtBB!.y + tgtBB!.height / 2,
    ]
  );
}

test.describe('Drag and Drop Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag-and-drop');
  });

  test('V1 — Drag element A to drop zone B @critical @flaky', async ({ page }) => {
    test.info().annotations.push({ type: 'retries', description: '2' });

    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const initialAText = await columnA.locator('header').textContent();
    const initialBText = await columnB.locator('header').textContent();

    await htmlDragTo(page, columnA, columnB);

    const finalAText = await columnA.locator('header').textContent();
    const finalBText = await columnB.locator('header').textContent();

    expect(finalAText).toBe(initialBText);
    expect(finalBText).toBe(initialAText);
  });

  test('V2 — Post-drop state validation @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const initialAText = await columnA.locator('header').textContent();

    await htmlDragTo(page, columnA, columnB);

    await expect(columnB.locator('header')).toHaveText(initialAText!);
    await expect(columnA).toBeVisible();
    await expect(columnB).toBeVisible();
  });

  test('V1 — Double drag returns to original state @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const originalA = await columnA.locator('header').textContent();
    const originalB = await columnB.locator('header').textContent();

    await htmlDragTo(page, columnA, columnB);
    await htmlDragTo(page, columnA, columnB);

    const finalA = await columnA.locator('header').textContent();
    const finalB = await columnB.locator('header').textContent();

    expect(finalA).toBe(originalA);
    expect(finalB).toBe(originalB);
  });
});