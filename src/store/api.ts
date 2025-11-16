import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Lead, CreateLeadDto, UpdateLeadDto, ApiResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';

export interface LoginRequest {
  username: string;
  password: string;
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

export interface PaginatedLeadsResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Lead', 'Auth'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getCurrentUser: builder.query<{ success: boolean; data: { id: string; username: string; role: string } }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    // Lead endpoints
    getLeads: builder.query<
      PaginatedLeadsResponse,
      { status?: 'active' | 'inactive'; page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: '/leads',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          ...(params.status && { status: params.status }),
          ...(params.search && { search: params.search }),
        },
      }),
      providesTags: ['Lead'],
    }),
    getLeadById: builder.query<ApiResponse<Lead>, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (result, error, id) => [{ type: 'Lead', id }],
    }),
    createLead: builder.mutation<ApiResponse<Lead>, CreateLeadDto>({
      query: (data) => ({
        url: '/leads',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lead'],
    }),
    updateLead: builder.mutation<ApiResponse<Lead>, { id: string; data: UpdateLeadDto }>({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Lead', id }, 'Lead'],
    }),
    deleteLead: builder.mutation<ApiResponse<never>, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lead'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} = apiSlice;

