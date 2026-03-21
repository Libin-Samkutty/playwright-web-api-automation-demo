import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class DragCirclesPage extends BasePage {
  protected readonly path = '/drag-and-drop-circles';

  readonly circles: Locator;
  readonly dropZones: Locator;

  constructor(page: Page) {
    super(page);
    this.circles = page.locator('.circle, [draggable], .draggable');
    this.dropZones = page.locator('.drop-zone, .target-zone');
  }

  async getCircle(index: number): Promise<Locator> {
    return this.circles.nth(index);
  }

  async dragCircleToPosition(
    circleIndex: number,
    targetX: number,
    targetY: number,
  ): Promise<void> {
    await step(
      `Drag circle ${circleIndex} to (${targetX}, ${targetY})`,
      async () => {
        const circle = this.circles.nth(circleIndex);
        const box = await circle.boundingBox();
        if (!box) throw new Error('Cannot get circle bounding box');

        await this.page.mouse.move(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        await this.page.mouse.down();
        await this.page.mouse.move(targetX, targetY, { steps: 20 });
        await this.page.mouse.up();
      },
    );
  }

  async dragCircleToZone(
    circleIndex: number,
    zoneIndex: number,
  ): Promise<void> {
    await step(
      `Drag circle ${circleIndex} to zone ${zoneIndex}`,
      async () => {
        const circle = this.circles.nth(circleIndex);
        const zone = this.dropZones.nth(zoneIndex);
        await circle.dragTo(zone, { force: true });
      },
    );
  }

  async getCircleBoundingBox(
    index: number,
  ): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.circles.nth(index).boundingBox();
  }

  async isCircleInZone(
    circleIndex: number,
    zoneIndex: number,
  ): Promise<boolean> {
    const circleBox = await this.getCircleBoundingBox(circleIndex);
    const zoneBox = await this.dropZones.nth(zoneIndex).boundingBox();
    if (!circleBox || !zoneBox) return false;

    const circleCenterX = circleBox.x + circleBox.width / 2;
    const circleCenterY = circleBox.y + circleBox.height / 2;

    return (
      circleCenterX >= zoneBox.x &&
      circleCenterX <= zoneBox.x + zoneBox.width &&
      circleCenterY >= zoneBox.y &&
      circleCenterY <= zoneBox.y + zoneBox.height
    );
  }
}