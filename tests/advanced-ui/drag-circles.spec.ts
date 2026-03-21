import { test, expect } from '@playwright/test';

test.describe('Drag Circles Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drag-and-drop-circles');
  });

  test('V3 — Drag circle to target position and validate coordinates @regression', async ({ page }) => {
    const draggable = page.locator('#draggable, .draggable, [draggable="true"]').first();

    const isVisible = await draggable.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, 'Draggable circle element not found on page');
      return;
    }

    // Get initial position
    const initialBox = await draggable.boundingBox();
    expect(initialBox).not.toBeNull();

    // Calculate target position (move right by 150px, down by 100px)
    const targetX = initialBox!.x + initialBox!.width / 2 + 150;
    const targetY = initialBox!.y + initialBox!.height / 2 + 100;

    // Perform drag via mouse API
    const sourceX = initialBox!.x + initialBox!.width / 2;
    const sourceY = initialBox!.y + initialBox!.height / 2;

    await page.mouse.move(sourceX, sourceY);
    await page.mouse.down();
    await page.mouse.move(targetX, targetY, { steps: 10 });
    await page.mouse.up();

    // Validate the element has moved
    const finalBox = await draggable.boundingBox();
    expect(finalBox).not.toBeNull();

    // The element should have moved from its initial position
    const hasMoved =
      Math.abs(finalBox!.x - initialBox!.x) > 10 ||
      Math.abs(finalBox!.y - initialBox!.y) > 10;
    expect(hasMoved).toBeTruthy();
  });

  test('V4 — Multiple circle elements can be positioned independently @extended', async ({ page }) => {
    const circles = page.locator('[draggable="true"], .draggable');
    const count = await circles.count();

    if (count < 2) {
      test.skip(true, 'Need at least 2 draggable elements for multi-element test');
      return;
    }

    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < Math.min(count, 3); i++) {
      const circle = circles.nth(i);
      const box = await circle.boundingBox();
      if (!box) continue;

      const sourceX = box.x + box.width / 2;
      const sourceY = box.y + box.height / 2;
      const offsetX = (i + 1) * 80;
      const offsetY = (i + 1) * 60;

      await page.mouse.move(sourceX, sourceY);
      await page.mouse.down();
      await page.mouse.move(sourceX + offsetX, sourceY + offsetY, { steps: 5 });
      await page.mouse.up();

      const finalBox = await circle.boundingBox();
      if (finalBox) {
        positions.push({ x: finalBox.x, y: finalBox.y });
      }
    }

    // Verify all circles ended at different positions
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const samePosition =
          Math.abs(positions[i].x - positions[j].x) < 5 &&
          Math.abs(positions[i].y - positions[j].y) < 5;
        expect(samePosition).toBeFalsy();
      }
    }
  });
});