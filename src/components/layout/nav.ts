import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  AlertTriangle,
  FileText,
  Users,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  end?: boolean;
}

const ALL: UserRole[] = ['admin', 'auditor', 'reviewer', 'viewer'];

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ALL, end: true },
  { key: 'companies', label: 'Companies', href: '/companies', icon: Building2, roles: ['admin', 'auditor', 'viewer'] },
  { key: 'audits', label: 'Audits', href: '/audits', icon: ClipboardList, roles: ALL },
  { key: 'actions', label: 'Corrective actions', href: '/actions', icon: AlertTriangle, roles: ['admin', 'auditor', 'reviewer'] },
  { key: 'reports', label: 'Reports', href: '/reports', icon: FileText, roles: ALL },
  { key: 'team', label: 'Team', href: '/team', icon: Users, roles: ['admin'] },
];

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
