import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Target, FileText, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { getDashboard } from '@/api/dashboardApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { TemperatureBadge } from '@/components/shared/TemperatureBadge';

const statCards = [
  {
    key: 'totalLeads',
    label: 'Total Leads',
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    key: 'openOpportunities',
    label: 'Open Opportunities',
    icon: Target,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    key: 'pendingDrafts',
    label: 'Pending AI Drafts',
    icon: FileText,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    key: 'chasesDueToday',
    label: 'Chases Due Today',
    icon: Clock,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
];

const CHANNEL_VARIANT = {
  EMAIL: 'info',
  SMS: 'success',
  WHATSAPP: 'success',
};

const chaseColumns = [
  {
    key: 'leadName',
    label: 'Lead Name',
  },
  {
    key: 'service',
    label: 'Service',
  },
  {
    key: 'temperature',
    label: 'Temperature',
    render: (value) => <TemperatureBadge temperature={value} />,
  },
  {
    key: 'stage',
    label: 'Stage',
  },
  {
    key: 'nextChaseDate',
    label: 'Next Chase Date',
    render: (value) => (value ? format(new Date(value), 'MMM d, yyyy') : '-'),
  },
  {
    key: 'action',
    label: 'Action',
    render: (_value, row) => (
      <Link to={`/opportunities/${row.opportunityId}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
  },
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const dashboard = data || {};

  return (
    <>
      <PageHeader title="Dashboard" />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl p-5 shadow-card"
            >
              <div
                className={clsx(
                  'w-12 h-12 flex items-center justify-center rounded-full mb-3',
                  card.iconBg
                )}
              >
                <Icon size={24} className={card.iconColor} />
              </div>
              <p className="text-3xl font-bold text-primary">
                {dashboard[card.key] ?? 0}
              </p>
              <p className="text-sm text-secondary">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chases due today */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Chases Due Today</h2>
        <Table
          columns={chaseColumns}
          data={dashboard.chasesdue || []}
          emptyMessage="No chases due today"
        />
      </section>

      {/* Recent activity */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        {(!dashboard.recentActivities ||
          dashboard.recentActivities.length === 0) ? (
          <div className="bg-white rounded-lg p-6 shadow-card text-center text-sm text-secondary">
            No recent activity
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dashboard.recentActivities.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg p-4 shadow-card flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-medium text-primary truncate">
                    {activity.leadName}
                  </span>
                  <span className="text-sm text-secondary whitespace-nowrap">
                    {activity.type}
                  </span>
                  {activity.channel && (
                    <Badge variant={CHANNEL_VARIANT[activity.channel] || 'default'}>
                      {activity.channel}
                    </Badge>
                  )}
                  {activity.ai_generated && (
                    <Badge variant="warning">AI</Badge>
                  )}
                </div>
                <span className="text-xs text-secondary whitespace-nowrap">
                  {activity.createdAt
                    ? formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })
                    : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
