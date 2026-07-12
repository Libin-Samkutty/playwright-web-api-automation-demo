import { test, expect } from '@playwright/test';
import { blockAdNetworks } from './block-ads';

// `#core` is the page-template's content wrapper, verified to exclude the
// site's ad slots (`.ad-bar`, in-article/sidebar `adsbygoogle` iframes) that
// otherwise make a full-page or `main`-scoped screenshot non-deterministic
// between loads. See dynamic-table.spec.ts's replacement (dropdown.spec.ts)
// for the CI-only-baseline rule this suite follows.
test.describe('UI Components — Visual Regression @visual @regression', () => {
  test('V2 — Checkboxes panel matches baseline', async ({ page }) => {
    await blockAdNetworks(page);
    await page.goto('/checkboxes');
    await expect(page.locator('#core')).toHaveScreenshot('checkboxes-panel.png', {
      maxDiffPixelRatio: 0.002,
    });
  });

  test('V3 — New-window panel matches baseline', async ({ page }) => {
    await blockAdNetworks(page);
    await page.goto('/windows');
    await expect(page.locator('#core')).toHaveScreenshot('windows-panel.png', {
      maxDiffPixelRatio: 0.002,
    });
  });
});
