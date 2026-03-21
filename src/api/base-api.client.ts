import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  responseTime: number;
}

export class BaseApiClient {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected token: string | null = null;

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.token) {
      headers['x-auth-token'] = this.token;
    }
    return headers;
  }

  protected async handleResponse<T>(
    response: APIResponse,
    startTime: number,
  ): Promise<ApiResponse<T>> {
    const responseTime = Date.now() - startTime;
    let data: T;
    try {
      data = await response.json();
    } catch {
      data = (await response.text()) as unknown as T;
    }

    const headers: Record<string, string> = {};
    const rawHeaders = response.headers();
    Object.entries(rawHeaders).forEach(([key, value]) => {
      headers[key] = value;
    });

    return {
      status: response.status(),
      data,
      headers,
      responseTime,
    };
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.request.get(url, {
      headers: this.getHeaders(),
      params,
    });
    return this.handleResponse<T>(response, startTime);
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.request.post(url, {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, startTime);
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.request.put(url, {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, startTime);
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.request.patch(url, {
      headers: this.getHeaders(),
      data,
    });
    return this.handleResponse<T>(response, startTime);
  }

  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.request.delete(url, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response, startTime);
  }
}