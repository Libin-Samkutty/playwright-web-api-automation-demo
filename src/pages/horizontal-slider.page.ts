import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class HorizontalSliderPage extends BasePage {
  protected readonly path = '/horizontal-slider';

  readonly slider: Locator;
  readonly valueDisplay: Locator;

  constructor(page: Page) {
    super(page);
    this.slider = page.locator('input[type="range"]');
    this.valueDisplay = page.locator('#range, #value, output, span#range').first();
  }

  async getSliderValue(): Promise<string> {
    return this.slider.inputValue();
  }

  async getDisplayedValue(): Promise<string> {
    return (await this.valueDisplay.textContent())?.trim() ?? '';
  }

  async setValueByMouse(targetValue: number): Promise<void> {
    await step(`Set slider value to ${targetValue} via mouse`, async () => {
      const box = await this.slider.boundingBox();
      if (!box) throw new Error('Slider not found');

      const min = parseFloat((await this.slider.getAttribute('min')) ?? '0');
      const max = parseFloat((await this.slider.getAttribute('max')) ?? '5');
      const ratio = (targetValue - min) / (max - min);
      const targetX = box.x + ratio * box.width;
      const targetY = box.y + box.height / 2;

      await this.page.mouse.click(targetX, targetY);
    });
  }

  async incrementByKeyboard(steps: number): Promise<void> {
    await step(`Increment slider by ${steps} key presses`, async () => {
      await this.slider.focus();
      for (let i = 0; i < steps; i++) {
        await this.page.keyboard.press('ArrowRight');
      }
    });
  }

  async decrementByKeyboard(steps: number): Promise<void> {
    await step(`Decrement slider by ${steps} key presses`, async () => {
      await this.slider.focus();
      for (let i = 0; i < steps; i++) {
        await this.page.keyboard.press('ArrowLeft');
      }
    });
  }

  async getMinMax(): Promise<{ min: number; max: number; step: number }> {
    const min = parseFloat((await this.slider.getAttribute('min')) ?? '0');
    const max = parseFloat((await this.slider.getAttribute('max')) ?? '5');
    const stepVal = parseFloat((await this.slider.getAttribute('step')) ?? '0.5');
    return { min, max, step: stepVal };
  }

  async setToMax(): Promise<void> {
    const { max } = await this.getMinMax();
    await this.setValueByMouse(max + 1);
  }

  async setToMin(): Promise<void> {
    const { min } = await this.getMinMax();
    await this.setValueByMouse(min - 1);
  }
}