import { Bell, ChevronRight, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { usePageHeader } from '../../contexts/PageHeaderContext';

const SECTIONS = {
  dashboard:    { label: 'Dashboard',    path: '/dashboard' },
  leads:        { label: 'Leads',        path: '/leads' },
  opportunities:{ label: 'Opportunities',path: '/opportunities' },
  drafts:       { label: 'AI Drafts',    path: '/drafts' },
  services:     { label: 'Services',     path: '/services' },
  settings:     { label: 'Settings',     path: '/settings' },
};

function useIsDetailPage() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 1;
}

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return [];

  const section = SECTIONS[segments[0]];
  if (!section) return [];

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
  const header = usePageHeader();
  const isDetail = useIsDetailPage();
  const crumbs = useBreadcrumbs();
  const openMobileSidebar = useUiStore((s) => s.openMobileSidebar);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 h-14 lg:h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger - mobile only */}
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-slate-600" />
        </button>

        {isDetail ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && (
                    <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                  )}
                  {crumb.path && !isLast ? (
                    <Link
                      to={crumb.path}
                      className="text-sm font-medium text-slate-500 hover:text-cta transition-colors cursor-pointer hidden sm:inline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-primary truncate">
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        ) : (
          <div className="min-w-0">
            {header?.title && (
              <h1 className="text-base lg:text-lg font-bold text-primary leading-tight truncate">{header.title}</h1>
            )}
            {header?.subtitle && (
              <p className="text-xs text-secondary hidden sm:block">{header.subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {/* Page actions - hidden on mobile, shown in a compact way on tablet+ */}
        {!isDetail && header?.actions && (
          <div className="hidden sm:flex items-center gap-3">{header.actions}</div>
        )}

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cta rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-cta text-white flex items-center justify-center text-xs lg:text-sm font-semibold select-none">
          {initials}
        </div>
      </div>
    </header>
  );
}
