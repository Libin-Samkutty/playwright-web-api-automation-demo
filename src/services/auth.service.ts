import { Page, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { NotesApiClient } from '../api/notes-api.client';
import { UserFactory, UserData } from '../data/factories/user.factory';
import { ENV } from '../config/env.config';

export class AuthService {
  private loginPage: LoginPage;
  private notesApi: NotesApiClient | null = null;

  constructor(page: Page, request?: APIRequestContext) {
    this.loginPage = new LoginPage(page);
    if (request) {
      this.notesApi = new NotesApiClient(request);
    }
  }

  async loginViaUI(
    username?: string,
    password?: string,
  ): Promise<void> {
    const creds = UserFactory.defaultLogin();
    await this.loginPage.goto();
    await this.loginPage.login(
      username ?? creds.username,
      password ?? creds.password,
    );
  }

  async loginViaApi(
    email: string,
    password: string,
  ): Promise<string> {
    if (!this.notesApi) throw new Error('API request context not provided');
    const response = await this.notesApi.login(email, password);
    if (response.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
    }
    return response.data.data.token;
  }

  async registerAndLoginViaApi(
    workerIndex: number,
  ): Promise<{ token: string; userData: UserData }> {
    if (!this.notesApi) throw new Error('API request context not provided');
    const userData = UserFactory.uniqueUser(workerIndex);
    const response = await this.notesApi.registerAndLogin({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });
    if (response.status !== 200) {
      throw new Error(`Register + Login failed: ${JSON.stringify(response.data)}`);
    }
    return { token: response.data.data.token, userData };
  }

  async saveSessionState(path: string): Promise<void> {
    await this.loginPage.saveSessionState(path);
  }

  async cleanupApiUser(): Promise<void> {
    if (this.notesApi) {
      await this.notesApi.deleteAccount().catch(() => {});
    }
  }
}