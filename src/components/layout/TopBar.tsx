import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Command,
  HelpCircle,
  LogOut,
  Menu,
  RotateCcw,
  Search,
  UserRound,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  demoApi,
  notificationApi,
  searchApi,
  type NotificationItem,
  type SearchResults,
} from '@/api/client';
import { cn } from '@/lib/cn';
import { formatDate, statusLabel } from '@/lib/format';

const EMPTY_RESULTS: SearchResults = { companies: [], workplaces: [], audits: [], actions: [] };

const SEGMENT_LABELS: Record<string, string> = {
  companies: 'Companies',
  audits: 'Audits',
  actions: 'Corrective actions',
  reports: 'Reports',
  team: 'Team',
  profile: 'Profile',
  new: 'New audit',
  findings: 'Findings',
  review: 'Review',
  report: 'Report',
};

export function TopBar({ onMenu, onHelp }: { onMenu: () => void; onHelp: () => void }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menu, setMenu] = useState<'org' | 'notify' | 'profile' | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenu(null), []);
  useClickOutside(orgRef, closeMenu, menu === 'org');
  useClickOutside(notifyRef, closeMenu, menu === 'notify');
  useClickOutside(profileRef, closeMenu, menu === 'profile');
  useClickOutside(searchRef, () => setSearchFocused(false), searchFocused);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(EMPTY_RESULTS);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchApi
        .query(trimmed)
        .then((data) => {
          if (!cancelled) setResults(data);
        })
        .catch(() => {
          if (!cancelled) setResults(EMPTY_RESULTS);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (menu !== 'notify' || notifications.length) return;
    setNotificationsLoading(true);
    notificationApi
      .list()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, [menu, notifications.length]);

  const crumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (!segments.length) return [] as Array<{ label: string; href: string }>;
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label =
        SEGMENT_LABELS[segment] ??
        (/^[a-z]+-\d+$/.test(segment) ? 'Detail' : decodeURIComponent(segment));
      return { label, href };
    });
  }, [location.pathname]);

  const totalResults =
    results.companies.length + results.workplaces.length + results.audits.length + results.actions.length;

  const go = (path: string) => {
    setSearchFocused(false);
    setQuery('');
    navigate(path);
  };

  const resetDemo = async () => {
    try {
      await demoApi.reset();
      toast('Demo data restored. Reloading…', 'info');
      window.setTimeout(() => window.location.assign('/'), 700);
    } catch {
      toast('Could not reset demo data.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <button
          onClick={onMenu}
          className="rounded-button p-2 text-brand-ink/60 transition hover:bg-brand-light hover:text-brand-ink lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-xs font-medium text-brand-ink/45 xl:flex">
          <Link to="/" className="transition hover:text-brand-primary">
            Workspace
          </Link>
          {crumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex min-w-0 items-center gap-2">
              <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
              {index === crumbs.length - 1 ? (
                <span className="truncate font-semibold text-brand-ink/80">{crumb.label}</span>
              ) : (
                <Link to={crumb.href} className="truncate transition hover:text-brand-primary">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          <div ref={searchRef} className="relative w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setQuery('');
                    setSearchFocused(false);
                    inputRef.current?.blur();
                  }
                }}
                placeholder="Search audits, companies…"
                className="h-9 w-full rounded-full border border-brand-border bg-brand-light/60 pl-9 pr-14 text-sm text-brand-ink placeholder:text-brand-ink/40 transition focus:border-brand-primary/40 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 sm:h-10"
                aria-label="Search"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-brand-border bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand-ink/40 sm:flex">
                <Command className="h-2.5 w-2.5" />K
              </span>
            </div>

            {searchFocused && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-brand-border bg-white shadow-xl animate-pop">
                {query.trim().length < 2 ? (
                  <p className="px-4 py-3 text-xs text-brand-ink/50">
                    Type at least 2 characters to search. Try “Apex”, “depot” or “guards”.
                  </p>
                ) : searching ? (
                  <p className="px-4 py-3 text-xs text-brand-ink/50">Searching…</p>
                ) : totalResults === 0 ? (
                  <p className="px-4 py-3 text-xs text-brand-ink/50">No matches for “{query}”.</p>
                ) : (
                  <div className="max-h-[60vh] overflow-y-auto py-1">
                    <SearchGroup label="Companies" count={results.companies.length}>
                      {results.companies.map((company) => (
                        <SearchRow
                          key={company.id}
                          icon={<Building2 className="h-4 w-4" />}
                          title={company.name}
                          subtitle={company.industry}
                          onClick={() => go(`/companies/${company.id}/workplaces`)}
                        />
                      ))}
                    </SearchGroup>
                    <SearchGroup label="Workplaces" count={results.workplaces.length}>
                      {results.workplaces.map((workplace) => (
                        <SearchRow
                          key={workplace.id}
                          icon={<Building2 className="h-4 w-4" />}
                          title={workplace.name}
                          subtitle={workplace.location}
                          onClick={() => go(`/companies/${workplace.companyId}/workplaces`)}
                        />
                      ))}
                    </SearchGroup>
                    <SearchGroup label="Audits" count={results.audits.length}>
                      {results.audits.map((audit) => (
                        <SearchRow
                          key={audit.id}
                          icon={<ClipboardList className="h-4 w-4" />}
                          title={audit.title}
                          subtitle={statusLabel(audit.status)}
                          onClick={() => go(`/audits/${audit.id}`)}
                        />
                      ))}
                    </SearchGroup>
                    <SearchGroup label="Corrective actions" count={results.actions.length}>
                      {results.actions.map((action) => (
                        <SearchRow
                          key={action.id}
                          icon={<AlertTriangle className="h-4 w-4" />}
                          title={action.title}
                          subtitle={`Due ${formatDate(action.deadline)}`}
                          onClick={() => go('/actions')}
                        />
                      ))}
                    </SearchGroup>
                  </div>
                )}
              </div>
            )}
          </div>

          <div ref={orgRef} className="relative hidden md:block">
            <button
              onClick={() => setMenu(menu === 'org' ? null : 'org')}
              className="flex h-9 items-center gap-2 rounded-full border border-brand-border bg-white px-3 text-xs font-semibold text-brand-ink transition hover:border-brand-primary/30 hover:bg-brand-light"
              aria-haspopup="menu"
              aria-expanded={menu === 'org'}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary/10 text-[10px] font-bold text-brand-primary">
                G
              </span>
              <span className="max-w-[110px] truncate">Greenfield</span>
              <ChevronDown className="h-3 w-3 text-brand-ink/40" />
            </button>
            {menu === 'org' && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-card border border-brand-border bg-white shadow-xl animate-pop">
                <div className="border-b border-brand-border px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-ink/45">
                    Organizations
                  </p>
                </div>
                <button className="flex w-full items-start gap-3 bg-brand-light/50 px-4 py-3 text-left transition hover:bg-brand-light">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                    G
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-brand-ink">
                      Greenfield Workplace Solutions
                    </span>
                    <span className="block text-xs text-brand-ink/50">Demo tenant · 3 clients</span>
                  </span>
                  <Check className="h-4 w-4 text-brand-primary" />
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    toast('Riverside is reserved for tenant-isolation testing.', 'info');
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-brand-light"
                >
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-brand-border text-xs font-bold text-brand-ink/60">
                    R
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-brand-ink">
                      Riverside Safety Partners
                    </span>
                    <span className="block text-xs text-brand-ink/50">Isolation test tenant</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          <div ref={notifyRef} className="relative">
            <button
              onClick={() => setMenu(menu === 'notify' ? null : 'notify')}
              className="relative rounded-full p-2 text-brand-ink/60 transition hover:bg-brand-light hover:text-brand-ink"
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={menu === 'notify'}
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            {menu === 'notify' && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-card border border-brand-border bg-white shadow-xl animate-pop">
                <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
                  <p className="text-sm font-semibold text-brand-ink">Notifications</p>
                  <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand-ink/50">
                    {notifications.length}
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationsLoading ? (
                    <p className="px-4 py-6 text-center text-xs text-brand-ink/50">Loading…</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-xs text-brand-ink/50">
                      You are all caught up.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          closeMenu();
                          navigate(item.href);
                        }}
                        className="flex w-full items-start gap-3 border-b border-brand-border/60 px-4 py-3 text-left transition last:border-0 hover:bg-brand-light/60"
                      >
                        <span
                          className={cn(
                            'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                            item.tone === 'danger'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-600',
                          )}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-brand-ink">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-brand-ink/55">{item.body}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onHelp}
            className="rounded-full p-2 text-brand-ink/60 transition hover:bg-brand-light hover:text-brand-ink"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setMenu(menu === 'profile' ? null : 'profile')}
              className="flex items-center gap-2 rounded-full border border-brand-border bg-white p-1 pr-2 transition hover:border-brand-primary/30 hover:bg-brand-light"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menu === 'profile'}
            >
              <Avatar name={user?.name ?? 'User'} size="sm" className="ring-0" />
              <ChevronDown className="hidden h-3 w-3 text-brand-ink/40 sm:block" />
            </button>
            {menu === 'profile' && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-card border border-brand-border bg-white shadow-xl animate-pop">
                <div className="border-b border-brand-border px-4 py-3">
                  <p className="text-sm font-semibold text-brand-ink">{user?.name}</p>
                  <p className="truncate text-xs text-brand-ink/50">{user?.email}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                    {user ? statusLabel(user.role) : 'Guest'}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-ink transition hover:bg-brand-light"
                >
                  <UserRound className="h-4 w-4 text-brand-ink/50" /> My profile
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    void resetDemo();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brand-ink transition hover:bg-brand-light"
                >
                  <RotateCcw className="h-4 w-4 text-brand-ink/50" /> Reset demo data
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 border-t border-brand-border px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}

function SearchGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  if (!count) return null;
  return (
    <div className="py-1">
      <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-ink/40">
        {label}
      </p>
      {children}
    </div>
  );
}

function SearchRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-brand-light"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-button bg-brand-light text-brand-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-brand-ink">{title}</span>
        <span className="block truncate text-xs text-brand-ink/50">{subtitle}</span>
      </span>
    </button>
  );
}
