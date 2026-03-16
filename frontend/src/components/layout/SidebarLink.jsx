import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export function SidebarLink({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'text-white bg-white/10'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        )
      }
    >
      <Icon size={20} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-cta text-white text-xs rounded-full px-2 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
