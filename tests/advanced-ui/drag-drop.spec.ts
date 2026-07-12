import { test, expect, type Page } from '@playwright/test';

// WebKit does not support synthesized drag events via mouse API for HTML5 DnD.
// Dispatching DragEvents directly via evaluate works reliably across all browsers.
//
// Resolving drag source/target via `elementFromPoint(x, y)` off a bounding box
// captured in a prior round-trip is a race: if the page reflows between the
// boundingBox() call and the evaluate() call (e.g. a lazily-loaded ad above
// the columns shifting the layout down), the coordinates go stale and the
// synthetic events land on the wrong element or nothing at all — this is
// what made the test intermittently fail under CI load. Looking elements up
// by selector inside a single evaluate() call sidesteps coordinates and
// layout entirely.
async function htmlDragTo(page: Page, sourceSelector: string, targetSelector: string) {
  await page.evaluate(
    ([srcSel, tgtSel]) => {
      const src = document.querySelector(srcSel) as HTMLElement | null;
      const tgt = document.querySelector(tgtSel) as HTMLElement | null;
      const dt = new DataTransfer();
      src?.dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true }));
      tgt?.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));
      src?.dispatchEvent(new DragEvent('dragend', { dataTransfer: dt, bubbles: true }));
    },
    [sourceSelector, targetSelector]
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

    await htmlDragTo(page, '#column-a', '#column-b');

    const finalAText = await columnA.locator('header').textContent();
    const finalBText = await columnB.locator('header').textContent();

    expect(finalAText).toBe(initialBText);
    expect(finalBText).toBe(initialAText);
  });

  test('V2 — Post-drop state validation @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const initialAText = await columnA.locator('header').textContent();

    await htmlDragTo(page, '#column-a', '#column-b');

    await expect(columnB.locator('header')).toHaveText(initialAText!);
    await expect(columnA).toBeVisible();
    await expect(columnB).toBeVisible();
  });

  test('V1 — Double drag returns to original state @regression @flaky', async ({ page }) => {
    const columnA = page.locator('#column-a');
    const columnB = page.locator('#column-b');

    const originalA = await columnA.locator('header').textContent();
    const originalB = await columnB.locator('header').textContent();

    await htmlDragTo(page, '#column-a', '#column-b');
    await htmlDragTo(page, '#column-a', '#column-b');

    const finalA = await columnA.locator('header').textContent();
    const finalB = await columnB.locator('header').textContent();

    expect(finalA).toBe(originalA);
    expect(finalB).toBe(originalB);
  });
});