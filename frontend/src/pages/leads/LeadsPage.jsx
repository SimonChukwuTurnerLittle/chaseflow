import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Pencil, Trash2, UserPlus, Search, Users, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { useSetPageHeader } from '@/contexts/PageHeaderContext';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { CreateLeadModal } from './modals/CreateLeadModal';

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Social', label: 'Social' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Other', label: 'Other' },
];

const RATING_OPTIONS = [
  { value: '', label: 'All Ratings' },
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

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [rating, setRating] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const headerActions = useMemo(() => (
    <Button onClick={() => setCreateOpen(true)}>
      <Plus size={16} />
      Add Lead
    </Button>
  ), []);
  useSetPageHeader('Leads', 'Manage and track your leads pipeline', headerActions);

  const deleteLead = useDeleteLead();

  const params = {
    page: page - 1,
    size: 20,
    ...(search && { search }),
    ...(source && { source }),
    ...(rating && { rating }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data, isLoading } = useLeads(params);

  const leads = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.size ?? 0;

  const hasFilters = search || source || rating || dateFrom || dateTo;

  const clearFilters = useCallback(() => {
    setSearch('');
    setSource('');
    setRating('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }, []);

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteLead.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <Link
          to={`/leads/${row.id}`}
          className="font-medium text-cta hover:underline"
        >
          {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (_, row) => (
        <span className="text-slate-600">{row.contactDetails?.email || '—'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (_, row) => (
        <span className="text-slate-600">{row.contactDetails?.phone || '—'}</span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (val) => (
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
          val ? 'bg-slate-100 text-slate-700' : 'text-slate-400'
        )}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (val ? <TemperatureBadge temperature={val} /> : '—'),
    },
    {
      key: 'handler',
      label: 'Handler',
      render: (val) => <span className="text-slate-600">{val || '—'}</span>,
    },
    {
      key: 'dateCreated',
      label: 'Date Created',
      render: (val) => (
        <span className="text-slate-500 text-sm tabular-nums">
          {val ? format(new Date(val), 'MMM d, yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-0.5">
          <Link
            to={`/leads/${row.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cta hover:bg-blue-50 transition-colors duration-150"
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
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
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-500/10">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Leads</p>
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
                <p className="text-lg font-bold text-primary tabular-nums">{leads.length}</p>
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
              placeholder="Search by name..."
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

          {/* Source */}
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
          >
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Rating */}
          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
          >
            {RATING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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
              Clear filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Table or empty state */}
      <motion.div variants={itemVariants}>
        {!isLoading && leads.length === 0 && !hasFilters ? (
          <div className="bg-white rounded-2xl shadow-card py-16">
            <EmptyState
              icon={UserPlus}
              title="No leads yet"
              description="Add your first lead to get started tracking your pipeline"
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus size={16} />
                  Add Lead
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={leads}
              loading={isLoading}
              emptyMessage="No leads match your filters"
            />

            <div className="mt-4 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </motion.div>

      {/* Create Lead Modal */}
      {createOpen && (
        <CreateLeadModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteTarget?.firstName ?? 'this lead'}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLead.isPending}
      />
    </motion.div>
  );
}
