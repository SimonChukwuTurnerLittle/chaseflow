import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Eye, Trash2, Target, X } from 'lucide-react';
import { clsx } from 'clsx';

import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { useOpportunities, useDeleteOpportunity } from '@/hooks/useOpportunities';
import { CreateOpportunityModal } from './modals/CreateOpportunityModal';
import { OpportunityDetailModal } from './modals/OpportunityDetailModal';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
];

const TEMPERATURE_OPTIONS = [
  { value: '', label: 'All Temperatures' },
  { value: 'HOT', label: 'Hot' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'COLD', label: 'Cold' },
  { value: 'DORMANT', label: 'Dormant' },
];

export default function OpportunitiesPage() {
  // Filter state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [temperature, setTemperature] = useState('');
  const [service, setService] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewTargetId, setViewTargetId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Build query params (Spring Pageable is 0-indexed)
  const params = {
    page: page - 1,
    size: 20,
    ...(search && { search }),
    ...(status && { status }),
    ...(temperature && { temperature }),
    ...(service && { service }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading } = useOpportunities(params);
  const deleteMutation = useDeleteOpportunity();

  const opportunities = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  const hasFilters = search || status || temperature || service || dateFrom || dateTo;

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setTemperature('');
    setService('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Error handled by mutation hook
    }
  };

  const columns = [
    {
      key: 'leadName',
      label: 'Lead Name',
      render: (value, row) => (
        <button
          onClick={() => setViewTargetId(row.id)}
          className="font-medium text-cta hover:underline cursor-pointer text-left"
        >
          {value || row.lead?.name || '-'}
        </button>
      ),
    },
    {
      key: 'serviceName',
      label: 'Service Name',
      render: (value, row) => value || row.service?.name || '-',
    },
    {
      key: 'temperature',
      label: 'Temperature',
      render: (value) => value ? <TemperatureBadge temperature={value} /> : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value ? <StatusBadge status={value} /> : '-',
    },
    {
      key: 'stage',
      label: 'Stage',
      render: (value) => value || '-',
    },
    {
      key: 'nextChaseDate',
      label: 'Next Chase Date',
      render: (value) =>
        value ? format(new Date(value), 'MMM d, yyyy') : '-',
    },
    {
      key: 'currentStep',
      label: 'Current Step',
      render: (value) => value ?? '-',
    },
    {
      key: 'handler',
      label: 'Handler',
      render: (value, row) => value || row.handler?.name || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewTargetId(row.id)}
            title="View Opportunity"
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete"
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus size={16} />
          New Opportunity
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by lead name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={clsx(
                'w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none',
                'transition-all duration-200',
                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'placeholder:text-slate-400'
              )}
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Temperature */}
          <select
            value={temperature}
            onChange={(e) => {
              setTemperature(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            {TEMPERATURE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Service */}
          <select
            value={service}
            onChange={(e) => {
              setService(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            <option value="">All Services</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : opportunities.length === 0 && !hasFilters ? (
        <EmptyState
          icon={Target}
          title="No opportunities yet"
          description="Create your first opportunity to start tracking your sales pipeline."
          action={
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus size={16} />
              New Opportunity
            </Button>
          }
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={opportunities}
            loading={isLoading}
            emptyMessage="No opportunities match your filters"
          />

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Create Opportunity Modal */}
      <CreateOpportunityModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* View Opportunity Modal */}
      <OpportunityDetailModal
        opportunityId={viewTargetId}
        open={!!viewTargetId}
        onClose={() => setViewTargetId(null)}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete this opportunity${
          deleteTarget?.leadName ? ` for ${deleteTarget.leadName}` : ''
        }? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </>
  );
}
