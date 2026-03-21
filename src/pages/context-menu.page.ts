import { Page, Locator, Dialog } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class ContextMenuPage extends BasePage {
  protected readonly path = '/context-menu';

  readonly hotSpot: Locator;

  constructor(page: Page) {
    super(page);
    this.hotSpot = page.locator('#hot-spot, .context-menu-target, #context-menu-target').first();
  }

  async rightClick(): Promise<void> {
    await step('Right-click on target element', async () => {
      await this.hotSpot.click({ button: 'right' });
    });
  }

  async rightClickAndCaptureAlert(): Promise<string> {
    return step('Right-click and capture alert', async () => {
      let alertText = '';
      this.page.once('dialog', async (dialog: Dialog) => {
        alertText = dialog.message();
        await dialog.accept();
      });
      await this.hotSpot.click({ button: 'right' });
      await this.page.waitForTimeout(500);
      return alertText;
    });
  }
}