import type { ActionStatus, AuditStatus, RiskLevel, UserRole } from '@/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(value?: string, options?: { withYear?: boolean }): string {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '—';
  const month = MONTHS[date.getMonth()];
  return `${month} ${date.getDate()}${options?.withYear === false ? '' : `, ${date.getFullYear()}`}`;
}

export function relativeTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 31) return `${Math.floor(days / 7)} wk ago`;
  return formatDate(value);
}

export function isOverdue(value?: string): boolean {
  if (!value) return false;
  const date = new Date(value.length === 10 ? `${value}T23:59:59` : value);
  return date.getTime() < Date.now();
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const AUDIT_STATUS_STYLES: Record<AuditStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 ring-slate-200',
  in_progress: 'bg-sky-50 text-sky-700 ring-sky-200',
  pending_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  reviewed: 'bg-violet-50 text-violet-700 ring-violet-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  changes_requested: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const ACTION_STATUS_STYLES: Record<ActionStatus, string> = {
  open: 'bg-sky-50 text-sky-700 ring-sky-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  overdue: 'bg-rose-50 text-rose-700 ring-rose-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const RISK_STYLES: Record<RiskLevel, string> = {
  HIGH: 'bg-red-50 text-red-700 ring-red-200',
  MEDIUM: 'bg-amber-50 text-amber-800 ring-amber-200',
  LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-brand-primary/10 text-brand-dark ring-brand-primary/20',
  auditor: 'bg-sky-50 text-sky-700 ring-sky-200',
  reviewer: 'bg-violet-50 text-violet-700 ring-violet-200',
  viewer: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export const RISK_ORDER: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
