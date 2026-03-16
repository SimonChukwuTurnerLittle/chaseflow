import { Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export function TopBar({ title }) {
  const user = useAuthStore((s) => s.user);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-primary">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell size={20} className="text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cta rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-cta text-white flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
      </div>
    </header>
  );
}
