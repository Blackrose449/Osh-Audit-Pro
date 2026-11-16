import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { companyApi } from '@/api/client';
import type { Company } from '@/types';
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

const STATUS_STYLES: Record<Company['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Audit due': 'bg-amber-50 text-amber-700 ring-amber-200',
  Onboarding: 'bg-sky-50 text-sky-700 ring-sky-200',
};

const EMPTY_FORM = {
  name: '',
  industry: '',
  status: 'Active' as Company['status'],
  contactName: '',
  email: '',
  phone: '',
  address: '',
};

type CompanyForm = typeof EMPTY_FORM;

export function Companies() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | Company['status']>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = hasRole('admin');

  const load = async () => {
    try {
      setCompanies(await companyApi.list());
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return companies.filter((company) => {
      const matchesStatus = status === 'all' || company.status === status;
      const matchesTerm =
        !term ||
        [company.name, company.industry, company.contactName ?? '', company.address ?? '']
          .join(' ')
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [companies, query, status]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setForm({
      name: company.name,
      industry: company.industry,
      status: company.status,
      contactName: company.contactName ?? '',
      email: company.email ?? '',
      phone: company.phone ?? '',
      address: company.address ?? '',
    });
    setError('');
    setFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await companyApi.update(editing.id, form);
        toast('Company updated.');
      } else {
        await companyApi.create({ ...form, orgId: 'org-1' });
        toast('Company added.');
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await companyApi.remove(pendingDelete.id);
      toast('Company deleted.');
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete company', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalWorkplaces = companies.reduce((sum, company) => sum + company.workplaceCount, 0);
  const auditsDue = companies.filter((company) => company.status === 'Audit due').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        subtitle="Client organizations in your audit programme."
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> New company
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Companies" value={companies.length} icon={Building2} />
        <Summary label="Active" value={companies.filter((company) => company.status === 'Active').length} icon={ShieldCheck} />
        <Summary label="Workplaces" value={totalWorkplaces} icon={MapPin} />
        <Summary label="Audits due" value={auditsDue} icon={Users} tone="amber" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies, contacts…"
            className="input pl-9"
            aria-label="Search companies"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'Active', 'Audit due', 'Onboarding'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setStatus(option)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                status === option
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-white text-brand-ink/60 ring-1 ring-brand-border hover:text-brand-ink',
              )}
            >
              {option === 'all' ? 'All' : option}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-64 animate-pulse rounded-card bg-brand-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title={companies.length ? 'No companies match your filters' : 'No companies yet'}
          description={
            companies.length
              ? 'Try a different search or status filter.'
              : 'Add your first client company to start scheduling audits.'
          }
          action={
            isAdmin ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New company
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((company) => (
            <Card
              key={company.id}
              padding="lg"
              className="group flex flex-col transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-brand-ink">{company.name}</h2>
                    <p className="truncate text-xs text-brand-ink/50">{company.industry}</p>
                  </div>
                </div>
                <StatusPill label={company.status} className={STATUS_STYLES[company.status]} />
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-button bg-brand-light/70 p-2.5 text-center">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Workplaces</dt>
                  <dd className="text-sm font-bold text-brand-ink">{company.workplaceCount}</dd>
                </div>
                <div className="border-x border-brand-border">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Audits</dt>
                  <dd className="text-sm font-bold text-brand-ink">{company.auditCount}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Last</dt>
                  <dd className="text-xs font-bold text-brand-ink">{company.lastAudit ? formatDate(company.lastAudit) : '—'}</dd>
                </div>
              </dl>

              <div className="mt-3 space-y-1.5 text-xs text-brand-ink/55">
                {company.contactName && (
                  <p className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-ink/35" /> {company.contactName}
                  </p>
                )}
                {company.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-brand-ink/35" /> {company.email}
                  </p>
                )}
                {company.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brand-ink/35" /> {company.phone}
                  </p>
                )}
                {company.address && (
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-brand-ink/35" /> {company.address}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-brand-border pt-3">
                <Link
                  to={`/companies/${company.id}/workplaces`}
                  className="btn btn-secondary flex-1 py-1.5 text-xs"
                >
                  View workplaces
                </Link>
                <Link
                  to={`/audits/new?companyId=${company.id}`}
                  className="btn btn-ghost px-2 py-1.5 text-xs"
                  title="Create audit"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Link>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(company)}
                      className="rounded-button p-1.5 text-brand-ink/45 transition hover:bg-brand-light hover:text-brand-ink"
                      aria-label={`Edit ${company.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPendingDelete(company)}
                      className="rounded-button p-1.5 text-brand-ink/45 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${company.name}`}
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

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit company' : 'New company'}
        description={
          editing ? 'Update client details and audit status.' : 'Add a client organization to your workspace.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="company-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add company'}
            </Button>
          </>
        }
      >
        <form id="company-form" onSubmit={handleSubmit} className="grid gap-x-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Company name"
              id="company-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Apex Manufacturing Ltd."
              required
            />
          </div>
          <Input
            label="Industry"
            id="company-industry"
            value={form.industry}
            onChange={(event) => setForm({ ...form, industry: event.target.value })}
            placeholder="Manufacturing"
          />
          <Select
            label="Status"
            id="company-status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as Company['status'] })}
          >
            <option value="Active">Active</option>
            <option value="Audit due">Audit due</option>
            <option value="Onboarding">Onboarding</option>
          </Select>
          <Input
            label="Primary contact"
            id="company-contact"
            value={form.contactName}
            onChange={(event) => setForm({ ...form, contactName: event.target.value })}
            placeholder="Jane Njeri"
          />
          <Input
            label="Email"
            id="company-email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="jane@apex.example"
          />
          <Input
            label="Phone"
            id="company-phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            placeholder="+254 711 000 101"
          />
          <Input
            label="Address"
            id="company-address"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="Industrial Area, Nairobi"
          />
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
        title="Delete company?"
        description="This removes the company and its workplaces. Companies with audits cannot be deleted."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete company'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          <span className="font-semibold text-brand-ink">{pendingDelete?.name}</span> has{' '}
          {pendingDelete?.workplaceCount} workplace(s) and {pendingDelete?.auditCount} audit(s).
        </p>
      </Modal>
    </div>
  );
}

function Summary({
  label,
  value,
  icon: Icon,
  tone = 'brand',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: 'brand' | 'amber';
}) {
  return (
    <div className="card flex items-center gap-3 py-3">
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-button',
          tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-brand-primary/10 text-brand-primary',
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-lg font-bold leading-none text-brand-ink">{value}</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-brand-ink/45">
          {label}
        </p>
      </div>
    </div>
  );
}
