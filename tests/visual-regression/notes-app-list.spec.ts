import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { blockAdNetworks } from './block-ads';

const NOTES_API = '/notes/api';

// See ui-components.spec.ts for why `#core` is the scoped locator pattern
// used elsewhere in this suite. The notes list itself is identified by
// `[data-testid="notes-list"]` — this is the highest-operational-risk
// surface in the demo: a silently broken CSS binding (e.g. a category
// badge losing its color) would pass every functional assertion while
// still being visibly wrong. The card's "updated at" timestamp is masked
// since it's inherently different on every run.
test.describe('Notes App List — Visual Regression @visual @regression', () => {
  let apiContext: APIRequestContext;
  let testUser: { email: string; password: string; name: string; token: string };

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });

    testUser = {
      email: `visualreg_${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: faker.person.fullName(),
      token: '',
    };

    await apiContext.post(`${NOTES_API}/users/register`, {
      data: { name: testUser.name, email: testUser.email, password: testUser.password },
    });

    const loginResponse = await apiContext.post(`${NOTES_API}/users/login`, {
      data: { email: testUser.email, password: testUser.password },
    });
    const loginBody = await loginResponse.json();
    testUser.token = loginBody.data?.token || '';

    // Seed one note via API so the list has stable, known content to
    // snapshot — a visual baseline against an empty or randomly-ordered
    // list would be meaningless.
    await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': testUser.token },
      data: {
        title: 'Visual Regression Baseline Note',
        description: 'Seeded for the notes-list screenshot baseline.',
        category: 'Home',
      },
    });
  });

  test.afterAll(async () => {
    try {
      await apiContext.delete(`${NOTES_API}/users/delete-account`, {
        headers: { 'x-auth-token': testUser.token },
      });
    } catch { /* ignore */ }
    await apiContext.dispose();
  });

  test('V5 — Note list renders consistently', async ({ page }) => {
    await blockAdNetworks(page);
    await page.goto('/notes/app');
    await page.evaluate((token: string) => localStorage.setItem('token', token), testUser.token);
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForSelector('[data-testid="add-new-note"]', { timeout: 15000 });

    // Wait for exactly the seeded note (not just "a card exists") and let
    // any card-mount transition settle before capturing — the first
    // attempt at this test caught the list mid-render and locked in a
    // baseline that didn't match its own next run.
    await expect(page.locator('[data-testid="note-card"]')).toHaveCount(1, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const notesList = page.locator('[data-testid="notes-list"]');
    await expect(notesList).toHaveScreenshot('notes-app-list.png', {
      maxDiffPixelRatio: 0.002,
      mask: [page.locator('[data-testid="note-card-updated-at"]')],
    });
  });
});
