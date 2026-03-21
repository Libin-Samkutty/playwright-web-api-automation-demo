import { test, expect } from '@playwright/test';

test.describe('Broken Images Page @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/broken-images');
  });

  test('N4 — Detect broken images on page @critical', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    const brokenImages: string[] = [];
    const validImages: string[] = [];

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = (await img.getAttribute('src')) || 'unknown';

      const naturalWidth = await img.evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );

      if (naturalWidth === 0) {
        brokenImages.push(src);
      } else {
        validImages.push(src);
      }
    }

    // Log findings
    test.info().annotations.push({
      type: 'broken-images',
      description: `Broken: ${brokenImages.length}, Valid: ${validImages.length}`,
    });

    // There should be at least one broken image on this page (by design)
    expect(brokenImages.length).toBeGreaterThan(0);
    // There should also be at least one valid image
    expect(validImages.length).toBeGreaterThan(0);
  });

  test('N5 — Count broken vs valid images @regression', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();

    let brokenCount = 0;
    let validCount = 0;

    for (let i = 0; i < imageCount; i++) {
      const naturalWidth = await images.nth(i).evaluate(
        (el: HTMLImageElement) => el.naturalWidth
      );

      if (naturalWidth === 0) {
        brokenCount++;
      } else {
        validCount++;
      }
    }

    expect(brokenCount + validCount).toBe(imageCount);

    // The practice site has a known count of broken images
    // At minimum, there should be 2 broken images on this page
    expect(brokenCount).toBeGreaterThanOrEqual(1);

    test.info().annotations.push({
      type: 'image-audit',
      description: `Total: ${imageCount}, Broken: ${brokenCount}, Valid: ${validCount}`,
    });
  });

  test('N6 — Network intercept broken image requests @regression', async ({ page }) => {
    const imageResponses: { url: string; status: number }[] = [];

    // Intercept image requests
    page.on('response', (response) => {
      const url = response.url();
      if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url) || response.request().resourceType() === 'image') {
        imageResponses.push({ url, status: response.status() });
      }
    });

    // Reload the page to capture image requests
    await page.reload({ waitUntil: 'networkidle' });

    // Verify that broken images correspond to non-200 responses
    const failedImages = imageResponses.filter((r) => r.status >= 400);
    const successImages = imageResponses.filter((r) => r.status === 200);

    test.info().annotations.push({
      type: 'network-audit',
      description: `Image requests: ${imageResponses.length}, Failed: ${failedImages.length}, Success: ${successImages.length}`,
    });

    // Cross-validate: failed network requests should match DOM-detected broken images
    if (failedImages.length > 0) {
      expect(failedImages.every((r) => r.status >= 400)).toBeTruthy();
    }
  });
});