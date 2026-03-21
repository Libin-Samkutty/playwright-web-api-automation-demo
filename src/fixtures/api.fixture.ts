import { test as base, expect } from '@playwright/test';
import { ApiManager } from './api-manager';
import { NotesApiClient } from '../api/notes-api.client';
import { PracticeApiClient } from '../api/practice-api.client';
import { UserFactory } from '../data/factories/user.factory';

type ApiFixtures = {
  api: ApiManager;
  authenticatedNotesApi: NotesApiClient;
  practiceApi: PracticeApiClient;
};

type ApiWorkerFixtures = {
  workerNotesApi: NotesApiClient;
  workerUserData: { email: string; password: string; token: string };
};

export const apiTest = base.extend<ApiFixtures, ApiWorkerFixtures>({
  workerNotesApi: [
    async ({ request }, use) => {
      const api = new NotesApiClient(request);
      await use(api);
    },
    { scope: 'worker' },
  ],

  workerUserData: [
    async ({ workerNotesApi }, use, workerInfo) => {
      const userData = UserFactory.uniqueUser(workerInfo.workerIndex);
      await workerNotesApi.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });
      const loginResponse = await workerNotesApi.login(
        userData.email,
        userData.password,
      );
      const token =
        loginResponse.status === 200
          ? loginResponse.data.data.token
          : '';

      await use({ email: userData.email, password: userData.password, token });

      await workerNotesApi.deleteAccount().catch(() => {});
    },
    { scope: 'worker' },
  ],

  api: async ({ request }, use) => {
    await use(new ApiManager(request));
  },

  authenticatedNotesApi: async ({ request, workerUserData }, use) => {
    const api = new NotesApiClient(request);
    api.setToken(workerUserData.token);
    await use(api);
  },

  practiceApi: async ({ request }, use) => {
    const api = new PracticeApiClient(request);
    await use(api);
  },
});

export { expect } from '@playwright/test';