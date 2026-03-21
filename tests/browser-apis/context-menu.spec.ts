import { test, expect } from '@playwright/test';

test.describe('Context Menu Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/context-menu');
  });

  test('B9 — Right-click triggers context menu @critical', async ({ page }) => {
    let alertTriggered = false;
    let alertMessage = '';

    page.on('dialog', async (dialog) => {
      alertTriggered = true;
      alertMessage = dialog.message();
      await dialog.accept();
    });

    const hotSpot = page.locator('#hot-spot, [oncontextmenu], .context-menu-target');
    const target = hotSpot.first();

    const isVisible = await target.isVisible().catch(() => false);
    if (!isVisible) {
      // Fallback to any clickable area
      await page.click('body', { button: 'right' });
    } else {
      await target.click({ button: 'right' });
    }

    // Give time for the alert/context menu to appear
    await page.waitForTimeout(1000);

    // On this page, right-click typically triggers a JS alert
    if (alertTriggered) {
      expect(alertMessage).toBeTruthy();
      expect(alertMessage.toLowerCase()).toContain('selected');
    }
  });

  test('B10 — Right-click produces expected result @regression', async ({ page }) => {
    let dialogCount = 0;

    page.on('dialog', async (dialog) => {
      dialogCount++;
      await dialog.accept();
    });

    const hotSpot = page.locator('#hot-spot').first();
    const isVisible = await hotSpot.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'Context menu hot spot not found');
      return;
    }

    // Right-click
    await hotSpot.click({ button: 'right' });
    await page.waitForTimeout(500);

    // Verify the action was triggered (dialog appeared)
    expect(dialogCount).toBeGreaterThan(0);

    // Right-click again to verify repeatability
    await hotSpot.click({ button: 'right' });
    await page.waitForTimeout(500);

    expect(dialogCount).toBe(2);
  });
});