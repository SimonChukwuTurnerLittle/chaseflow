import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isPast, isToday } from 'date-fns';
import clsx from 'clsx';
import {
  ArrowLeft,
  Target,
  User,
  Briefcase,
  Calendar,
  ChevronRight,
  Flame,
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  AlertCircle,
  Activity,
  Tag,
  Zap,
  GitBranch,
  StickyNote,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';

import {
  useOpportunity,
  useCompleteOpportunity,
  useDeleteOpportunity,
} from '@/hooks/useOpportunities';
import * as activitiesApi from '@/api/activitiesApi';

// ─── Temperature accent colours ─────────────────────────────────────────────
const TEMP_ACCENT = {
  HOT:     { bar: 'bg-red-500',   ring: 'ring-red-200',   icon: 'text-red-500' },
  MEDIUM:  { bar: 'bg-amber-500', ring: 'ring-amber-200', icon: 'text-amber-500' },
  COLD:    { bar: 'bg-blue-500',  ring: 'ring-blue-200',  icon: 'text-blue-500' },
  DORMANT: { bar: 'bg-slate-400', ring: 'ring-slate-200', icon: 'text-slate-400' },
};

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = 'text-cta', sub }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card px-5 py-4 flex items-start gap-4">
      <div className={clsx('p-2.5 rounded-lg bg-slate-50 shrink-0', accent)}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-base font-semibold text-primary truncate">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Info row inside a detail card ──────────────────────────────────────────
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-sm text-primary font-medium">{value}</span>
    </div>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────
