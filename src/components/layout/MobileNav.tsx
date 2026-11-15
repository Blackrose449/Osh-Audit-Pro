import { Home, ClipboardList, FileText, User } from 'lucide-react';

export function MobileNav({}: { user: { name: string; role: string; avatar?: string }; onLogout: () => void }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', href: '/', icon: Home },
    { key: 'audits', label: 'Audits', href: '/audits', icon: ClipboardList },
    { key: 'reports', label: 'Reports', href: '/reports', icon: FileText },
    { key: 'team', label: 'Team', href: '/team', icon: User },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-brand-border bg-white flex items-center justify-around px-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <a key={item.key} href={item.href} className="flex flex-col items-center gap-1 text-xs text-brand-ink/60 hover:text-brand-primary">
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
