import { Page } from '@playwright/test';

// practice.expandtesting.com serves live third-party ads (Google AdSense
// in-article + sidebar slots) that load asynchronously and shift page
// height unpredictably between runs — a real source of visual regression
// flakiness that has nothing to do with the page under test. Blocking the
// ad network domains removes that non-determinism at its source, rather
// than papering over it with a looser pixel tolerance.
const AD_DOMAINS = [
  '**/*doubleclick.net/**',
  '**/*googlesyndication.com/**',
  '**/*adsbygoogle.js*',
  '**/*google-analytics.com/**',
  '**/*googletagmanager.com/**',
];

export async function blockAdNetworks(page: Page): Promise<void> {
  for (const pattern of AD_DOMAINS) {
    await page.route(pattern, (route) => route.abort());
  }
}