function Card({ title, icon: Icon, children, className }) {
  return (
    <div className={clsx('bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden', className)}>
      {title && (
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          {Icon && <Icon size={15} className="text-slate-400" />}
          <h2 className="text-sm font-semibold text-primary tracking-wide">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Date chip with urgency colouring ────────────────────────────────────────
function DateChip({ date, label }) {
  if (!date) return <span className="text-sm text-slate-400">—</span>;
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d);
  const due = isToday(d);
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-sm font-medium',
        overdue && 'text-red-600',
        due && 'text-amber-600',
        !overdue && !due && 'text-primary',
      )}
    >
      {overdue && <AlertCircle size={13} />}
      {due && <Clock size={13} />}
      {format(d, 'MMM d, yyyy')}
      {overdue && <span className="text-xs font-normal">(overdue)</span>}
      {due && <span className="text-xs font-normal">(today)</span>}
    </span>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: opp, isLoading } = useOpportunity(id);
  const completeMutation = useCompleteOpportunity();
  const deleteMutation = useDeleteOpportunity();

  const { data: activitiesData } = useQuery({
    queryKey: ['opportunities', id, 'activities'],
    queryFn: () => activitiesApi.getActivities(id).then((r) => r.data),
    enabled: !!id,
  });

  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activities = Array.isArray(activitiesData) ? activitiesData : [];
  const accent = TEMP_ACCENT[opp?.temperature] ?? TEMP_ACCENT.DORMANT;
  const isCompleted = opp?.status === 'COMPLETED';

  async function handleComplete() {
    await completeMutation.mutateAsync(id);
    setConfirmComplete(false);
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(id);
    setConfirmDelete(false);
    navigate('/opportunities');
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Target size={36} className="text-slate-300" />
        <p className="text-slate-500 text-sm">Opportunity not found.</p>
        <Button variant="secondary" onClick={() => navigate('/opportunities')}>
          Back to Opportunities
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ── Page ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto pb-12">

        {/* ── Top accent bar (temperature colour) ──────────────────────── */}
        <div className={clsx('h-1 rounded-t-lg mb-0', accent.bar)} />

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6 pt-5">
          {/* Left: back + title */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors duration-150 shrink-0 cursor-pointer mt-0.5"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-primary leading-tight">
                {opp.serviceName
                  ? `${opp.serviceName} · ${opp.leadName}`
                  : opp.leadName}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <TemperatureBadge temperature={opp.temperature} />
                <StatusBadge status={opp.status} />
                {opp.stage && (
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600">
                    {opp.stage}
                  </span>
                )}
                {opp.opportunityType && (
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600">
                    {opp.opportunityType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {!isCompleted && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmComplete(true)}
                loading={completeMutation.isPending}
              >
                <CheckCircle2 size={15} />
                Mark Complete
              </Button>
            )}
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all duration-150 cursor-pointer"
              aria-label="Delete opportunity"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* ── Stat strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={Layers}
            label="Current Step"
            value={opp.currentStep != null ? `Step ${opp.currentStep}` : '—'}
            accent={clsx('p-2.5 rounded-lg bg-slate-50', accent.icon)}
          />
          <StatCard
            icon={GitBranch}
            label="Stage"
            value={opp.stage || '—'}
            accent="text-violet-500"
          />
          <StatCard
            icon={Calendar}
            label="Next Chase"
            value={
              opp.nextChaseDate
                ? format(new Date(opp.nextChaseDate), 'MMM d, yyyy')
                : '—'
            }
            accent={
              opp.nextChaseDate && isPast(new Date(opp.nextChaseDate)) && !isToday(new Date(opp.nextChaseDate))
                ? 'text-red-500'
                : 'text-cta'
            }
            sub={
              opp.nextChaseDate && isToday(new Date(opp.nextChaseDate))
                ? 'Due today'
                : opp.nextChaseDate && isPast(new Date(opp.nextChaseDate)) && !isToday(new Date(opp.nextChaseDate))
                ? 'Overdue'
                : undefined
            }
          />
          <StatCard
            icon={Activity}
            label="Activities"
            value={activities.length}
            accent="text-green-500"
          />
        </div>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Chase Details */}
            <Card title="Chase Details" icon={Zap}>
              <div className="divide-y divide-slate-100">
                <DetailRow label="Stage"           value={opp.stage} />
                <DetailRow label="Opportunity Type" value={opp.opportunityType} />
                <DetailRow label="Category"        value={opp.category} />
                <DetailRow label="Chase Technique" value={opp.chaseTechnique} />
                <DetailRow label="Chase Method"    value={opp.chaseMethod} />
                <DetailRow label="Current Step"    value={opp.currentStep != null ? `Step ${opp.currentStep}` : null} />
                <DetailRow label="Temperature"     value={opp.temperature} />
                <DetailRow label="Status"          value={opp.status} />
              </div>
            </Card>

            {/* Notes */}
            {opp.notes && (
              <Card title="Notes" icon={StickyNote}>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {opp.notes}
                </p>
              </Card>
            )}

            {/* Activity history */}
            <Card title="Activity History" icon={MessageSquare}>
              {activities.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-center">
                  <Activity size={28} className="text-slate-200" />
                  <p className="text-sm text-slate-400">No activity recorded yet.</p>
                  <p className="text-xs text-slate-300">Chase activity will appear here once messages are sent.</p>
                </div>
              ) : (
                <ActivityTimeline activities={activities} />
              )}
            </Card>
          </div>

          {/* Right column (1/3) */}
          <div className="flex flex-col gap-5">

            {/* Lead card */}
            <Card title="Lead" icon={User}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cta/20 to-cta/5 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-cta">
                    {opp.leadName?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">{opp.leadName}</p>
                  <p className="text-xs text-slate-400">Lead</p>
                </div>
              </div>
              <Link
                to={`/leads/${opp.leadId}`}
                className="flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:border-cta hover:text-cta hover:bg-blue-50/50 transition-all duration-150 cursor-pointer"
              >
                View Lead Profile
                <ChevronRight size={12} />
              </Link>
            </Card>

            {/* Service card */}
            {opp.serviceName && (
              <Card title="Service" icon={Briefcase}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Briefcase size={15} className="text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{opp.serviceName}</p>
                    <p className="text-xs text-slate-400">Linked service</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline card */}
            <Card title="Timeline" icon={Clock}>
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />

                <TimelineEvent
                  label="Created"
                  date={opp.dateAdded}
                  color="bg-cta"
                />
                <TimelineEvent
                  label="Stage updated"
                  date={opp.stageDate}
                  color="bg-violet-500"
                />
                <TimelineEvent
                  label="Next chase"
                  date={opp.nextChaseDate}
                  color={
                    opp.nextChaseDate && isPast(new Date(opp.nextChaseDate)) && !isToday(new Date(opp.nextChaseDate))
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }
                  isDate
                />
                <TimelineEvent
                  label="Completed"
                  date={opp.dateCompleted}
                  color="bg-green-500"
                  last
                />
              </div>
            </Card>

            {/* Temperature context */}
            <div
              className={clsx(
                'rounded-xl border p-4 flex items-start gap-3',
                opp.temperature === 'HOT'     && 'bg-red-50 border-red-200',
                opp.temperature === 'MEDIUM'  && 'bg-amber-50 border-amber-200',
                opp.temperature === 'COLD'    && 'bg-blue-50 border-blue-200',
                opp.temperature === 'DORMANT' && 'bg-slate-50 border-slate-200',
              )}
            >
              <Flame
                size={16}
                className={clsx('mt-0.5 shrink-0', accent.icon)}
              />
              <div>
                <p className={clsx('text-xs font-semibold mb-0.5', accent.icon)}>
                  {opp.temperature} Lead
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {opp.temperature === 'HOT'     && 'Chase aggressively — high intent, short gaps.'}
                  {opp.temperature === 'MEDIUM'  && 'Balanced follow-up — moderate interest.'}
                  {opp.temperature === 'COLD'    && 'Longer gaps — lower priority outreach.'}
                  {opp.temperature === 'DORMANT' && 'Minimal chasing — low activity expected.'}
                </p>
              </div>
            </div>

            {/* Tags / metadata */}
            {(opp.category || opp.opportunityType) && (
              <Card title="Tags" icon={Tag}>
                <div className="flex flex-wrap gap-2">
                  {opp.category && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {opp.category}
                    </span>
                  )}
                  {opp.opportunityType && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                      {opp.opportunityType}
                    </span>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={handleComplete}
        title="Mark as Completed"
        message="This will mark the opportunity as completed and stop the chase sequence. Are you sure?"
        confirmText="Mark Complete"
        loading={completeMutation.isPending}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Delete the opportunity for ${opp.leadName}? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Timeline event helper ────────────────────────────────────────────────────
function TimelineEvent({ label, date, color, last, isDate }) {
  return (
    <div className={clsx('relative flex items-start gap-3', !last && 'mb-4')}>
      <div className={clsx('w-3.5 h-3.5 rounded-full border-2 border-white shrink-0 mt-0.5 -ml-[7px] z-10', color, !date && 'opacity-30')} />
      <div className="min-w-0 -mt-0.5">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {date ? (
          isDate
            ? <DateChip date={date} />
            : <p className="text-xs text-primary font-semibold">
                {format(new Date(date), 'MMM d, yyyy')}
              </p>
        ) : (
          <p className="text-xs text-slate-300">—</p>
        )}
      </div>
    </div>
  );
}
