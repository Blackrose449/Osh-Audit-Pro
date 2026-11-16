import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileNav } from '@/components/layout/MobileNav';
import { HelpDialog } from '@/components/layout/HelpDialog';
import { X } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Sidebar
        user={user}
        onLogout={logout}
        onHelp={() => setHelpOpen(true)}
      />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            className="absolute inset-0 bg-brand-ink/45 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full animate-slide-in">
            <Sidebar
              user={user}
              onLogout={logout}
              onClose={() => setMobileOpen(false)}
              onHelp={() => {
                setMobileOpen(false);
                setHelpOpen(true);
              }}
              mobile
            />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute -right-12 top-3 rounded-full bg-white/90 p-2 text-brand-ink shadow"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-[255px]">
        <TopBar onMenu={() => setMobileOpen(true)} onHelp={() => setHelpOpen(true)} />
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <MobileNav onMenu={() => setMobileOpen(true)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
