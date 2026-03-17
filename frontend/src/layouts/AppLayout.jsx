import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';

export function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="ml-60 pt-16 flex-1 min-h-screen p-6 bg-surface">
        {children}
      </main>
    </div>
  );
}
