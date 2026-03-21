import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';
import path from 'path';

export class UploadPage extends BasePage {
  protected readonly path = '/upload';

  readonly fileInput: Locator;
  readonly uploadButton: Locator;
  readonly dropZone: Locator;
  readonly uploadedFileName: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.fileInput = page.locator('input[type="file"]');
    this.uploadButton = page.locator(
      'button[type="submit"], button:has-text("Upload"), #file-submit',
    );
    this.dropZone = page.locator('.drop-zone, .dropzone, #drop-area, [class*="drag"]');
    this.uploadedFileName = page.locator('#uploaded-files, .uploaded-file, .file-name');
    this.successMessage = page.locator('.alert-success, #flash.success, h3:has-text("Uploaded")');
    this.errorMessage = page.locator('.alert-danger, .error-message, #flash.error');
  }

  async uploadFile(filePath: string): Promise<void> {
    await step(`Upload file: ${path.basename(filePath)}`, async () => {
      await this.fileInput.setInputFiles(filePath);
      if (await this.uploadButton.isVisible()) {
        await this.uploadButton.click();
      }
    });
  }

  async uploadFileForce(filePath: string): Promise<void> {
    await step(`Force-upload file: ${path.basename(filePath)}`, async () => {
      await this.fileInput.setInputFiles(filePath, { timeout: 5000 });
      if (await this.uploadButton.isVisible()) {
        await this.uploadButton.click();
      }
    });
  }

  async getUploadedFileName(): Promise<string> {
    await this.uploadedFileName.waitFor({ state: 'visible', timeout: 5000 });
    return (await this.uploadedFileName.textContent())?.trim() ?? '';
  }

  async expectUploadSuccess(): Promise<void> {
    await step('Verify upload success', async () => {
      await this.successMessage.waitFor({ state: 'visible', timeout: 10_000 });
    });
  }

  async expectUploadError(): Promise<void> {
    await step('Verify upload error', async () => {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    });
  }

  static getFixturePath(fileName: string): string {
    return path.resolve(__dirname, '..', 'fixtures', 'files', fileName);
  }
}