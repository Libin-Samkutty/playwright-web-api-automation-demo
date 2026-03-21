import { Page, Route, Request, Response } from '@playwright/test';

export interface InterceptedRequest {
  url: string;
  method: string;
  status?: number;
  headers: Record<string, string>;
  body?: string;
}

export class NetworkHelper {
  private intercepted: InterceptedRequest[] = [];

  constructor(private page: Page) {}

  async interceptRequests(urlPattern: string | RegExp): Promise<void> {
    this.intercepted = [];
    await this.page.route(urlPattern, async (route: Route) => {
      const request = route.request();
      const response = await route.fetch().catch(() => null);
      this.intercepted.push({
        url: request.url(),
        method: request.method(),
        status: response?.status(),
        headers: request.headers(),
        body: request.postData() ?? undefined,
      });
      if (response) {
        await route.fulfill({ response });
      } else {
        await route.continue();
      }
    });
  }

  async blockRequests(urlPattern: string | RegExp, status = 404): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({ status, body: '' });
    });
  }

  async mockResponse(
    urlPattern: string | RegExp,
    body: unknown,
    status = 200,
  ): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

  getIntercepted(): InterceptedRequest[] {
    return [...this.intercepted];
  }

  getInterceptedByUrl(substring: string): InterceptedRequest[] {
    return this.intercepted.filter((r) => r.url.includes(substring));
  }

  async waitForResponse(
    urlPattern: string | RegExp,
    options?: { status?: number; timeout?: number },
  ): Promise<Response> {
    return this.page.waitForResponse(
      (resp) => {
        const urlMatch =
          typeof urlPattern === 'string'
            ? resp.url().includes(urlPattern)
            : urlPattern.test(resp.url());
        const statusMatch = options?.status ? resp.status() === options.status : true;
        return urlMatch && statusMatch;
      },
      { timeout: options?.timeout ?? 10_000 },
    );
  }

  async getResponseStatus(url: string): Promise<number> {
    const response = await this.page.request.get(url);
    return response.status();
  }

  clearIntercepted(): void {
    this.intercepted = [];
  }
}