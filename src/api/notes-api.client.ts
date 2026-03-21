import { APIRequestContext } from '@playwright/test';
import { BaseApiClient, ApiResponse } from './base-api.client';
import { ENV } from '../config/env.config';
import { NoteData } from '../data/factories/note.factory';

interface AuthResponse {
  success: boolean;
  status: number;
  message: string;
  data: { token: string };
}

interface NoteResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    completed: boolean;
    created_at: string;
    updated_at: string;
    user_id?: string;
  };
}

interface NotesListResponse {
  success: boolean;
  status: number;
  message: string;
  data: NoteResponse['data'][];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export class NotesApiClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request, ENV.NOTES_API_URL);
  }

  async register(
    data: RegisterData,
  ): Promise<ApiResponse<{ success: boolean; status: number; message: string }>> {
    return this.post('/users/register', data);
  }

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.post<AuthResponse>('/users/login', {
      email,
      password,
    });
    if (response.status === 200 && response.data?.data?.token) {
      this.setToken(response.data.data.token);
    }
    return response;
  }

  async getProfile(): Promise<ApiResponse<unknown>> {
    return this.get('/users/profile');
  }

  async createNote(note: NoteData): Promise<ApiResponse<NoteResponse>> {
    return this.post<NoteResponse>('/notes', note);
  }

  async getNote(id: string): Promise<ApiResponse<NoteResponse>> {
    return this.get<NoteResponse>(`/notes/${id}`);
  }

  async getAllNotes(): Promise<ApiResponse<NotesListResponse>> {
    return this.get<NotesListResponse>('/notes');
  }

  async updateNote(
    id: string,
    updates: Partial<NoteData>,
  ): Promise<ApiResponse<NoteResponse>> {
    return this.put<NoteResponse>(`/notes/${id}`, updates);
  }

  async patchNote(
    id: string,
    updates: Partial<NoteData>,
  ): Promise<ApiResponse<NoteResponse>> {
    return this.patch<NoteResponse>(`/notes/${id}`, updates);
  }

  async deleteNote(
    id: string,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.delete(`/notes/${id}`);
  }

  async healthCheck(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.get('/health-check');
  }

  async deleteAccount(): Promise<ApiResponse<unknown>> {
    return this.delete('/users/delete-account');
  }

  async registerAndLogin(
    data: RegisterData,
  ): Promise<ApiResponse<AuthResponse>> {
    await this.register(data);
    return this.login(data.email, data.password);
  }
}