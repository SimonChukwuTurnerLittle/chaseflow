import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Mail,
  MessageSquare,
  MessageCircle,
  Sparkles,
  Eye,
} from 'lucide-react';
import { clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getDashboard } from '@/api/dashboardApi';

import { useSetPageHeader } from '@/contexts/PageHeaderContext';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';

const statCards = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    link: '/leads',
  },
  {
    key: 'openOpportunities',
    label: 'Open Opportunities',
    icon: Target,
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    link: '/opportunities',
  },
  {
    key: 'pendingDrafts',
    label: 'Pending AI Drafts',
    icon: FileText,
    gradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    link: '/drafts',
  },
  {
    key: 'chasesDueToday',
    label: 'Chases Due Today',
    icon: Clock,
    gradient: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
    link: null,
  },
];

const CHANNEL_CONFIG = {
  EMAIL: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Email' },
  SMS: { icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50', label: 'SMS' },
  WHATSAPP: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50', label: 'WhatsApp' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {value ?? 0}
    </motion.span>
  );
}

function StatCard({ card, value, index }) {
  const Icon = card.icon;
  const inner = (
    <motion.div
      variants={itemVariants}
      className={clsx(
        'relative bg-white rounded-2xl p-5 shadow-card overflow-hidden group',
        card.link && 'cursor-pointer hover:shadow-card-hover'
      )}
      style={{ transition: 'box-shadow 200ms ease' }}
    >
      {/* Gradient accent bar */}
      <div
        className={clsx(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
          card.gradient
        )}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
          <p className="text-3xl font-bold text-primary tabular-nums">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div
          className={clsx(
            'w-11 h-11 flex items-center justify-center rounded-xl transition-transform duration-200',
            card.iconBg,
            card.link && 'group-hover:scale-110'
          )}
        >
          <Icon size={22} className={card.iconColor} />
        </div>
      </div>

      {card.link && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-cta opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View all <ArrowRight size={12} />
        </div>
      )}
    </motion.div>
  );

  return card.link ? <Link to={card.link}>{inner}</Link> : inner;
}

function ChaseRow({ chase, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="group hover:bg-slate-50/80 transition-colors duration-150"
    >
      <td className="px-5 py-3.5">
        <span className="font-medium text-primary">{chase.leadName}</span>
      </td>
      <td className="px-5 py-3.5 text-slate-600">{chase.service}</td>
      <td className="px-5 py-3.5">
        <TemperatureBadge temperature={chase.temperature} />
      </td>
      <td className="px-5 py-3.5 text-slate-600">{chase.stage || '—'}</td>
      <td className="px-5 py-3.5 text-slate-500 text-sm tabular-nums">
        {chase.nextChaseDate
          ? format(new Date(chase.nextChaseDate), 'MMM d, yyyy')
          : '—'}
      </td>
      <td className="px-5 py-3.5 text-right">
        <Link to={`/opportunities/${chase.opportunityId}`}>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cta bg-cta/5 rounded-lg hover:bg-cta/10 cursor-pointer transition-colors duration-150"
          >
            <Eye size={13} />
            View
          </button>
        </Link>
      </td>
    </motion.tr>
  );
}

function ActivityItem({ activity, index }) {
  const channel = CHANNEL_CONFIG[activity.channel];
  const ChannelIcon = channel?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50/80 transition-colors duration-150 group"
    >
      {/* Channel icon */}
      {ChannelIcon ? (
        <Tooltip.Provider delayDuration={200}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div
                className={clsx(
                  'w-8 h-8 flex items-center justify-center rounded-lg shrink-0',
                  channel.bg
                )}
              >
                <ChannelIcon size={15} className={channel.color} />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="bg-primary text-white text-xs px-2.5 py-1.5 rounded-lg shadow-lg"
                sideOffset={5}
              >
                {channel.label}
                <Tooltip.Arrow className="fill-primary" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      ) : (
        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 shrink-0">
          <TrendingUp size={15} className="text-slate-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary text-sm truncate">
            {activity.leadName}
          </span>
          {activity.ai_generated && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-semibold uppercase tracking-wide">
              <Sparkles size={10} />
              AI
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{activity.type}</p>
      </div>

      {/* Timestamp */}
      <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
        {activity.createdAt
          ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
          : ''}
      </span>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-32 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-card h-[120px]">
            <div className="h-4 w-24 bg-slate-100 rounded mb-3" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-card h-[300px]" />
    </div>
  );
}

export default function DashboardPage() {
  useSetPageHeader('Dashboard', 'Overview of your sales pipeline');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((res) => res.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError && !data) {
    return <ErrorState title="Unable to load dashboard" onRetry={refetch} />;
  }

  const dashboard = data || {};
  const chases = dashboard.chasesdue || [];
  const activities = dashboard.recentActivities || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stat cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((card, i) => (
          <StatCard key={card.key} card={card} value={dashboard[card.key]} index={i} />
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chases due today — wider column */}
        <motion.section variants={itemVariants} className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-rose-500" />
                <h2 className="text-sm font-semibold text-primary">Chases Due Today</h2>
                {chases.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[11px] font-bold">
                    {chases.length}
                  </span>
                )}
              </div>
              <Link
                to="/opportunities"
                className="text-xs font-medium text-cta hover:text-cta/80 transition-colors duration-150"
              >
                View all
              </Link>
            </div>

            {chases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <Target size={20} className="text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No chases are due today.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/70">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lead</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Service</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Temp</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stage</th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due</th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {chases.map((chase, i) => (
                      <ChaseRow key={chase.opportunityId || i} chase={chase} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>

        {/* Recent activity — narrower column */}
        <motion.section variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-cta" />
                <h2 className="text-sm font-semibold text-primary">Recent Activity</h2>
              </div>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Activity will appear here as you chase.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                {activities.slice(0, 10).map((activity, i) => (
                  <ActivityItem key={activity.id || i} activity={activity} index={i} />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
