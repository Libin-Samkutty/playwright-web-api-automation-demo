import { test, expect, APIRequestContext } from '@playwright/test';

const API_BASE = '/api';

test.describe('Practice API @regression', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'https://practice.expandtesting.com',
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test('Q1 — GET /health: API availability check @smoke', async () => {
    const response = await apiContext.get(`${API_BASE}/health-check`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toBeDefined();
    // The health endpoint should confirm the API is operational
    expect(body.message || body.status).toBeTruthy();
  });

  test('Q1 — API root returns valid response @smoke', async () => {
    const response = await apiContext.get(`${API_BASE}/`);

    // Should return 200 or redirect
    expect([200, 301, 302]).toContain(response.status());
  });

  test('Q2 — Authenticated endpoint with valid token @critical', async () => {
    // Register and login to get a token
    const email = `practice_api_${Date.now()}@example.com`;
    const password = 'TestPass123!';

    await apiContext.post('/notes/api/users/register', {
      data: { name: 'Practice API Test', email, password },
    });

    const loginResponse = await apiContext.post('/notes/api/users/login', {
      data: { email, password },
    });

    const loginBody = await loginResponse.json();
    const token = loginBody.data?.token;

    if (!token) {
      test.skip(true, 'Could not obtain auth token');
      return;
    }

    // Call an authenticated endpoint
    const authedResponse = await apiContext.get('/notes/api/users/profile', {
      headers: { 'x-auth-token': token },
    });
    expect(authedResponse.status()).toBe(200);

    // Call without token — should fail
    const unauthedResponse = await apiContext.get('/notes/api/users/profile');
    expect(unauthedResponse.status()).toBe(401);

    // Cleanup
    await apiContext.delete('/notes/api/users/delete-account', {
      headers: { 'x-auth-token': token },
    });
  });

  test('Q2 — Unauthenticated request returns 401 @critical', async () => {
    const response = await apiContext.get('/notes/api/users/profile');
    expect(response.status()).toBe(401);
  });

  test('Q3 — Schema validation: user profile response @regression', async () => {
    const email = `schema_${Date.now()}@example.com`;
    const password = 'TestPass123!';
    const name = 'Schema Test User';

    await apiContext.post('/notes/api/users/register', {
      data: { name, email, password },
    });

    const loginResponse = await apiContext.post('/notes/api/users/login', {
      data: { email, password },
    });
    const loginBody = await loginResponse.json();
    const token = loginBody.data?.token;

    const profileResponse = await apiContext.get('/notes/api/users/profile', {
      headers: { 'x-auth-token': token },
    });

    expect(profileResponse.status()).toBe(200);
    const body = await profileResponse.json();
    const profile = body.data;

    // Schema validation
    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('email');

    expect(typeof profile.id).toBe('string');
    expect(typeof profile.name).toBe('string');
    expect(typeof profile.email).toBe('string');
    expect(profile.email).toBe(email);
    expect(profile.name).toBe(name);

    // Cleanup
    await apiContext.delete('/notes/api/users/delete-account', {
      headers: { 'x-auth-token': token },
    });
  });
});