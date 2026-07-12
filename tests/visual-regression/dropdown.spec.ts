import { test, expect } from '@playwright/test';
import { blockAdNetworks } from './block-ads';

// The dynamic-table page was deliberately excluded from this suite: its
// data values *and* column order are intentionally randomized on every
// load (that's the page's actual teaching purpose — see
// tests/dynamic-dom/dynamic-table.spec.ts) which makes it structurally
// unsuitable for pixel comparison. Visual regression belongs on genuinely
// static, style-sensitive surfaces instead — see ui-components.spec.ts
// for why `#core` is the scoped locator used here.
test.describe('Dropdown — Visual Regression @visual @regression', () => {
  test('V1 — Dropdown panel matches baseline', async ({ page }) => {
    await blockAdNetworks(page);
    await page.goto('/dropdown');
    await expect(page.locator('#core')).toHaveScreenshot('dropdown-panel.png', {
      maxDiffPixelRatio: 0.002,
    });
  });
});
