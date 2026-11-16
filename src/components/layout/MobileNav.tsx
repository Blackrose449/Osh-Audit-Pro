import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, Home, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export function MobileNav({ onMenu }: { onMenu: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { key: 'home', label: 'Home', href: '/', icon: Home },
    { key: 'audits', label: 'Audits', href: '/audits', icon: ClipboardList },
    { key: 'new', label: 'New', href: '/audits/new', icon: Plus, accent: true },
    { key: 'reports', label: 'Reports', href: '/reports', icon: FileText },
  ];

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          if (item.accent) {
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.href)}
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg ring-4 ring-brand-light transition hover:bg-brand-dark"
                aria-label="New audit"
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          }
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.href)}
              className={cn(
                'flex w-16 flex-col items-center gap-0.5 rounded-button py-1.5 text-[10px] font-semibold transition',
                active ? 'text-brand-primary' : 'text-brand-ink/50 hover:text-brand-ink',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
        <button
          onClick={onMenu}
          className="flex w-16 flex-col items-center gap-0.5 rounded-button py-1.5 text-[10px] font-semibold text-brand-ink/50 transition hover:text-brand-ink"
          aria-label="More navigation"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>
    </nav>
  );
}
