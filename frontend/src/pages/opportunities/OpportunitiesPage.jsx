import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus, Search, Eye, Trash2, Target, X, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

import { useSetPageHeader } from '@/contexts/PageHeaderContext';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function OpportunitiesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [temperature, setTemperature] = useState('');
  const [service, setService] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewTargetId, setViewTargetId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const headerActions = useMemo(() => (
    <Button onClick={() => setCreateModalOpen(true)}>
      <Plus size={16} />
      New Opportunity
    </Button>
  ), []);
  useSetPageHeader('Opportunities', 'Track and manage your sales opportunities', headerActions);

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
  const totalElements = data?.size ?? 0;

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
      label: 'Service',
      render: (value, row) => (
        <span className="text-slate-600">{value || row.service?.name || '-'}</span>
      ),
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
      render: (value) => (
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
          value ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
        )}>
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'nextChaseDate',
      label: 'Next Chase',
      render: (value) => (
        <span className="text-slate-500 text-sm tabular-nums">
          {value ? format(new Date(value), 'MMM d, yyyy') : '-'}
        </span>
      ),
    },
    {
      key: 'currentStep',
      label: 'Step',
      render: (value) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
          {value ?? '-'}
        </span>
      ),
    },
    {
      key: 'handler',
      label: 'Handler',
      render: (value, row) => (
        <span className="text-slate-600">{value || row.handler?.name || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_value, row) => (
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setViewTargetId(row.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cta bg-cta/5 rounded-lg hover:bg-cta/10 cursor-pointer transition-colors duration-150"
            title="View"
          >
            <Eye size={13} />
            View
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors duration-150"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats strip */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-2xl px-5 py-3 shadow-card flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/10">
              <Target size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Opportunities</p>
              <p className="text-lg font-bold text-primary tabular-nums">{totalElements}</p>
            </div>
          </div>
          {hasFilters && (
            <div className="bg-white rounded-2xl px-5 py-3 shadow-card flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/10">
                <Filter size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Filtered Results</p>
                <p className="text-lg font-bold text-primary tabular-nums">{opportunities.length}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 shadow-card mb-6">
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
                'w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none',
                'transition-all duration-200 bg-slate-50/50',
                'focus:ring-2 focus:ring-cta/20 focus:border-cta focus:bg-white',
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
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
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
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
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
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
          >
            <option value="">All Services</option>
          </select>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 transition-all duration-200"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 transition-all duration-200"
            />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} />
              Clear Filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-card flex items-center justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : opportunities.length === 0 && !hasFilters ? (
          <div className="bg-white rounded-2xl shadow-card py-16">
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
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={opportunities}
              loading={isLoading}
              emptyMessage="No opportunities match your filters"
            />

            <div className="flex justify-center mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </motion.div>

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
    </motion.div>
  );
}
