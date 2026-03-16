import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/opportunities': 'Opportunities',
  '/drafts': 'AI Drafts',
  '/services': 'Services',
  '/settings': 'Settings',
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return PAGE_TITLES[base] || 'Chaseflow';
}

export function AppLayout({ children }) {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <TopBar title={title} />
      <main className="ml-60 pt-16 flex-1 min-h-screen p-6 bg-surface">
        {children}
      </main>
    </div>
  );
}
