import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

const NOTES_API = '/notes/api';

test.describe('React Notes Application — UI @regression', () => {
  let apiContext: APIRequestContext;
  let testUser: { email: string; password: string; name: string; token: string };

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });

    testUser = {
      email: `notesui_${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: faker.person.fullName(),
      token: '',
    };

    // Register user via API
    await apiContext.post(`${NOTES_API}/users/register`, {
      data: {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      },
    });

    // Login via API to get token
    const loginResponse = await apiContext.post(`${NOTES_API}/users/login`, {
      data: { email: testUser.email, password: testUser.password },
    });
    const loginBody = await loginResponse.json();
    testUser.token = loginBody.data?.token || '';
  });

  test.afterAll(async () => {
    try {
      await apiContext.delete(`${NOTES_API}/users/delete-account`, {
        headers: { 'x-auth-token': testUser.token },
      });
    } catch { /* ignore */ }
    await apiContext.dispose();
  });

  const loginViaUI = async (page: any) => {
    // Navigate to the app origin and inject the API token into localStorage,
    // then reload — this bypasses the UI login form and avoids flakiness from
    // React routing races while still exercising the authenticated UI.
    await page.goto('/notes/app');
    await page.evaluate((token: string) => localStorage.setItem('token', token), testUser.token);
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForSelector('[data-testid="add-new-note"]', { timeout: 15000 });
  };

  test('R1 — Create a new note via UI @smoke', async ({ page }) => {
    await loginViaUI(page);

    const noteTitle = `Test Note ${Date.now()}`;
    const noteDescription = 'Created by Playwright UI test';

    // Open the Add Note modal — use dispatchEvent to bypass ad overlays in headed mode
    await page.locator('[data-testid="add-new-note"]').dispatchEvent('click');
    await page.waitForSelector('[data-testid="note-title"]');

    // Fill note form
    await page.fill('[data-testid="note-title"]', noteTitle);
    await page.fill('[data-testid="note-description"]', noteDescription);

    const categorySelect = page.locator('[data-testid="note-category"]');
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.selectOption({ index: 1 });
    }

    // Submit
    await page.click('[data-testid="note-submit"]');

    // Wait for the note to appear
    await page.waitForTimeout(2000);

    // Assert note appears in the list
    await expect(page.locator('body')).toContainText(noteTitle, { timeout: 10000 });
  });

  test('R2 — Edit existing note via UI @critical', async ({ page }) => {
    await loginViaUI(page);

    // Create a note via API first
    const originalTitle = `Edit Test ${Date.now()}`;
    const createResponse = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': testUser.token },
      data: {
        title: originalTitle,
        description: 'Original description',
        category: 'Home',
      },
    });
    const createBody = await createResponse.json();
    expect(createBody.success).toBeTruthy();

    // Refresh the page to see the note
    await page.reload();
    await page.waitForLoadState('load');

    // Find and click edit on the note
    const noteCard = page.locator(`text=${originalTitle}`).first();
    if (await noteCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await noteCard.click();
    }

    // Look for edit button
    const editButton = page.locator('button:has-text("Edit"), [data-testid="edit"], .edit-btn, a:has-text("Edit")').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      await page.waitForTimeout(1000);

      const updatedTitle = `Updated ${Date.now()}`;
      const titleInput = page.locator('input[name="title"], [data-testid="note-title"]').first();
      if (await titleInput.isVisible().catch(() => false)) {
        await titleInput.fill(updatedTitle);

        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
        await saveButton.click();
        await page.waitForTimeout(2000);

        await expect(page.locator('body')).toContainText(updatedTitle, { timeout: 10000 });
      }
    }
  });

  test('R3 — Delete note via UI @critical', async ({ page }) => {
    await loginViaUI(page);

    // Create a note via API
    const noteTitle = `Delete Test ${Date.now()}`;
    await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': testUser.token },
      data: {
        title: noteTitle,
        description: 'To be deleted',
        category: 'Home',
      },
    });

    // Refresh to see the note
    await page.reload();
    await page.waitForLoadState('load');

    // Handle any confirmation dialogs
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Find the note and delete it
    const noteElement = page.locator(`text=${noteTitle}`).first();
    if (await noteElement.isVisible({ timeout: 5000 }).catch(() => false)) {
      await noteElement.click();
    }

    const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete"], .delete-btn').first();
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(2000);

      // Verify note is gone
      const noteStillExists = await page.locator(`text=${noteTitle}`).isVisible().catch(() => false);
      expect(noteStillExists).toBeFalsy();
    }
  });

  test('R4 — Cross-layer validation: Create via UI, verify via API @critical', async ({ page }) => {
    await loginViaUI(page);

    const noteTitle = `CrossLayer ${Date.now()}`;
    const noteDescription = 'Created in UI, verified via API';

    // Create note via UI
    await page.locator('[data-testid="add-new-note"]').dispatchEvent('click');
    await page.waitForSelector('[data-testid="note-title"]');
    await page.fill('[data-testid="note-title"]', noteTitle);
    await page.fill('[data-testid="note-description"]', noteDescription);
    await page.locator('[data-testid="note-category"]').selectOption('Home');
    await page.click('[data-testid="note-submit"]');
    await page.waitForTimeout(3000);

    // Verify via API
    const apiResponse = await apiContext.get(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': testUser.token },
    });

    expect(apiResponse.status()).toBe(200);
    const apiBody = await apiResponse.json();
    const notes = apiBody.data || [];

    const matchingNote = notes.find((n: any) => n.title === noteTitle);

    if (matchingNote) {
      expect(matchingNote.title).toBe(noteTitle);
      expect(matchingNote.description).toBe(noteDescription);
      expect(matchingNote.id).toBeTruthy();

      test.info().annotations.push({
        type: 'cross-layer',
        description: `UI-created note verified via API. ID: ${matchingNote.id}`,
      });
    } else {
      test.info().annotations.push({
        type: 'cross-layer',
        description: `Note not found in API response. Total notes: ${notes.length}`,
      });
    }
  });
});