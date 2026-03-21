import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class NotesAppPage extends BasePage {
  protected readonly path = '/notes/app';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly logoutButton: Locator;
  readonly addNoteButton: Locator;
  readonly notesList: Locator;
  readonly noteItems: Locator;
  readonly noteTitleInput: Locator;
  readonly noteDescriptionInput: Locator;
  readonly noteCategorySelect: Locator;
  readonly saveNoteButton: Locator;
  readonly deleteNoteButton: Locator;
  readonly editNoteButton: Locator;
  readonly searchInput: Locator;
  readonly noNotesMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="email"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    this.registerLink = page.locator('a:has-text("Register"), a:has-text("Create")').first();
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    this.addNoteButton = page.locator(
      'button:has-text("Add Note"), button:has-text("Create"), [data-testid="add-note"]',
    ).first();
    this.notesList = page.locator('.note-list, [data-testid="note-list"], .notes');
    this.noteItems = page.locator(
      '.note-card, [data-testid="note"], .note-item, .card',
    );
    this.noteTitleInput = page.locator(
      'input[name="title"], input[placeholder*="Title"], #title',
    ).first();
    this.noteDescriptionInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="Description"], #description, textarea',
    ).first();
    this.noteCategorySelect = page.locator(
      'select[name="category"], #category, select',
    ).first();
    this.saveNoteButton = page.locator(
      'button:has-text("Save"), button:has-text("Create"), button[type="submit"]',
    ).first();
    this.deleteNoteButton = page.locator(
      'button:has-text("Delete"), [data-testid="delete"]',
    ).first();
    this.editNoteButton = page.locator(
      'button:has-text("Edit"), [data-testid="edit"]',
    ).first();
    this.searchInput = page.locator(
      'input[placeholder*="Search"], input[type="search"]',
    ).first();
    this.noNotesMessage = page.locator(
      ':has-text("No notes"), :has-text("no notes")',
    ).first();
  }

  async loginToApp(email: string, password: string): Promise<void> {
    await step(`Login to Notes App: ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async createNote(
    title: string,
    description: string,
    category: string,
  ): Promise<void> {
    await step(`Create note: ${title}`, async () => {
      await this.addNoteButton.click();
      await this.noteTitleInput.waitFor({ state: 'visible' });
      await this.noteTitleInput.fill(title);
      await this.noteDescriptionInput.fill(description);
      if (await this.noteCategorySelect.isVisible()) {
        await this.noteCategorySelect.selectOption(category);
      }
      await this.saveNoteButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async editNote(
    noteIndex: number,
    newTitle: string,
    newDescription: string,
  ): Promise<void> {
    await step(`Edit note ${noteIndex}`, async () => {
      const note = this.noteItems.nth(noteIndex);
      await note
        .locator('button:has-text("Edit"), [data-testid="edit"]')
        .first()
        .click();
      await this.noteTitleInput.waitFor({ state: 'visible' });
      await this.noteTitleInput.clear();
      await this.noteTitleInput.fill(newTitle);
      await this.noteDescriptionInput.clear();
      await this.noteDescriptionInput.fill(newDescription);
      await this.saveNoteButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async deleteNote(noteIndex: number): Promise<void> {
    await step(`Delete note ${noteIndex}`, async () => {
      const note = this.noteItems.nth(noteIndex);
      this.page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      await note
        .locator('button:has-text("Delete"), [data-testid="delete"]')
        .first()
        .click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async getNoteCount(): Promise<number> {
    await this.page.waitForTimeout(500);
    return this.noteItems.count();
  }

  async getNoteTitleAtIndex(index: number): Promise<string> {
    const note = this.noteItems.nth(index);
    const title = note.locator('h5, .card-title, .note-title').first();
    return (await title.textContent())?.trim() ?? '';
  }

  async noteExists(title: string): Promise<boolean> {
    const count = await this.noteItems.count();
    for (let i = 0; i < count; i++) {
      const noteTitle = await this.getNoteTitleAtIndex(i);
      if (noteTitle.includes(title)) return true;
    }
    return false;
  }

  async logout(): Promise<void> {
    await step('Logout from Notes App', async () => {
      await this.logoutButton.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}