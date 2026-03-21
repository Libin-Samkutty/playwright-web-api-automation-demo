import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class DragDropPage extends BasePage {
  protected readonly path = '/drag-and-drop';

  readonly columnA: Locator;
  readonly columnB: Locator;
  readonly sourceElement: Locator;
  readonly targetElement: Locator;

  constructor(page: Page) {
    super(page);
    this.columnA = page.locator('#column-a, .column:first-child').first();
    this.columnB = page.locator('#column-b, .column:last-child').first();
    this.sourceElement = page.locator('#column-a, [draggable="true"]').first();
    this.targetElement = page.locator('#column-b, .drop-target').first();
  }

  async dragAtoB(): Promise<void> {
    await step('Drag element A to zone B', async () => {
      await this.columnA.dragTo(this.columnB, { force: true });
    });
  }

  async dragBtoA(): Promise<void> {
    await step('Drag element B to zone A', async () => {
      await this.columnB.dragTo(this.columnA, { force: true });
    });
  }

  async getColumnAText(): Promise<string> {
    return (await this.columnA.locator('header, h3, .heading').textContent())?.trim() ?? '';
  }

  async getColumnBText(): Promise<string> {
    return (await this.columnB.locator('header, h3, .heading').textContent())?.trim() ?? '';
  }

  async dragWithMouse(
    source: Locator,
    target: Locator,
  ): Promise<void> {
    await step('Drag with mouse simulation', async () => {
      const sourceBox = await source.boundingBox();
      const targetBox = await target.boundingBox();
      if (!sourceBox || !targetBox) throw new Error('Cannot get bounding box');

      await this.page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2,
      );
      await this.page.mouse.down();
      await this.page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
        { steps: 10 },
      );
      await this.page.mouse.up();
    });
  }
}