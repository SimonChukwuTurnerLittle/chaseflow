import { Bell, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';

const SECTIONS = {
  dashboard:    { label: 'Dashboard',    path: '/dashboard' },
  leads:        { label: 'Leads',        path: '/leads' },
  opportunities:{ label: 'Opportunities',path: '/opportunities' },
  drafts:       { label: 'AI Drafts',    path: '/drafts' },
  services:     { label: 'Services',     path: '/services' },
  settings:     { label: 'Settings',     path: '/settings' },
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return [];

  const section = SECTIONS[segments[0]];
  if (!section) return [];

  // Top-level page
  if (segments.length === 1) {
    return [{ label: section.label, path: null }];
  }

  // Detail page — try to resolve entity name from cache
  const id = segments[1];
  let detailLabel = null;

  if (segments[0] === 'leads') {
    const cached = queryClient.getQueryData(['leads', id]);
    const lead = cached?.data ?? cached;
    detailLabel = lead?.name || `Lead #${id.slice(0, 8)}`;
  } else if (segments[0] === 'opportunities') {
    const cached = queryClient.getQueryData(['opportunities', id]);
    const opp = cached?.data ?? cached;
    detailLabel = opp?.leadName || opp?.lead?.name || `Opportunity #${id.slice(0, 8)}`;
  } else {
    detailLabel = id.slice(0, 8);
  }

  return [
    { label: section.label, path: section.path },
    { label: detailLabel, path: null },
  ];
}

export function TopBar() {
  const user = useAuthStore((s) => s.user);
  const crumbs = useBreadcrumbs();

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              )}
              {crumb.path && !isLast ? (
                <Link
                  to={crumb.path}
                  className="text-sm font-medium text-slate-500 hover:text-cta transition-colors cursor-pointer"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast && crumbs.length > 1
                      ? 'text-sm font-semibold text-primary'
                      : 'text-lg font-semibold text-primary'
                  }
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cta rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-cta text-white flex items-center justify-center text-sm font-semibold select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
