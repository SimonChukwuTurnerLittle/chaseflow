import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, FileText, X } from 'lucide-react';
import { clsx } from 'clsx';

import { PageHeader } from '@/components/shared/PageHeader';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { useDrafts, useApproveDraft, useRejectDraft } from '@/hooks/useDrafts';
import { DraftDrawer } from './DraftDrawer';

const STATUS_TABS = [
  { key: 'PENDING', label: 'Pending', color: 'bg-amber-500', activeBg: 'bg-amber-100 text-amber-700', hoverBg: 'hover:bg-amber-50' },
  { key: 'APPROVED', label: 'Approved', color: 'bg-green-500', activeBg: 'bg-green-100 text-green-700', hoverBg: 'hover:bg-green-50' },
  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-500', activeBg: 'bg-red-100 text-red-700', hoverBg: 'hover:bg-red-50' },
  { key: 'SENT', label: 'Sent', color: 'bg-gray-500', activeBg: 'bg-gray-100 text-gray-700', hoverBg: 'hover:bg-gray-50' },
];

const CHANNEL_BADGE = {
  EMAIL: { variant: 'info', label: 'Email' },
  SMS: { variant: 'success', label: 'SMS' },
  WHATSAPP: { variant: 'default', label: 'WhatsApp', className: 'bg-purple-100 text-purple-700' },
};

const EMPTY_MESSAGES = {
  PENDING: 'No drafts waiting for approval',
  APPROVED: 'No approved drafts',
  REJECTED: 'No rejected drafts',
  SENT: 'No sent drafts',
};

export default function DraftsPage() {
  // Filter state
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [channel, setChannel] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [search, setSearch] = useState('');

  // Drawer & confirm state
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', draftId }

  const params = {
    page,
    status: statusTab,
    ...(search && { search }),
    ...(channel && { channel }),
    ...(serviceFilter && { service: serviceFilter }),
  };

  const { data, isLoading } = useDrafts(params);
  const approveMutation = useApproveDraft();
  const rejectMutation = useRejectDraft();

  const drafts = data?.data?.drafts ?? data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const pendingCount = data?.data?.pendingCount ?? drafts.length;

  const handleTabChange = useCallback((tab) => {
    setStatusTab(tab);
    setPage(1);
  }, []);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'approve') {
        await approveMutation.mutateAsync(confirmAction.draftId);
      } else {
        await rejectMutation.mutateAsync(confirmAction.draftId);
      }
      setConfirmAction(null);
    } catch {
      // Error handled by mutation hook
    }
  };

  const getChannelBadge = (channelType) => {
    const config = CHANNEL_BADGE[channelType];
    if (!config) return null;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <>
      <PageHeader title="AI Draft Queue">
        <Badge variant="warning" className="text-sm px-3 py-1">
          {pendingCount} pending
        </Badge>
      </PageHeader>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50',
              statusTab === tab.key
                ? tab.activeBg
                : 'bg-white border border-slate-200 text-slate-600 ' + tab.hoverBg
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl p-4 shadow-card mb-4">
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

          {/* Channel */}
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            <option value="">All Channels</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>

          {/* Service */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
          >
            <option value="">All Services</option>
            {/* Services will be loaded dynamically when API is ready */}
          </select>

          {/* Clear */}
          {(search || channel || serviceFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setChannel('');
                setServiceFilter('');
                setPage(1);
              }}
            >
              <X size={14} />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Draft cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={EMPTY_MESSAGES[statusTab]}
          description={
            statusTab === 'PENDING'
              ? 'When the AI generates new chase drafts, they will appear here for review.'
              : undefined
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-xl p-5 shadow-card flex justify-between items-start gap-4"
              >
                {/* Left side */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: Lead name + service */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-primary truncate">
                      {draft.leadName || draft.lead?.name || 'Unknown Lead'}
                    </span>
                    <span className="text-sm text-secondary truncate">
                      {draft.serviceName || draft.service?.name || ''}
                    </span>
                  </div>

                  {/* Row 2: Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {draft.temperature && (
                      <TemperatureBadge temperature={draft.temperature} />
                    )}
                    {draft.channel && getChannelBadge(draft.channel)}
                    {(draft.templateType && !draft.channel) &&
                      getChannelBadge(draft.templateType)}
                  </div>

                  {/* Subject / preview */}
                  {(draft.templateType === 'EMAIL' || draft.channel === 'EMAIL') &&
                    draft.subject && (
                      <p className="text-sm text-secondary mt-1 truncate">
                        Subject: {draft.subject}
                      </p>
                    )}
                  {draft.content && (
                    <p className="text-sm text-secondary mt-1 line-clamp-2">
                      {draft.content.replace(/<[^>]*>/g, '').slice(0, 100)}
                      {draft.content.replace(/<[^>]*>/g, '').length > 100
                        ? '...'
                        : ''}
                    </p>
                  )}

                  {/* AI generated badge */}
                  {draft.aiGenerated && (
                    <Badge variant="warning" className="mt-2">
                      AI Generated
                    </Badge>
                  )}

                  {/* Timestamp */}
                  {draft.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(draft.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>

                {/* Right side: Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedDraftId(draft.id)}
                  >
                    Review &amp; Edit
                  </Button>
                  {statusTab === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: 'approve',
                            draftId: draft.id,
                          })
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: 'reject',
                            draftId: draft.id,
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

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

      {/* Draft Drawer */}
      <DraftDrawer
        open={!!selectedDraftId}
        onClose={() => setSelectedDraftId(null)}
        draftId={selectedDraftId}
      />

      {/* Confirm Dialog for approve/reject */}
      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={
          confirmAction?.type === 'approve'
            ? 'Approve Draft'
            : 'Reject Draft'
        }
        message={
          confirmAction?.type === 'approve'
            ? 'Are you sure you want to approve and send this draft?'
            : 'Are you sure you want to reject this draft?'
        }
        confirmText={
          confirmAction?.type === 'approve' ? 'Approve' : 'Reject'
        }
        variant={
          confirmAction?.type === 'approve' ? 'primary' : 'destructive'
        }
        loading={approveMutation.isPending || rejectMutation.isPending}
      />
    </>
  );
}
