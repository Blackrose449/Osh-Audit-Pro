import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react';
import { companyApi, workplaceApi } from '@/api/client';
import type { Company, Workplace } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusPill,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const STATUS_STYLES: Record<Workplace['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Audit due': 'bg-amber-50 text-amber-700 ring-amber-200',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const EMPTY_FORM = {
  name: '',
  location: '',
  status: 'Active' as Workplace['status'],
  supervisor: '',
  description: '',
};

export function Workplaces() {
  const { id = '' } = useParams();
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Workplace | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Workplace | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = hasRole('admin');

  const load = async () => {
    try {
      const [companyData, workplaceData] = await Promise.all([
        companyApi.get(id),
        workplaceApi.listByCompany(id),
      ]);
      setCompany(companyData);
      setWorkplaces(workplaceData);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return workplaces;
    return workplaces.filter((workplace) =>
      [workplace.name, workplace.location, workplace.supervisor ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    );
  }, [workplaces, query]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, location: company?.address ?? '' });
    setError('');
    setFormOpen(true);
  };

  const openEdit = (workplace: Workplace) => {
    setEditing(workplace);
    setForm({
      name: workplace.name,
      location: workplace.location,
      status: workplace.status,
      supervisor: workplace.supervisor ?? '',
      description: workplace.description ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Workplace name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await workplaceApi.update(id, editing.id, form);
        toast('Workplace updated.');
      } else {
        await workplaceApi.create(id, form);
        toast('Workplace added.');
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save workplace');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await workplaceApi.remove(id, pendingDelete.id);
      toast('Workplace deleted.');
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete workplace', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (notFound) {
    return (
      <EmptyState
        icon={<Building2 className="h-5 w-5" />}
        title="Company not found"
        description="The company may have been removed or the link is incorrect."
        action={
          <Link to="/companies" className="btn btn-primary">
            Back to companies
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/companies"
        backLabel="All companies"
        eyebrow={company?.industry}
        title={company?.name ?? 'Company'}
        subtitle="Workplaces and audit readiness for this client."
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New workplace
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="h-24 animate-pulse rounded-card bg-brand-border/50" />
      ) : (
        <Card padding="lg" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-brand-ink">{company?.name}</p>
                {company && (
                  <StatusPill label={company.status} className={STATUS_STYLES[company.status as Workplace['status']] ?? STATUS_STYLES.Active} />
                )}
              </div>
              <p className="mt-0.5 text-xs text-brand-ink/50">{company?.industry}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-ink/55">
                {company?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.address}
                  </span>
                )}
                {company?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {company.email}
                  </span>
                )}
                {company?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {company.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="rounded-button bg-brand-light px-3 py-2 text-center">
              <p className="text-lg font-bold text-brand-ink">{workplaces.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/45">Sites</p>
            </div>
            <div className="rounded-button bg-brand-light px-3 py-2 text-center">
              <p className="text-lg font-bold text-brand-ink">
                {workplaces.reduce((sum, workplace) => sum + workplace.openFindings, 0)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/45">Open findings</p>
            </div>
          </div>
        </Card>
      )}

      {workplaces.length > 0 && (
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search workplaces…"
            className="input pl-9"
            aria-label="Search workplaces"
          />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-52 animate-pulse rounded-card bg-brand-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title={workplaces.length ? 'No workplaces match your search' : 'No workplaces yet'}
          description={
            workplaces.length
              ? 'Try a different name, location or supervisor.'
              : 'Add a site to start scheduling inspections.'
          }
          action={
            isAdmin ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New workplace
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((workplace) => (
            <Card key={workplace.id} padding="lg" className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-brand-ink">{workplace.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-ink/50">
                    <MapPin className="h-3.5 w-3.5" /> {workplace.location}
                  </p>
                </div>
                <StatusPill label={workplace.status} className={STATUS_STYLES[workplace.status]} />
              </div>

              {workplace.description && (
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-ink/55">
                  {workplace.description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-button bg-brand-light/70 p-2.5 text-center">
                <div>
                  <p className="text-sm font-bold text-brand-ink">{workplace.auditCount}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Audits</p>
                </div>
                <div className="border-x border-brand-border">
                  <p className={cn('text-sm font-bold', workplace.openFindings ? 'text-rose-600' : 'text-brand-ink')}>
                    {workplace.openFindings}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Open</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-ink">
                    {workplace.lastAudit ? formatDate(workplace.lastAudit) : '—'}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Last audit</p>
                </div>
              </div>

              {workplace.supervisor && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-ink/55">
                  <UserRound className="h-3.5 w-3.5 text-brand-ink/35" /> Supervisor: {workplace.supervisor}
                </p>
              )}

              <div className="mt-auto flex items-center gap-2 border-t border-brand-border pt-3">
                <Link
                  to={`/audits/new?companyId=${id}&workplaceId=${workplace.id}`}
                  className="btn btn-secondary flex-1 py-1.5 text-xs"
                >
                  <ClipboardList className="h-3.5 w-3.5" /> Start audit
                </Link>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(workplace)}
                      className="rounded-button p-1.5 text-brand-ink/45 transition hover:bg-brand-light hover:text-brand-ink"
                      aria-label={`Edit ${workplace.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(workplace)}
                      className="rounded-button p-1.5 text-brand-ink/45 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${workplace.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {company && (
        <Card padding="lg" className="flex flex-col items-start gap-3 bg-gradient-to-r from-brand-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-ink">Ready to inspect {company.name}?</p>
            <p className="text-xs text-brand-ink/55">Create an audit and choose the workplace on the next screen.</p>
          </div>
          <Link to={`/audits/new?companyId=${company.id}`} className="btn btn-primary">
            New audit <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit workplace' : 'New workplace'}
        description="Workplaces are the physical sites you inspect."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="workplace-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add workplace'}
            </Button>
          </>
        }
      >
        <form id="workplace-form" onSubmit={handleSubmit} className="grid gap-x-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Workplace name"
              id="workplace-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Plant A — Assembly"
              required
            />
          </div>
          <Input
            label="Location"
            id="workplace-location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            placeholder="Nairobi, Kenya"
          />
          <Select
            label="Status"
            id="workplace-status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as Workplace['status'] })}
          >
            <option value="Active">Active</option>
            <option value="Audit due">Audit due</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <Input
            label="Supervisor"
            id="workplace-supervisor"
            value={form.supervisor}
            onChange={(event) => setForm({ ...form, supervisor: event.target.value })}
            placeholder="Site supervisor"
          />
          <div className="sm:col-span-2">
            <label className="label" htmlFor="workplace-description">
              Description
            </label>
            <textarea
              id="workplace-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={3}
              className="input"
              placeholder="Areas covered, shifts, key hazards…"
            />
          </div>
          {error && (
            <p className="sm:col-span-2 rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
        </form>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete workplace?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete workplace'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          <span className="font-semibold text-brand-ink">{pendingDelete?.name}</span> will be removed.
          Workplaces with audits cannot be deleted.
        </p>
      </Modal>
    </div>
  );
}
