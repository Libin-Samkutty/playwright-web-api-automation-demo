import { defineConfig, devices } from '@playwright/test';
import { ENV } from './src/config/env.config';

export default defineConfig({
  testDir: './tests',
  // Centralize visual regression baselines under screenshots/ instead of
  // Playwright's default co-located `<spec>-snapshots/` folders per test
  // file — keeps every baseline reviewable in one place.
  snapshotDir: './screenshots',
  snapshotPathTemplate: '{snapshotDir}/{testFileName}/{arg}{-projectName}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : 2,
  timeout: ENV.TIMEOUT,
  expect: {
    timeout: 10_000,
    // Visual regression default tolerance — tight enough to catch real
    // layout changes, wide enough to absorb antialiasing differences
    // across CI environments. See docs/MIGRATION.md.
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'allure-playwright',
      {
        detail: true,
        suiteTitle: true,
        outputFolder: 'allure-results',
        environmentInfo: {
          BASE_URL: ENV.BASE_URL,
          NODE_VERSION: process.version,
        },
      },
    ],
  ],

  use: {
    baseURL: ENV.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});