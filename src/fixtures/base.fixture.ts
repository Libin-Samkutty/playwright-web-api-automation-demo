import { test as base, expect } from '@playwright/test';
import { PageManager } from './page-manager';
import { ApiManager } from './api-manager';
import { AuthService } from '../services/auth.service';
import { NotesService } from '../services/notes.service';

type CustomFixtures = {
  pm: PageManager;
  api: ApiManager;
  authService: AuthService;
  notesService: NotesService;
};

export const test = base.extend<CustomFixtures>({
  pm: async ({ page }, use) => {
    await use(new PageManager(page));
  },

  api: async ({ request }, use) => {
    await use(new ApiManager(request));
  },

  authService: async ({ page, request }, use) => {
    await use(new AuthService(page, request));
  },

  notesService: async ({ page, request }, use) => {
    await use(new NotesService(page, request));
  },
});

export { expect } from '@playwright/test';