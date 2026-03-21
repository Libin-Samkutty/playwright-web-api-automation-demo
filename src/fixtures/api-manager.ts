import { APIRequestContext } from '@playwright/test';
import { NotesApiClient } from '../api/notes-api.client';
import { PracticeApiClient } from '../api/practice-api.client';

export class ApiManager {
  private request: APIRequestContext;
  private cache = new Map<string, unknown>();

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private getOrCreate<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key) as T;
  }

  get notesApi() {
    return this.getOrCreate('notes', () => new NotesApiClient(this.request));
  }

  get practiceApi() {
    return this.getOrCreate('practice', () => new PracticeApiClient(this.request));
  }
}