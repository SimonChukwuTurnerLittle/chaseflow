import { useState, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Search, FileText, X, Sparkles, Mail, MessageSquare, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';


import { useSetPageHeader } from '@/contexts/PageHeaderContext';
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
  { key: 'PENDING', label: 'Pending', icon: '⏳', activeBg: 'bg-amber-50 text-amber-700 border-amber-200', hoverBg: 'hover:bg-amber-50/50' },
  { key: 'APPROVED', label: 'Approved', icon: '✓', activeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200', hoverBg: 'hover:bg-emerald-50/50' },
  { key: 'REJECTED', label: 'Rejected', icon: '✕', activeBg: 'bg-red-50 text-red-700 border-red-200', hoverBg: 'hover:bg-red-50/50' },
  { key: 'SENT', label: 'Sent', icon: '→', activeBg: 'bg-slate-100 text-slate-700 border-slate-200', hoverBg: 'hover:bg-slate-50' },
];

const CHANNEL_CONFIG = {
  EMAIL: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', borderColor: 'border-l-blue-500', label: 'Email' },
  SMS: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50', borderColor: 'border-l-green-500', label: 'SMS' },
  WHATSAPP: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50', borderColor: 'border-l-purple-500', label: 'WhatsApp' },
};

const EMPTY_MESSAGES = {
  PENDING: 'No drafts waiting for approval',
  APPROVED: 'No approved drafts',
  REJECTED: 'No rejected drafts',
  SENT: 'No sent drafts',
};

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

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function DraftsPage() {
  const [page, setPage] = useState(1);
  const [statusTab, setStatusTab] = useState('PENDING');
  const [channel, setChannel] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [search, setSearch] = useState('');

  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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

  const headerActions = useMemo(() => (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
      <Sparkles size={16} className="text-amber-500" />
      <span className="text-sm font-semibold text-amber-700 tabular-nums">
        {pendingCount} pending
      </span>
    </div>
  ), [pendingCount]);
  useSetPageHeader('AI Draft Queue', 'Review, approve, and manage AI-generated chase messages', headerActions);

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

  const getChannelConfig = (draft) => {
    const ch = draft.channel || draft.templateType;
    return CHANNEL_CONFIG[ch] || null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Status tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={clsx(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta/50',
              statusTab === tab.key
                ? tab.activeBg
                : 'bg-white border-slate-200 text-slate-500 ' + tab.hoverBg
            )}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Filter bar */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 shadow-card mb-5">
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

          {/* Channel */}
          <select
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
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
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cta/20 focus:border-cta bg-slate-50/50 cursor-pointer transition-all duration-200"
          >
            <option value="">All Services</option>
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
      </motion.div>

      {/* Draft cards */}
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-card flex items-center justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : drafts.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card py-16">
          <EmptyState
            icon={FileText}
            title={EMPTY_MESSAGES[statusTab]}
            description={
              statusTab === 'PENDING'
                ? 'When the AI generates new chase drafts, they will appear here for review.'
                : undefined
            }
          />
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {drafts.map((draft, i) => {
              const channelCfg = getChannelConfig(draft);
              const ChannelIcon = channelCfg?.icon;

              return (
                <motion.div
                  key={draft.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className={clsx(
                    'bg-white rounded-2xl p-5 shadow-card border-l-4 transition-all duration-200 hover:shadow-card-hover',
                    channelCfg?.borderColor || 'border-l-slate-300'
                  )}
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Left side */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Lead name + service */}
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="font-semibold text-primary text-[15px] truncate">
                          {draft.leadName || draft.lead?.name || 'Unknown Lead'}
                        </span>
                        {(draft.serviceName || draft.service?.name) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600 truncate">
                            {draft.serviceName || draft.service?.name}
                          </span>
                        )}
                      </div>

                      {/* Row 2: Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2.5">
                        {draft.temperature && (
                          <TemperatureBadge temperature={draft.temperature} />
                        )}
                        {channelCfg && ChannelIcon && (
                          <span className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                            channelCfg.bg, channelCfg.color
                          )}>
                            <ChannelIcon size={13} />
                            {channelCfg.label}
                          </span>
                        )}
                        {draft.aiGenerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[11px] font-semibold uppercase tracking-wide">
                            <Sparkles size={11} />
                            AI Generated
                          </span>
                        )}
                      </div>

                      {/* Subject / preview */}
                      {(draft.templateType === 'EMAIL' || draft.channel === 'EMAIL') &&
                        draft.subject && (
                          <p className="text-sm text-slate-600 mt-1 truncate">
                            <span className="font-medium text-slate-500">Subject:</span> {draft.subject}
                          </p>
                        )}
                      {draft.content && (
                        <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {draft.content.replace(/<[^>]*>/g, '').slice(0, 120)}
                          {draft.content.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
                        </p>
                      )}

                      {/* Timestamp */}
                      {draft.createdAt && (
                        <p className="text-[11px] text-slate-400 mt-3">
                          {formatDistanceToNow(new Date(draft.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>

                    {/* Right side: Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedDraftId(draft.id)}
                        className="text-xs"
                      >
                        Review & Edit
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
                            className="text-xs"
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
                            className="text-xs"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
    </motion.div>
  );
}
