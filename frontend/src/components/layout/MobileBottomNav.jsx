import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, FileText, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import useUiStore from '../../store/uiStore';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/opportunities', icon: Target, label: 'Opps' },
  { to: '/drafts', icon: FileText, label: 'Drafts' },
];

export function MobileBottomNav() {
  const openMobileSidebar = useUiStore((s) => s.openMobileSidebar);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-cta'
                    : 'text-slate-400 active:text-slate-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={openMobileSidebar}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium text-slate-400 active:text-slate-600 cursor-pointer"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
