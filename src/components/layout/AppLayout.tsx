import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleOrgSwitch = () => {
    // org switcher opens a menu; for MVP just navigate stay
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ name: user?.name ?? 'User', role: user?.role ?? 'viewer', avatar: user?.avatar }} onLogout={logout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onOrgSwitch={handleOrgSwitch} />
        <main className="flex-1 overflow-y-auto bg-brand-light p-4 sm:p-6">
          <Outlet context={{ navigate }} />
        </main>
      </div>
      <MobileNav user={{ name: user?.name ?? 'User', role: user?.role ?? 'viewer', avatar: user?.avatar }} onLogout={logout} />
    </div>
  );
}
