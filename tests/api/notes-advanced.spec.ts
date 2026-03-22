import { test, expect, APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';

const NOTES_API = '/notes/api';

test.describe('Notes API — Advanced @regression', () => {
  let apiContext: APIRequestContext;
  let authToken: string;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });

    const email = `advanced_${Date.now()}@example.com`;
    const password = 'TestPass123!';

    await apiContext.post(`${NOTES_API}/users/register`, {
      data: { name: faker.person.fullName(), email, password },
    });

    const loginResponse = await apiContext.post(`${NOTES_API}/users/login`, {
      data: { email, password },
    });
    const loginBody = await loginResponse.json();
    authToken = loginBody.data?.token || '';
  });

  test.afterAll(async () => {
    try {
      await apiContext.delete(`${NOTES_API}/users/delete-account`, {
        headers: { 'x-auth-token': authToken },
      });
    } catch { /* ignore */ }
    await apiContext.dispose();
  });

  test('P5 — Invalid payload: missing required fields @critical', async () => {
    // Missing title
    const response = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': authToken },
      data: {
        description: 'Description without title',
        category: 'Home',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBeFalsy();
    expect(body.message).toBeTruthy();
  });

  test('P5 — Invalid payload: empty title @critical', async () => {
    const response = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': authToken },
      data: {
        title: '',
        description: 'Description',
        category: 'Home',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBeFalsy();
  });

  test('P5 — Invalid payload: invalid category @regression', async () => {
    const response = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': authToken },
      data: {
        title: 'Valid Title',
        description: 'Valid Description',
        category: 'InvalidCategory',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('P6 — Auth boundary: no token returns 401 @critical', async () => {
    const response = await apiContext.post(`${NOTES_API}/notes`, {
      data: {
        title: 'Unauthorized Note',
        description: 'Should fail',
        category: 'Home',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('P6 — Auth boundary: invalid token returns 401 @critical', async () => {
    const response = await apiContext.get(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': 'invalid-token-12345' },
    });

    expect(response.status()).toBe(401);
  });

  test('P6 — Auth boundary: expired token returns 401 @critical', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid';
    const response = await apiContext.get(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': expiredToken },
    });

    expect(response.status()).toBe(401);
  });

  test('P7 — Schema validation: response contract @regression', async () => {
    // Create a note to validate schema
    const createResponse = await apiContext.post(`${NOTES_API}/notes`, {
      headers: { 'x-auth-token': authToken },
      data: {
        title: 'Schema Test Note',
        description: 'For schema validation',
        category: 'Home',
      },
    });
    const createBody = await createResponse.json();
    const noteId = createBody.data.id;

    // Fetch and validate schema
    const getResponse = await apiContext.get(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': authToken },
    });

    const body = await getResponse.json();
    const note = body.data;

    // Validate required fields exist
    expect(note).toHaveProperty('id');
    expect(note).toHaveProperty('title');
    expect(note).toHaveProperty('description');
    expect(note).toHaveProperty('completed');
    expect(note).toHaveProperty('created_at');
    expect(note).toHaveProperty('updated_at');
    expect(note).toHaveProperty('category');

    // Validate data types
    expect(typeof note.id).toBe('string');
    expect(typeof note.title).toBe('string');
    expect(typeof note.description).toBe('string');
    expect(typeof note.completed).toBe('boolean');
    expect(typeof note.created_at).toBe('string');
    expect(typeof note.updated_at).toBe('string');
    expect(typeof note.category).toBe('string');

    // Validate no unexpected fields (allow user_id)
    const allowedFields = ['id', 'title', 'description', 'completed', 'created_at', 'updated_at', 'category', 'user_id'];
    const actualFields = Object.keys(note);
    for (const field of actualFields) {
      expect(allowedFields).toContain(field);
    }

    // Validate date format
    expect(new Date(note.created_at).getTime()).not.toBeNaN();
    expect(new Date(note.updated_at).getTime()).not.toBeNaN();

    // Cleanup
    await apiContext.delete(`${NOTES_API}/notes/${noteId}`, {
      headers: { 'x-auth-token': authToken },
    });
  });

  test('P8 — Response time baseline @regression', async () => {
    const responseTimes: number[] = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      const response = await apiContext.get(`${NOTES_API}/notes`, {
        headers: { 'x-auth-token': authToken },
      });
      const duration = Date.now() - start;
      responseTimes.push(duration);

      expect(response.status()).toBe(200);
    }

    // Assert no individual call exceeds 2000ms
    for (const time of responseTimes) {
      expect(time).toBeLessThan(2000);
    }

    // Calculate P95
    const sorted = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const p95 = sorted[p95Index];

    // 3000ms threshold — a shared demo API under parallel test load can be slower
    expect(p95).toBeLessThan(3000);

    // Log metrics for reporting
    test.info().annotations.push({
      type: 'performance',
      description: `P95: ${p95}ms, Avg: ${Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)}ms, Max: ${Math.max(...responseTimes)}ms`,
    });
  });
});