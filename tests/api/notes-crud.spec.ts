import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

const NOTES_API = '/notes/api';

interface NotePayload {
  title: string;
  description: string;
  category: string;
}

interface AuthTokens {
  token: string;
  email: string;
  password: string;
}

test.describe('Notes API — Core CRUD @regression', () => {
  let apiContext: APIRequestContext;
  let auth: AuthTokens;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });

    // Register a unique user for this test suite
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'TestPass123!';
    const name = faker.person.fullName();

    await apiContext.post(`${NOTES_API}/users/register`, {
      data: { name, email, password },
    });

    // Login to get token
    const loginResponse = await apiContext.post(`${NOTES_API}/users/login`, {
      data: { email, password },
    });

    const loginBody = await loginResponse.json();
    auth = {
      token: loginBody.data?.token || '',
      email,
      password,
    };
  });

  test.afterAll(async () => {
    // Cleanup: delete the test user account
    try {
      await apiContext.delete(`${NOTES_API}/users/delete-account`, {
        headers: { 'x-auth-token': auth.token },
      });
    } catch {
      // Ignore cleanup errors
    }
    await apiContext.dispose();
  });

  test('P1 — Create note with valid payload @smoke', async () => {
    const noteData: NotePayload = {
      title: faker.lorem.sentence(3),
      description: faker.lorem.paragraph(),
      category: 'Home',
    };

    const response = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': auth.token },
      data: noteData,
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(body.data).toBeDefined();
    expect(body.data.title).toBe(noteData.title);
    expect(body.data.description).toBe(noteData.description);
    expect(body.data.category).toBe(noteData.category);
    expect(body.data.id).toBeTruthy();
    expect(body.data.created_at).toBeTruthy();
  });

  test('P2 — Get note by ID @critical', async () => {
    // Create a note first
    const noteData: NotePayload = {
      title: `Get Test - ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      category: 'Work',
    };

    const createResponse = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': auth.token },
      data: noteData,
    });
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    // Fetch the note
    const getResponse = await apiContext.get(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': auth.token },
    });

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();
    expect(getBody.data.id).toBe(noteId);
    expect(getBody.data.title).toBe(noteData.title);
    expect(getBody.data.description).toBe(noteData.description);
    expect(getBody.data.category).toBe(noteData.category);
  });

  test('P3 — Update note (full update) @critical', async () => {
    // Create a note
    const createResponse = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': auth.token },
      data: {
        title: 'Original Title',
        description: 'Original Description',
        category: 'Home',
      },
    });
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    // Update the note
    const updatedData = {
      title: 'Updated Title',
      description: 'Updated Description',
      category: 'Work',
      completed: true,
    };

    const updateResponse = await apiContext.put(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': auth.token },
      data: updatedData,
    });

    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    expect(updateBody.data.title).toBe(updatedData.title);
    expect(updateBody.data.description).toBe(updatedData.description);

    // Verify via GET
    const getResponse = await apiContext.get(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': auth.token },
    });
    const getBody = await getResponse.json();
    expect(getBody.data.title).toBe(updatedData.title);
    expect(getBody.data.description).toBe(updatedData.description);
  });

  test('P4 — Delete note and verify 404 @critical', async () => {
    // Create a note
    const createResponse = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': auth.token },
      data: {
        title: 'To Be Deleted',
        description: 'This note will be deleted',
        category: 'Personal',
      },
    });
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    // Delete the note
    const deleteResponse = await apiContext.delete(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': auth.token },
    });
    expect(deleteResponse.status()).toBe(200);

    // Attempt to GET the deleted note — expect 404
    const getResponse = await apiContext.get(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': auth.token },
    });
    expect(getResponse.status()).toBe(404);
  });

  test('P1 — Get all notes returns array @critical', async () => {
    const response = await apiContext.get(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': auth.token },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBeTruthy();
    expect(Array.isArray(body.data)).toBeTruthy();
  });
});