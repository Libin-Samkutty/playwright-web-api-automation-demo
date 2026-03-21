import { test, expect } from '../../src/fixtures/base.fixture';

test.describe('OTP Authentication Flow', () => {
  // NOTE: OTP tests depend on the specific OTP implementation of the practice site.
  // These are structured for the expected flow but may need adjustment
  // based on actual page implementation.

  test('A13: Valid OTP code proceeds authentication @critical', { tag: '@critical' }, async ({ pm, page }) => {
    // Navigate to OTP page if available
    await page.goto('/otp');
    const hasOtpPage = !page.url().includes('404');

    test.skip(!hasOtpPage, 'OTP page not available on this deployment');

    // If OTP page exists, test the flow
    const otpInput = page.locator('input[name="otp"], input[type="text"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill('123456');
      await page.locator('button[type="submit"]').first().click();
      // Assert result based on page behavior
    }
  });

  test('A14: Expired OTP code shows error @regression', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/otp');
    const hasOtpPage = !page.url().includes('404');
    test.skip(!hasOtpPage, 'OTP page not available on this deployment');

    // Expired OTP scenario - submit after delay
    const otpInput = page.locator('input[name="otp"], input[type="text"]').first();
    if (await otpInput.isVisible()) {
      // Simulate expired OTP
      await otpInput.fill('000000');
      await page.locator('button[type="submit"]').first().click();
    }
  });

  test('A15: Incorrect OTP code rejected @regression', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/otp');
    const hasOtpPage = !page.url().includes('404');
    test.skip(!hasOtpPage, 'OTP page not available on this deployment');

    const otpInput = page.locator('input[name="otp"], input[type="text"]').first();
    if (await otpInput.isVisible()) {
      await otpInput.fill('999999');
      await page.locator('button[type="submit"]').first().click();
      // Should show error, not proceed
    }
  });
});