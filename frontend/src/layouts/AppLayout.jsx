import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { PageHeaderProvider } from '../contexts/PageHeaderContext';

export function AppLayout({ children }) {
  return (
    <PageHeaderProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <TopBar />
        <main className="ml-60 pt-24 flex-1 min-h-screen px-6 pb-6 bg-surface">
          {children}
        </main>
      </div>
    </PageHeaderProvider>
  );
}
