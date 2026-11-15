import { Building2, ClipboardList, FileText, AlertCircle, User, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: Building2 },
  { key: 'companies', label: 'Companies', href: '/companies', icon: Building2 },
  { key: 'workplaces', label: 'Workplaces', href: '/companies', icon: Building2 },
  { key: 'audits', label: 'Audits', href: '/audits', icon: ClipboardList },
  { key: 'reports', label: 'Reports', href: '/reports', icon: FileText },
  { key: 'actions', label: 'Corrective Actions', href: '/actions', icon: AlertCircle },
  { key: 'team', label: 'Team', href: '/team', icon: User },
];

const ROLE_NAV: Record<string, string[]> = {
  admin: NAV_ITEMS.map((i) => i.key),
  auditor: ['dashboard', 'companies', 'workplaces', 'audits', 'reports', 'actions'],
  reviewer: ['dashboard', 'audits', 'reports'],
  viewer: ['dashboard', 'companies', 'workplaces', 'reports'],
};

export function Sidebar({ user, onLogout }: { user: { name: string; role: string; avatar?: string }; onLogout: () => void }) {
  const allowed = ROLE_NAV[user.role] ?? [];
  const items = NAV_ITEMS.filter((i) => allowed.includes(i.key));
  const IconMap: Record<string, React.ElementType> = {
    dashboard: Building2,
    companies: Building2,
    workplaces: Building2,
    audits: ClipboardList,
    reports: FileText,
    actions: AlertCircle,
    team: User,
  };
  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-64 bg-brand-dark text-white border-r border-white/10 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">O</div>
          <div className="font-bold text-lg tracking-tight">OSH Audit Pro</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const Icon = IconMap[item.key];
          return (
            <a key={item.key} href={item.href} className="flex items-center gap-3 rounded-button px-3 py-2 text-sm text-brand-light/90 hover:bg-white/10 hover:text-white transition">
              <Icon className="w-5 h-5" />
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
          <div>
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs opacity-75">{user.role}</div>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-button px-3 py-2 text-sm text-brand-light/90 hover:bg-white/10 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
