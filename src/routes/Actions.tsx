import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ListTodo,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { actionApi, auditApi } from '@/api/client';
import type { Action, ActionStatus, Audit, RiskLevel } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  RiskBadge,
  Select,
  StatusPill,
  Textarea,
} from '@/components/ui';
import { ACTION_STATUS_STYLES, formatDate, isOverdue, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

const PRIORITIES: RiskLevel[] = ['HIGH', 'MEDIUM', 'LOW'];
const STATUSES: ActionStatus[] = ['open', 'in_progress', 'completed'];

interface FormState {
  title: string;
  description: string;
  responsible: string;
  deadline: string;
  priority: RiskLevel;
  status: ActionStatus;
  auditId: string;
}

const emptyForm = (): FormState => ({
  title: '',
  description: '',
  responsible: '',
  deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  priority: 'MEDIUM',
  status: 'open',
  auditId: '',
});

export function Actions() {
  const { user, hasAnyRole } = useAuth();
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ActionStatus>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Action | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Action | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const canManage = hasAnyRole(['admin', 'auditor']);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [actionData, auditData] = await Promise.all([actionApi.list(), auditApi.list()]);
        if (cancelled) return;
        setActions(actionData);
        setAudits(auditData);
      } catch (err) {
        if (!cancelled) toast(err instanceof Error ? err.message : 'Could not load actions', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const auditMap = useMemo(() => new Map(audits.map((audit) => [audit.id, audit])), [audits]);

  const effectiveStatus = (action: Action): ActionStatus =>
    action.status !== 'completed' && isOverdue(action.deadline) ? 'overdue' : action.status;

  const stats = useMemo(() => {
    const mapped = actions.map(effectiveStatus);
    return {
      total: actions.length,
      open: mapped.filter((status) => status === 'open' || status === 'in_progress').length,
      overdue: mapped.filter((status) => status === 'overdue').length,
      completed: mapped.filter((status) => status === 'completed').length,
    };
  }, [actions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return actions
      .filter((action) => {
        if (filter !== 'all' && effectiveStatus(action) !== filter) return false;
        if (!query) return true;
        return [action.title, action.responsible, action.description, auditMap.get(action.auditId ?? '')?.title]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const rank = (action: Action) => {
          const status = effectiveStatus(action);
          return status === 'overdue' ? 0 : status === 'in_progress' ? 1 : status === 'open' ? 2 : 3;
        };
        return rank(a) - rank(b) || a.deadline.localeCompare(b.deadline);
      });
  }, [actions, filter, search, auditMap]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (action: Action) => {
    setEditing(action);
    setForm({
      title: action.title,
      description: action.description ?? '',
      responsible: action.responsible,
      deadline: action.deadline,
      priority: action.priority,
      status: action.status,
      auditId: action.auditId ?? '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setFormError('Give the action a short, clear title.');
      return;
    }
    if (!form.responsible.trim()) {
      setFormError('Say who is responsible for completing this action.');
      return;
    }
    if (!form.deadline) {
      setFormError('Set a deadline.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        responsible: form.responsible.trim(),
        deadline: form.deadline,
        priority: form.priority,
        status: form.status,
        auditId: form.auditId || undefined,
      };
      if (editing) {
        const updated = await actionApi.update(editing.id, payload);
        setActions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        toast('Action updated.');
      } else {
        const created = await actionApi.create(payload);
        setActions((current) => [...current, created]);
        toast('Corrective action created.');
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save action.');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (action: Action) => {
    setBusyId(action.id);
    try {
      const nextStatus: ActionStatus = action.status === 'completed' ? 'open' : 'completed';
      const updated = await actionApi.update(action.id, {
        status: nextStatus,
        deadline:
          nextStatus === 'open' && isOverdue(action.deadline)
            ? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
            : action.deadline,
      });
      setActions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast(nextStatus === 'completed' ? 'Action marked complete.' : 'Action reopened.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update action', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await actionApi.remove(deleting.id);
      setActions((current) => current.filter((item) => item.id !== deleting.id));
      toast('Action deleted.');
      setDeleting(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete action', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-card bg-brand-border/50" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Follow-through"
        title="Corrective actions"
        subtitle="Track every finding through to closure"
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New action
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total" value={stats.total} icon={ListTodo} />
        <Stat label="Open" value={stats.open} icon={Clock} tone="sky" />
        <Stat label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="rose" />
        <Stat label="Completed" value={stats.completed} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search actions, owners or audits…"
            className="input pl-9"
            aria-label="Search corrective actions"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-button border border-brand-border bg-white p-0.5">
          {(['all', 'open', 'in_progress', 'overdue', 'completed'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={cn(
                'rounded px-2.5 py-1.5 text-[11px] font-semibold transition',
                filter === option ? 'bg-brand-primary text-white' : 'text-brand-ink/60 hover:bg-brand-light',
              )}
            >
              {option === 'all' ? 'All' : statusLabel(option)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title={actions.length === 0 ? 'No corrective actions yet' : 'No matching actions'}
          description={
            actions.length === 0
              ? 'Create an action to track how a finding will be fixed.'
              : 'Try a different status or search term.'
          }
          action={
            canManage && actions.length === 0 ? (
              <Button onClick={openCreate}><Plus className="h-4 w-4" /> New action</Button>
            ) : (
              <Button variant="secondary" onClick={() => { setSearch(''); setFilter('all'); }}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((action) => {
            const status = effectiveStatus(action);
            const audit = action.auditId ? auditMap.get(action.auditId) : undefined;
            const done = action.status === 'completed';
            return (
              <Card key={action.id} padding="none" className={cn('p-3.5 transition', status === 'overdue' && 'border-rose-200')}>
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => canManage && toggleComplete(action)}
                    disabled={!canManage || busyId === action.id}
                    title={done ? 'Reopen action' : 'Mark as complete'}
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition',
                      done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-brand-border text-transparent hover:border-brand-primary hover:text-brand-primary',
                      !canManage && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cn('text-sm font-semibold text-brand-ink', done && 'line-through text-brand-ink/45')}>
                        {action.title}
                      </p>
                      <RiskBadge level={action.priority} />
                      <StatusPill label={statusLabel(status)} className={ACTION_STATUS_STYLES[status]} />
                    </div>
                    {action.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-ink/55">{action.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-brand-ink/50">
                      <span><span className="font-semibold text-brand-ink/65">Owner:</span> {action.responsible}</span>
                      <span className={cn(status === 'overdue' && 'font-semibold text-rose-600')}>
                        <span className="font-semibold text-brand-ink/65">Due:</span> {formatDate(action.deadline)}
                      </span>
                      {audit && (
                        <Link to={`/audits/${audit.id}`} className="font-semibold text-brand-primary hover:underline">
                          {audit.title}
                        </Link>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(action)}
                        className="rounded p-1.5 text-brand-ink/40 transition hover:bg-brand-light hover:text-brand-ink"
                        title="Edit action"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(action)}
                        className="rounded p-1.5 text-brand-ink/40 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Delete action"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
          <p className="pt-1 text-[11px] text-brand-ink/45">
            {filtered.length} of {actions.length} action(s)
            {!canManage && ' · read-only for your role'}
          </p>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit corrective action' : 'New corrective action'}
        description="Describe what needs to happen, who owns it and when it is due."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="action-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create action'}
            </Button>
          </>
        }
      >
        <form id="action-form" onSubmit={save}>
          <Input
            id="action-title"
            label="Action title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="e.g. Install machine guards on press line"
            autoFocus
          />
          <Textarea
            id="action-description"
            label="Description (optional)"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            placeholder="What exactly will be done?"
          />
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Input
              id="action-owner"
              label="Responsible person"
              value={form.responsible}
              onChange={(event) => setForm({ ...form, responsible: event.target.value })}
              placeholder="e.g. Plant Manager"
            />
            <Input
              id="action-deadline"
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(event) => setForm({ ...form, deadline: event.target.value })}
            />
            <Select
              id="action-priority"
              label="Priority"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value as RiskLevel })}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>{statusLabel(priority)}</option>
              ))}
            </Select>
            <Select
              id="action-status"
              label="Status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as ActionStatus })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </Select>
          </div>
          <Select
            id="action-audit"
            label="Linked audit (optional)"
            value={form.auditId}
            onChange={(event) => setForm({ ...form, auditId: event.target.value })}
          >
            <option value="">Not linked</option>
            {audits.map((audit) => (
              <option key={audit.id} value={audit.id}>{audit.title}</option>
            ))}
          </Select>
          {formError && <p className="mt-1 text-xs font-medium text-rose-600">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => !saving && setDeleting(null)}
        title="Delete action"
        description="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete action'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/70">
          Delete <span className="font-semibold text-brand-ink">“{deleting?.title}”</span>? This removes it from
          all tracking for {user?.name ?? 'the team'}.
        </p>
      </Modal>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = 'brand',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: 'brand' | 'sky' | 'rose' | 'emerald';
}) {
  const tones = {
    brand: 'bg-brand-primary/10 text-brand-primary',
    sky: 'bg-sky-50 text-sky-600',
    rose: 'bg-rose-50 text-rose-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="card flex items-center gap-3 py-3">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-button', tones[tone])}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-lg font-bold leading-none text-brand-ink">{value}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/45">{label}</p>
      </div>
    </div>
  );
}
