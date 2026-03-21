import { Page, Locator, FrameLocator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class IframePage extends BasePage {
  protected readonly path = '/iframe';

  readonly iframeElement: Locator;
  readonly iframes: Locator;

  constructor(page: Page) {
    super(page);
    this.iframeElement = page.locator('iframe').first();
    this.iframes = page.locator('iframe');
  }

  getFrame(index = 0): FrameLocator {
    return this.page.frameLocator(`iframe >> nth=${index}`);
  }

  getFrameBySelector(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }

  async getIframeSrc(index = 0): Promise<string> {
    return (await this.iframes.nth(index).getAttribute('src')) ?? '';
  }

  async getFrameContent(index = 0): Promise<string> {
    return step('Read iFrame content', async () => {
      const frame = this.getFrame(index);
      const body = frame.locator('body');
      await body.waitFor({ state: 'visible', timeout: 5000 });
      return (await body.textContent())?.trim() ?? '';
    });
  }

  async interactWithFrameElement(
    frameIndex: number,
    selector: string,
    action: 'click' | 'fill',
    value?: string,
  ): Promise<void> {
    await step(`Interact with element in iFrame ${frameIndex}`, async () => {
      const frame = this.getFrame(frameIndex);
      const element = frame.locator(selector);
      if (action === 'click') {
        await element.click();
      } else if (action === 'fill' && value !== undefined) {
        await element.fill(value);
      }
    });
  }

  async getNestedFrameContent(
    outerSelector: string,
    innerSelector: string,
  ): Promise<string> {
    return step('Read nested iFrame content', async () => {
      const outerFrame = this.page.frameLocator(outerSelector);
      const innerFrame = outerFrame.frameLocator(innerSelector);
      const body = innerFrame.locator('body');
      return (await body.textContent())?.trim() ?? '';
    });
  }

  async getIframeCount(): Promise<number> {
    return this.iframes.count();
  }
}