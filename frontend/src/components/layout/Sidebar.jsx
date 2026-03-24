import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  Users,
  Target,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { SidebarLink } from './SidebarLink';
import { RoleBadge } from '../shared/RoleBadge';

export function Sidebar() {
  const { user, logout, isHandler } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mobileSidebarOpen, closeMobileSidebar } = useUiStore();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      {/* Logo & tenant */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-cta" />
            <span className="text-lg font-bold tracking-tight">Chaseflow</span>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-white/50 mt-1 pl-[30px]">
          {user?.tenantName || 'Workspace'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/leads" icon={Users} label="Leads" />
        <SidebarLink to="/opportunities" icon={Target} label="Opportunities" />
        <SidebarLink to="/drafts" icon={FileText} label="AI Drafts" />

        <hr className="border-white/10 my-3 mx-2" />

        {isHandler() && (
          <SidebarLink to="/services" icon={Briefcase} label="Services" />
        )}
        <SidebarLink to="/settings" icon={Settings} label="Settings" />
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium truncate">
            {user?.name || 'User'}
          </span>
          {user?.role && <RoleBadge role={user.role} />}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar - always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-60 h-screen bg-primary text-white flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar - overlay drawer */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileSidebar}
          />
          {/* Panel */}
          <aside
            className={clsx(
              'relative w-72 max-w-[85vw] h-full bg-primary text-white flex flex-col',
              'animate-slide-in-left'
            )}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
