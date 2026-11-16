import { useEffect, useMemo, useState } from 'react';
import {
  Crown,
  Eye,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { teamApi } from '@/api/client';
import type { User, UserRole } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusPill,
} from '@/components/ui';
import { ROLE_STYLES } from '@/lib/format';
import { cn } from '@/lib/cn';

const ROLES: UserRole[] = ['admin', 'auditor', 'reviewer', 'viewer'];

const ROLE_INFO: Record<UserRole, { label: string; description: string; icon: React.ElementType }> = {
  admin: {
    label: 'Administrators',
    description: 'Full access to settings, the team and all audit data.',
    icon: Crown,
  },
  auditor: {
    label: 'Auditors',
    description: 'Create audits, add findings and photos, and request review.',
    icon: ShieldCheck,
  },
  reviewer: {
    label: 'Reviewers',
    description: 'Verify findings, approve audits and request changes.',
    icon: UserCheck,
  },
  viewer: {
    label: 'Viewers',
    description: 'Read-only access to audits, reports and actions.',
    icon: Eye,
  },
};

interface FormState {
  name: string;
  email: string;
  title: string;
  role: UserRole;
}

const emptyForm = (): FormState => ({ name: '', email: '', title: '', role: 'viewer' });

export function Team() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);

  const canManage = user?.role === 'admin';

  useEffect(() => {
    let cancelled = false;
    teamApi
      .list()
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((err) => {
        if (!cancelled) toast(err instanceof Error ? err.message : 'Could not load team', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return ROLES.reduce<Record<UserRole, number>>(
      (accumulator, role) => {
        accumulator[role] = members.filter((member) => member.role === role).length;
        return accumulator;
      },
      { admin: 0, auditor: 0, reviewer: 0, viewer: 0 },
    );
  }, [members]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== 'all' && member.role !== roleFilter) return false;
      if (!query) return true;
      return [member.name, member.email, member.title, member.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [members, roleFilter, search]);

  const openInvite = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (member: User) => {
    setEditing(member);
    setForm({ name: member.name, email: member.email, title: member.title ?? '', role: member.role });
    setFormError('');
    setFormOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFormError('Enter the member’s name.');
      return;
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title.trim() || undefined,
        role: form.role,
      };
      if (editing) {
        const updated = await teamApi.update(editing.id, payload);
        setMembers((current) => current.map((member) => (member.id === updated.id ? updated : member)));
        toast('Member updated.');
      } else {
        const created = await teamApi.create(payload);
        setMembers((current) => [...current, created]);
        toast(`Invite sent to ${created.email} (demo).`);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not save member.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await teamApi.remove(deleting.id);
      setMembers((current) => current.filter((member) => member.id !== deleting.id));
      toast('Member removed.');
      setDeleting(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not remove member', 'error');
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
        eyebrow="People"
        title="Team and roles"
        subtitle="Manage who can access your organization and what they can do"
        actions={
          canManage && (
            <Button onClick={openInvite}>
              <Plus className="h-4 w-4" /> Invite member
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLES.map((role) => {
          const info = ROLE_INFO[role];
          const Icon = info.icon;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter((current) => (current === role ? 'all' : role))}
              className={cn(
                'card flex items-center gap-3 py-3 text-left transition',
                roleFilter === role && 'ring-2 ring-brand-primary',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-button ring-1 ring-inset',
                  ROLE_STYLES[role],
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-lg font-bold leading-none text-brand-ink">{counts[role]}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/45">
                  {info.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email or role…"
            className="input pl-9"
            aria-label="Search team"
          />
        </div>
        {roleFilter !== 'all' && (
          <Button variant="secondary" onClick={() => setRoleFilter('all')}>
            Showing {ROLE_INFO[roleFilter].label.toLowerCase()} · clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No matching members"
          description="Try a different search or clear the role filter."
          action={<Button variant="secondary" onClick={() => { setSearch(''); setRoleFilter('all'); }}>Clear filters</Button>}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-brand-border/60">
            {filtered.map((member) => {
              const isSelf = member.id === user?.id;
              const lastAdmin = member.role === 'admin' && counts.admin === 1;
              return (
                <div key={member.id} className="flex flex-col gap-3 p-4 transition hover:bg-brand-light/40 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                        {member.name}
                        {isSelf && (
                          <span className="rounded-full bg-brand-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-primary">
                            You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-brand-ink/50">{member.title ?? 'Team member'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:w-64">
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-brand-ink/55 hover:text-brand-primary"
                    >
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-2 sm:w-40">
                    <StatusPill
                      label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      className={ROLE_STYLES[member.role]}
                    />
                  </div>

                  <div className="flex items-center gap-1 sm:w-20 sm:justify-end">
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(member)}
                          className="rounded p-1.5 text-brand-ink/40 transition hover:bg-brand-light hover:text-brand-ink"
                          title="Edit member"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(member)}
                          disabled={isSelf || lastAdmin}
                          className="rounded p-1.5 text-brand-ink/40 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title={
                            isSelf
                              ? 'You cannot remove yourself'
                              : lastAdmin
                                ? 'You cannot remove the last admin'
                                : 'Remove member'
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-brand-border bg-brand-light/30 px-4 py-2.5 text-[11px] text-brand-ink/50">
            {filtered.length} of {members.length} member(s)
            {!canManage && ' · only admins can manage the team'}
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => {
          const info = ROLE_INFO[role];
          const Icon = info.icon;
          return (
            <Card key={role} padding="lg" className="bg-brand-light/40">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
                <Icon className="h-3.5 w-3.5 text-brand-primary" /> {info.label}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-brand-ink/55">{info.description}</p>
            </Card>
          );
        })}
      </div>

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit team member' : 'Invite a team member'}
        description={
          editing
            ? 'Update their details or change what they can access.'
            : 'They will receive an invitation email to join your organization.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="member-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Send invite'}
            </Button>
          </>
        }
      >
        <form id="member-form" onSubmit={save}>
          <Input
            id="member-name"
            label="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Amina Otieno"
            autoFocus
          />
          <Input
            id="member-email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="name@company.com"
          />
          <div className="grid gap-x-3 sm:grid-cols-2">
            <Input
              id="member-title"
              label="Job title (optional)"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="e.g. Safety Officer"
            />
            <Select
              id="member-role"
              label="Role"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <p className="rounded-button bg-brand-light/70 px-3 py-2 text-[11px] text-brand-ink/55">
            {ROLE_INFO[form.role].description}
          </p>
          {!editing && (
            <p className="mt-2 text-[10px] text-brand-ink/40">
              Demo note: invited members are added instantly and cannot sign in until they register.
            </p>
          )}
          {formError && <p className="mt-1 text-xs font-medium text-rose-600">{formError}</p>}
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => !saving && setDeleting(null)}
        title="Remove team member"
        description="They will immediately lose access to this organization."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} disabled={saving}>
              {saving ? 'Removing…' : 'Remove member'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/70">
          Remove <span className="font-semibold text-brand-ink">{deleting?.name}</span> ({deleting?.email}) from the
          team?
        </p>
      </Modal>
    </div>
  );
}
