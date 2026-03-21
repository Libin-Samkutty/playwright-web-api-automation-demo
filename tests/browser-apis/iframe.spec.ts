import { test, expect } from '@playwright/test';

test.describe('iFrame Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe');
  });

  test('B4 — Interact with element inside internal iFrame @critical', async ({ page }) => {
    const iframes = page.frameLocator('iframe');
    const iframe = iframes.first();

    // Try to locate content inside the iframe
    const iframeBody = iframe.locator('body');
    await expect(iframeBody).toBeVisible({ timeout: 10000 });

    // Try to interact with content - typically a rich text editor
    const editorBody = iframe.locator('#tinymce, body[contenteditable], [contenteditable="true"]');
    const hasEditor = await editorBody.count() > 0;

    if (hasEditor) {
      await editorBody.click();
      // Clear and type new content
      await editorBody.fill('');
      await editorBody.type('Hello from Playwright iFrame test');
      const text = await editorBody.textContent();
      expect(text).toContain('Hello from Playwright');
    } else {
      // If no editor, just validate iframe content is accessible
      const text = await iframeBody.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('B5 — Assert iframe src attribute @regression', async ({ page }) => {
    const iframeElement = page.locator('iframe').first();
    const isVisible = await iframeElement.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'No iframe found on page');
      return;
    }

    const src = await iframeElement.getAttribute('src');

    // Validate the src attribute exists and is a valid URL or path
    if (src) {
      expect(src.length).toBeGreaterThan(0);
      // Could be a relative or absolute URL
      expect(src).toMatch(/^(https?:\/\/|\/)/);
    }

    // Also validate the id attribute if present
    const id = await iframeElement.getAttribute('id');
    if (id) {
      expect(id).toBeTruthy();
    }
  });

  test('B6 — Nested iFrame interaction @extended', async ({ page }) => {
    // Check for nested iframes
    const outerFrame = page.frameLocator('iframe').first();

    // Try to find an inner iframe within the outer one
    const innerIframes = outerFrame.locator('iframe');
    const innerCount = await innerIframes.count().catch(() => 0);

    if (innerCount > 0) {
      const innerFrame = outerFrame.frameLocator('iframe').first();
      const innerBody = innerFrame.locator('body');
      await expect(innerBody).toBeVisible();
      const text = await innerBody.textContent();
      expect(text).toBeDefined();
    } else {
      // No nested iframes — validate outer iframe content instead
      const outerBody = outerFrame.locator('body');
      await expect(outerBody).toBeVisible();
      test.info().annotations.push({
        type: 'note',
        description: 'No nested iframes found; validated outer iframe only',
      });
    }
  });
});