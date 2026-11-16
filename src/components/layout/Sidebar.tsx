import { NavLink, useNavigate } from 'react-router-dom';
import { LifeBuoy, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import type { User } from '@/types';
import { Avatar } from '@/components/ui';
import { navForRole } from '@/components/layout/nav';
import { cn } from '@/lib/cn';
import { statusLabel } from '@/lib/format';

export function Sidebar({
  user,
  onLogout,
  onClose,
  onHelp,
  mobile = false,
}: {
  user: User;
  onLogout: () => void;
  onClose?: () => void;
  onHelp?: () => void;
  mobile?: boolean;
}) {
  const items = navForRole(user.role);
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'flex h-full w-[255px] flex-col bg-brand-dark text-white',
        mobile ? 'relative' : 'fixed inset-y-0 left-0 z-30 hidden lg:flex',
      )}
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% -10%, rgba(38,157,128,0.35), transparent 22rem), linear-gradient(180deg, #0B493D 0%, #073029 100%)',
      }}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-tight tracking-tight">OSH Audit Pro</p>
          <p className="truncate text-[10px] uppercase tracking-[0.12em] text-white/45">
            Safety auditing
          </p>
        </div>
      </div>

      <div className="mx-3 mt-3 rounded-card border border-white/10 bg-white/[0.06] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/70">
          Workspace
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug">Greenfield Workplace Solutions</p>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
          <Sparkles className="h-3 w-3" /> Demo tenant
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          Operations
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.href}
              end={item.end}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-white/75 hover:bg-white/10 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-[18px] w-[18px]', isActive ? 'text-brand-primary' : 'opacity-80')}
                  />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
        <p className="px-2 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
          Support
        </p>
        <button
          onClick={onHelp}
          className="flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LifeBuoy className="h-[18px] w-[18px] opacity-80" />
          Help &amp; shortcuts
        </button>
        <button
          onClick={() => {
            navigate('/profile');
            onClose?.();
          }}
          className="flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <ShieldCheck className="h-[18px] w-[18px] opacity-80" />
          My profile
        </button>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-card bg-white/[0.06] p-2.5">
          <Avatar name={user.name} size="sm" className="ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
            <p className="truncate text-[11px] text-white/55">{statusLabel(user.role)}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-button p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
