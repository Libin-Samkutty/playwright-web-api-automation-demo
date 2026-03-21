import { APIRequestContext } from '@playwright/test';
import { BaseApiClient, ApiResponse } from './base-api.client';
import { ENV } from '../config/env.config';

export class PracticeApiClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, ENV.PRACTICE_API_URL);
  }

  async healthCheck(): Promise<
    ApiResponse<{ success: boolean; message: string }>
  > {
    return this.get('/health-check');
  }

  async getAllObjects(): Promise<ApiResponse<unknown>> {
    return this.get('/objects');
  }

  async getObject(id: string): Promise<ApiResponse<unknown>> {
    return this.get(`/objects/${id}`);
  }

  async createObject(data: unknown): Promise<ApiResponse<unknown>> {
    return this.post('/objects', data);
  }

  async updateObject(id: string, data: unknown): Promise<ApiResponse<unknown>> {
    return this.put(`/objects/${id}`, data);
  }

  async deleteObject(id: string): Promise<ApiResponse<unknown>> {
    return this.delete(`/objects/${id}`);
  }
}