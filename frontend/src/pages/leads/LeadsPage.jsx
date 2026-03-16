import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, Pencil, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
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
  { value: 'HOT', label: 'Hot' },
  { value: 'WARM', label: 'Warm' },
  { value: 'COLD', label: 'Cold' },
];

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [source, setSource] = useState('');
  const [rating, setRating] = useState('');
  const [handler, setHandler] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const deleteLead = useDeleteLead();

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(
    () => ({
      page,
      search: debouncedSearch || undefined,
      source: source || undefined,
      rating: rating || undefined,
      handler: handler || undefined,
    }),
    [page, debouncedSearch, source, rating, handler]
  );

  const { data, isLoading } = useLeads(params);

  const leads = data?.data ?? data?.leads ?? [];
  const totalPages = data?.totalPages ?? 1;

  const hasFilters = search || source || rating || handler;

  function clearFilters() {
    setSearch('');
    setSource('');
    setRating('');
    setHandler('');
    setPage(1);
  }

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
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'source',
      label: 'Source',
      render: (val) => val || '—',
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (val) => (val ? <TemperatureBadge temperature={val} /> : '—'),
    },
    {
      key: 'handler',
      label: 'Handler',
      render: (val) => val || '—',
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      render: (val) =>
        val ? format(new Date(val), 'MMM d, yyyy') : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/leads/${row.id}`}
            className="p-1.5 rounded-md text-slate-400 hover:text-cta hover:bg-slate-100 transition-colors duration-200"
          >
            <Pencil size={16} />
          </Link>
          <button
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Leads">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Add Lead
        </Button>
      </PageHeader>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className={clsx(
                'w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none',
                'transition-all duration-200',
                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'placeholder:text-slate-400'
              )}
            />
          </div>

          <Select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
            placeholder="All sources"
            options={SOURCE_OPTIONS}
          />

          <Select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            placeholder="All ratings"
            options={RATING_OPTIONS}
          />

          <input
            type="text"
            value={handler}
            onChange={(e) => {
              setHandler(e.target.value);
              setPage(1);
            }}
            placeholder="All handlers"
            className={clsx(
              'px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none',
              'transition-all duration-200',
              'focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'placeholder:text-slate-400'
            )}
          />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table or empty state */}
      {!isLoading && leads.length === 0 && !hasFilters ? (
        <EmptyState
          icon={UserPlus}
          title="No leads yet"
          description="Add your first lead to get started"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} />
              Add Lead
            </Button>
          }
        />
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
    </>
  );
}
