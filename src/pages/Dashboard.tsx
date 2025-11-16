import { useState, useCallback, useEffect } from 'react';
import { Lead, CreateLeadDto } from '../types';
import { Layout } from '../components/layout/Layout';
import { LeadFilters } from '../components/leads/LeadFilters';
import { LeadsTable } from '../components/leads/LeadsTable';
import { LeadModal } from '../components/leads/LeadModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { Toast, ToastType } from '../components/common/Toast';
import { DEBOUNCE_DELAY } from '../utils/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import {
  useGetLeadsQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} from '../store/api';

type StatusFilter = 'all' | 'active' | 'inactive';

export const Dashboard = (): JSX.Element => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // RTK Query hooks
  const {
    data: leadsData,
    isLoading,
    error: queryError,
    refetch,
  } = useGetLeadsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery || undefined,
  });

  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();

  const leads = leadsData?.data || [];
  const pagination = leadsData?.pagination;
  const error = queryError ? 'Failed to fetch leads' : null;
  const isSubmitting = isCreating || isUpdating;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddLead = useCallback((): void => {
    setEditingLead(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditLead = useCallback((lead: Lead): void => {
    setEditingLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string): void => {
    setDeleteLeadId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!deleteLeadId) return;

    try {
      await deleteLead(deleteLeadId).unwrap();
      setToast({ message: 'Lead deleted successfully', type: 'success' });
      setDeleteLeadId(null);
      
      // If current page becomes empty, go to previous page
      if (pagination && currentPage > 1 && leads.length === 1) {
        setCurrentPage(currentPage - 1);
      } else {
        refetch();
      }
    } catch (err: any) {
      setToast({
        message: err?.data?.message || err?.message || 'Failed to delete lead',
        type: 'error',
      });
    }
  }, [deleteLeadId, deleteLead, pagination, currentPage, leads.length, refetch]);

  const handleSubmitLead = useCallback(
    async (data: CreateLeadDto): Promise<void> => {
      try {
        if (editingLead) {
          await updateLead({ id: editingLead.id, data }).unwrap();
          setToast({ message: 'Lead updated successfully', type: 'success' });
        } else {
          await createLead(data).unwrap();
          setToast({ message: 'Lead created successfully', type: 'success' });
        }
        setIsModalOpen(false);
        setEditingLead(undefined);
        refetch();
      } catch (err: any) {
        setToast({
          message:
            err?.data?.message ||
            err?.message ||
            (editingLead ? 'Failed to update lead' : 'Failed to create lead'),
          type: 'error',
        });
        throw err;
      }
    },
    [editingLead, createLead, updateLead, refetch]
  );

  const handlePageChange = useCallback((page: number): void => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const selectedLead = deleteLeadId ? leads.find((l) => l.id === deleteLeadId) : null;

  return (
    <Layout onAddLead={handleAddLead}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <LeadFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        leadCount={pagination?.total || 0}
      />

      <LeadsTable
        leads={leads}
        onEdit={handleEditLead}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="!px-3"
            >
              <ChevronLeft size={18} />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'secondary'}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className="!px-3 !min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isLoading}
              className="!px-3"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLead(undefined);
        }}
        lead={editingLead}
        onSubmit={handleSubmitLead}
        isLoading={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={!!deleteLeadId}
        onClose={() => setDeleteLeadId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        itemName={selectedLead ? `${selectedLead.name} (${selectedLead.email})` : undefined}
        isLoading={isDeleting}
      />
    </Layout>
  );
};
