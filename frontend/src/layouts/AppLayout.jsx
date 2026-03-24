import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { PageHeaderProvider } from '../contexts/PageHeaderContext';

export function AppLayout({ children }) {
  return (
    <PageHeaderProvider>
      <div className="flex min-h-screen overflow-x-hidden">
        <Sidebar />
        <TopBar />
        <main className="lg:ml-60 pt-16 lg:pt-24 flex-1 min-w-0 min-h-screen px-4 lg:px-6 pb-20 lg:pb-6 bg-surface w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </PageHeaderProvider>
  );
}
