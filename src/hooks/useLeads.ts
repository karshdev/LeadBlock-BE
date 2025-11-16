import { useState, useEffect, useCallback } from 'react';
import { Lead, CreateLeadDto, UpdateLeadDto } from '../types';
import { leadApi, PaginatedResponse } from '../services/api';

interface UseLeadsReturn {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetchLeads: (
    status?: 'active' | 'inactive',
    page?: number,
    limit?: number,
    search?: string
  ) => Promise<void>;
  createLead: (data: CreateLeadDto) => Promise<void>;
  updateLead: (id: string, data: UpdateLeadDto) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseLeadsReturn['pagination']>(null);

  const fetchLeads = useCallback(
    async (
      status?: 'active' | 'inactive',
      page: number = 1,
      limit: number = 10,
      search?: string
    ): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const response: PaginatedResponse<Lead> = await leadApi.getAll(status, page, limit, search);
        setLeads(response.data);
        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch leads';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createLead = useCallback(async (data: CreateLeadDto): Promise<void> => {
    try {
      setError(null);
      const newLead = await leadApi.create(data);
      // Refresh leads to get updated pagination
      await fetchLeads();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create lead';
      setError(message);
      throw err;
    }
  }, [fetchLeads]);

  const updateLead = useCallback(async (id: string, data: UpdateLeadDto): Promise<void> => {
    try {
      setError(null);
      await leadApi.update(id, data);
      // Refresh leads to get updated data
      await fetchLeads();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update lead';
      setError(message);
      throw err;
    }
  }, [fetchLeads]);

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await leadApi.delete(id);
      // Refresh leads to get updated pagination
      await fetchLeads();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(message);
      throw err;
    }
  }, [fetchLeads]);

  useEffect(() => {
    fetchLeads(undefined, 1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    leads,
    isLoading,
    error,
    pagination,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
};

