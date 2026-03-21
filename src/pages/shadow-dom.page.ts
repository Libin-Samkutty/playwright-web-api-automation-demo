import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { step } from '../helpers/allure.helper';

export class ShadowDomPage extends BasePage {
  protected readonly path = '/shadowdom';

  readonly shadowHost: Locator;
  readonly shadowContent: Locator;

  constructor(page: Page) {
    super(page);
    this.shadowHost = page.locator('[id*="shadow"], my-paragraph, custom-element').first();
    this.shadowContent = page.locator('[id*="shadow"] span, my-paragraph span').first();
  }

  async getShadowRootText(): Promise<string> {
    return step('Read shadow DOM content', async () => {
      const text = await this.page.evaluate(() => {
        const hosts = document.querySelectorAll('*');
        for (const host of hosts) {
          if (host.shadowRoot) {
            return host.shadowRoot.textContent?.trim() ?? '';
          }
        }
        return '';
      });
      return text;
    });
  }

  async getShadowElementText(selector: string): Promise<string> {
    return this.page.evaluate((sel) => {
      const hosts = document.querySelectorAll('*');
      for (const host of hosts) {
        if (host.shadowRoot) {
          const element = host.shadowRoot.querySelector(sel);
          if (element) return element.textContent?.trim() ?? '';
        }
      }
      return '';
    }, selector);
  }

  async hasShadowRoot(): Promise<boolean> {
    return this.page.evaluate(() => {
      const hosts = document.querySelectorAll('*');
      for (const host of hosts) {
        if (host.shadowRoot) return true;
      }
      return false;
    });
  }

  async fillShadowInput(selector: string, value: string): Promise<void> {
    await step(`Fill shadow DOM input: ${value}`, async () => {
      await this.page.evaluate(
        ({ sel, val }) => {
          const hosts = document.querySelectorAll('*');
          for (const host of hosts) {
            if (host.shadowRoot) {
              const input = host.shadowRoot.querySelector(sel) as HTMLInputElement;
              if (input) {
                input.value = val;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                return;
              }
            }
          }
        },
        { sel: selector, val: value },
      );
    });
  }

  async getNestedShadowContent(): Promise<string> {
    return this.page.evaluate(() => {
      function traverseShadow(root: Document | ShadowRoot, depth: number): string {
        if (depth > 5) return '';
        const elements = root.querySelectorAll('*');
        for (const el of elements) {
          if (el.shadowRoot) {
            const text = traverseShadow(el.shadowRoot, depth + 1);
            if (text) return text;
          }
        }
        return root.textContent?.trim() ?? '';
      }
      return traverseShadow(document, 0);
    });
  }
}