import axios, { AxiosInstance, AxiosError } from 'axios';
import { Lead, CreateLeadDto, UpdateLeadDto, ApiResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<never>>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: { id: string; username: string; role: string } }> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    if (response.data.success && response.data.token && response.data.user) {
      return {
        token: response.data.token,
        user: response.data.user,
      };
    }
    throw new Error('Failed to login');
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<{ id: string; username: string; role: string }>>('/auth/me');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to get user');
  },
};

export const leadApi = {
  getAll: async (
    status?: 'active' | 'inactive',
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedResponse<Lead>> => {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    if (search) params.search = search;
    
    const response = await api.get<ApiResponse<Lead[]> & { pagination: any }>('/leads', { params });
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error('Failed to fetch leads');
  },

  getById: async (id: string): Promise<Lead> => {
    const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to fetch lead');
  },

  create: async (data: CreateLeadDto): Promise<Lead> => {
    const response = await api.post<ApiResponse<Lead>>('/leads', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to create lead');
  },

  update: async (id: string, data: UpdateLeadDto): Promise<Lead> => {
    const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Failed to update lead');
  },

  delete: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse<never>>(`/leads/${id}`);
    if (!response.data.success) {
      throw new Error('Failed to delete lead');
    }
  },
};

