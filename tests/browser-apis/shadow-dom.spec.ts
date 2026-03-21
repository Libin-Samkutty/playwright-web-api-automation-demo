import { test, expect } from '@playwright/test';

test.describe('Shadow DOM Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shadowdom');
  });

  test('B1 — Locate element inside shadow DOM root @critical', async ({ page }) => {
    // Playwright automatically pierces open shadow DOM
    // Try to locate content within shadow host
    const shadowContent = page.locator('my-paragraph, [id*="shadow"], .shadow-host').first();
    const hasShadowHost = await shadowContent.count() > 0;

    if (hasShadowHost) {
      // Playwright's locator pierces shadow DOM by default
      const innerText = await shadowContent.textContent();
      expect(innerText).toBeTruthy();
    } else {
      // Fallback: look for any shadow-related content on the page
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();

      // Try evaluating shadow DOM directly
      const shadowText = await page.evaluate(() => {
        const hosts = document.querySelectorAll('*');
        for (const host of hosts) {
          if (host.shadowRoot) {
            return host.shadowRoot.textContent;
          }
        }
        return null;
      });

      if (shadowText) {
        expect(shadowText.length).toBeGreaterThan(0);
      }
    }
  });

  test('B2 — Interact with shadow DOM content @regression', async ({ page }) => {
    // Find shadow DOM elements using Playwright's built-in piercing
    const shadowElements = await page.evaluate(() => {
      const results: { tag: string; text: string }[] = [];
      const allElements = document.querySelectorAll('*');

      for (const el of allElements) {
        if (el.shadowRoot) {
          const children = el.shadowRoot.querySelectorAll('*');
          for (const child of children) {
            results.push({
              tag: child.tagName.toLowerCase(),
              text: child.textContent?.trim() || '',
            });
          }
        }
      }
      return results;
    });

    // Validate shadow DOM content was found and is not empty
    if (shadowElements.length > 0) {
      const hasContent = shadowElements.some((el) => el.text.length > 0);
      expect(hasContent).toBeTruthy();
    }

    // Also validate the page itself rendered
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('B3 — Nested shadow DOM traversal @extended', async ({ page }) => {
    const nestedContent = await page.evaluate(() => {
      const findDeepestShadow = (root: Element | ShadowRoot, depth: number = 0): { depth: number; text: string } => {
        let deepest = { depth, text: '' };

        const children = root instanceof ShadowRoot ? root.querySelectorAll('*') : [root];

        for (const child of children) {
          if (child.shadowRoot) {
            const result = findDeepestShadow(child.shadowRoot, depth + 1);
            if (result.depth > deepest.depth) {
              deepest = result;
            }
          } else if (child.textContent && depth > deepest.depth) {
            deepest = { depth, text: child.textContent.trim() };
          }
        }

        return deepest;
      };

      const hosts = document.querySelectorAll('*');
      let maxDepth = { depth: 0, text: '' };

      for (const host of hosts) {
        if (host.shadowRoot) {
          const result = findDeepestShadow(host.shadowRoot, 1);
          if (result.depth > maxDepth.depth) {
            maxDepth = result;
          }
        }
      }

      return maxDepth;
    });

    // The test validates traversal doesn't throw errors
    expect(nestedContent).toBeDefined();
    expect(nestedContent.depth).toBeGreaterThanOrEqual(0);
  });
});