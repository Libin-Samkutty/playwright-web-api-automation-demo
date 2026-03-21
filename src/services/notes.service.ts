import { Page, APIRequestContext, expect } from '@playwright/test';
import { NotesAppPage } from '../pages/notes-app.page';
import { NotesApiClient } from '../api/notes-api.client';
import { NoteData, NoteFactory } from '../data/factories/note.factory';

export class NotesService {
  private notesAppPage: NotesAppPage;
  private notesApi: NotesApiClient;

  constructor(page: Page, request: APIRequestContext) {
    this.notesAppPage = new NotesAppPage(page);
    this.notesApi = new NotesApiClient(request);
  }

  setApiToken(token: string): void {
    this.notesApi.setToken(token);
  }

  async createNoteViaUI(
    title: string,
    description: string,
    category: string,
  ): Promise<void> {
    await this.notesAppPage.createNote(title, description, category);
  }

  async createNoteViaApi(noteData?: NoteData): Promise<string> {
    const data = noteData ?? NoteFactory.validNote();
    const response = await this.notesApi.createNote(data);
    expect(response.status).toBe(200);
    return response.data.data.id;
  }

  async verifyNoteExistsViaApi(noteId: string): Promise<void> {
    const response = await this.notesApi.getNote(noteId);
    expect(response.status).toBe(200);
  }

  async verifyNoteInUi(title: string): Promise<boolean> {
    return this.notesAppPage.noteExists(title);
  }

  async crossLayerVerify_UICreateApiCheck(
    title: string,
    description: string,
    category: string,
  ): Promise<void> {
    await this.createNoteViaUI(title, description, category);

    const apiResponse = await this.notesApi.getAllNotes();
    expect(apiResponse.status).toBe(200);

    const notes = apiResponse.data.data;
    const found = notes.find((n: { title: string }) => n.title === title);
    expect(found).toBeDefined();
    expect(found?.description).toContain(description);
  }

  async crossLayerVerify_APICreateUICheck(
    noteData: NoteData,
  ): Promise<void> {
    const noteId = await this.createNoteViaApi(noteData);
    expect(noteId).toBeTruthy();

    await this.notesAppPage.goto();
    const exists = await this.notesAppPage.noteExists(noteData.title);
    expect(exists).toBeTruthy();
  }

  async cleanupAllNotes(): Promise<void> {
    const response = await this.notesApi.getAllNotes();
    if (response.status === 200 && response.data.data) {
      for (const note of response.data.data) {
        await this.notesApi.deleteNote(note.id).catch(() => {});
      }
    }
  }
}