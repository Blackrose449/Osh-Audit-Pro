import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronRight } from 'lucide-react';

export function TopBar({ onOrgSwitch }: { onOrgSwitch: () => void }) {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-brand-border bg-white/90 backdrop-blur flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button className="text-brand-ink/60 hover:text-brand-ink">
          <Search className="w-5 h-5" />
        </button>
        <span className="hidden sm:block text-sm font-medium text-brand-ink/60">{location.pathname}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onOrgSwitch} className="text-sm font-medium text-brand-ink flex items-center gap-1">
          Greenfield <ChevronRight className="w-3 h-3" />
        </button>
        <button className="text-brand-ink/60 hover:text-brand-ink p-2">
          <Bell className="w-5 h-5" />
        </button>
        <button className="text-brand-ink/60 hover:text-brand-ink p-2">
          <HelpCircle className="w-5 h-5" />
        </button>
        <Link to="/profile" className="text-sm font-medium text-brand-primary">Profile</Link>
      </div>
    </header>
  );
}
