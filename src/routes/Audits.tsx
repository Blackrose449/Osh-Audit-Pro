import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  ClipboardList,
  FileSearch,
  Filter,
  Plus,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { auditApi, companyApi, workplaceApi } from '@/api/client';
import type { Audit, AuditStatus, AuditType, Company, Workplace } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Card, EmptyState, PageHeader, StatusPill } from '@/components/ui';
import { AUDIT_STATUS_STYLES, formatDate, relativeTime, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

const STATUS_FILTERS: Array<{ value: 'all' | AuditStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'pending_review', label: 'Awaiting review' },
  { value: 'approved', label: 'Approved' },
  { value: 'changes_requested', label: 'Changes requested' },
];

const TYPE_STYLES: Record<AuditType, string> = {
  initial: 'bg-sky-50 text-sky-700 ring-sky-200',
  periodic: 'bg-violet-50 text-violet-700 ring-violet-200',
  incident: 'bg-rose-50 text-rose-700 ring-rose-200',
  'follow-up': 'bg-amber-50 text-amber-700 ring-amber-200',
};

export function Audits() {
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | AuditStatus>('all');
  const [type, setType] = useState<'all' | AuditType>('all');
  const [companyId, setCompanyId] = useState('all');
  const canCreate = hasAnyRole(['admin', 'auditor']);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [auditData, companyData] = await Promise.all([auditApi.list(), companyApi.list()]);
        const workplaceGroups = await Promise.all(
          companyData.map((company) => workplaceApi.listByCompany(company.id).catch(() => [])),
        );
        if (!cancelled) {
          setAudits(auditData);
          setCompanies(companyData);
          setWorkplaces(workplaceGroups.flat());
        }
      } catch (err) {
        if (!cancelled) toast(err instanceof Error ? err.message : 'Could not load audits', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const companyName = (id: string) => companies.find((company) => company.id === id)?.name ?? '—';
  const workplaceName = (id: string) => workplaces.find((workplace) => workplace.id === id)?.name ?? '—';

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return audits.filter((audit) => {
      const matchesStatus = status === 'all' || audit.status === status;
      const matchesType = type === 'all' || audit.type === type;
      const matchesCompany = companyId === 'all' || audit.companyId === companyId;
      const matchesTerm =
        !term ||
        [audit.title, companyName(audit.companyId), workplaceName(audit.workplaceId), audit.type]
          .join(' ')
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesType && matchesCompany && matchesTerm;
    });
  }, [audits, query, status, type, companyId, companies, workplaces]);

  const stats = {
    total: audits.length,
    active: audits.filter((audit) => audit.status === 'in_progress').length,
    review: audits.filter((audit) => audit.status === 'pending_review').length,
    approved: audits.filter((audit) => audit.status === 'approved').length,
    findings: audits.reduce((sum, audit) => sum + audit.findingCount, 0),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audits"
        subtitle="Schedule inspections, capture findings and move audits to approval."
        actions={
          canCreate ? (
            <Button onClick={() => navigate('/audits/new')}>
              <Plus className="h-4 w-4" /> New audit
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="All audits" value={stats.total} icon={ClipboardList} />
        <Stat label="In progress" value={stats.active} icon={FileSearch} tone="sky" />
        <Stat label="Awaiting review" value={stats.review} icon={ShieldAlert} tone="amber" />
        <Stat label="Approved" value={stats.approved} icon={FileSearch} tone="emerald" />
      </div>

      <Card padding="md" className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search audits, companies…"
              className="input pl-9"
              aria-label="Search audits"
            />
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <div className="flex items-center gap-1.5 rounded-button border border-brand-border bg-white px-2">
              <Filter className="h-3.5 w-3.5 text-brand-ink/40" />
              <select
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
                className="border-0 bg-transparent py-1.5 text-xs font-medium text-brand-ink focus:outline-none"
                aria-label="Filter by company"
              >
                <option value="all">All companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-button border border-brand-border bg-white px-2">
              <select
                value={type}
                onChange={(event) => setType(event.target.value as 'all' | AuditType)}
                className="border-0 bg-transparent py-1.5 text-xs font-medium text-brand-ink focus:outline-none"
                aria-label="Filter by audit type"
              >
                <option value="all">All types</option>
                <option value="initial">Initial</option>
                <option value="periodic">Periodic</option>
                <option value="incident">Incident</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                status === filter.value
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-brand-light text-brand-ink/60 hover:text-brand-ink',
              )}
            >
              {filter.label}
              {filter.value !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  {audits.filter((audit) => audit.status === filter.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-16 animate-pulse rounded-card bg-brand-border/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" />}
          title={audits.length ? 'No audits match your filters' : 'No audits yet'}
          description={
            audits.length
              ? 'Adjust the search, status, type or company filter.'
              : 'Create your first audit to begin capturing findings.'
          }
          action={
            canCreate ? (
              <Button onClick={() => navigate('/audits/new')}>
                <Plus className="h-4 w-4" /> New audit
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-light/60">
                  <th className="table-head px-4 py-2.5">Audit</th>
                  <th className="table-head px-4 py-2.5">Company / workplace</th>
                  <th className="table-head px-4 py-2.5">Type</th>
                  <th className="table-head px-4 py-2.5">Status</th>
                  <th className="table-head px-4 py-2.5 text-center">Findings</th>
                  <th className="table-head px-4 py-2.5 text-center">Photos</th>
                  <th className="table-head px-4 py-2.5 text-right">Updated</th>
                  <th className="w-10 px-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((audit) => (
                  <tr
                    key={audit.id}
                    className="row-hover cursor-pointer border-b border-brand-border/70 last:border-0"
                    onClick={() => navigate(`/audits/${audit.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-ink">{audit.title}</p>
                      <p className="text-[11px] text-brand-ink/45">
                        {audit.scheduledDate ? `Scheduled ${formatDate(audit.scheduledDate)}` : `Created ${formatDate(audit.createdAt)}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-brand-ink">{companyName(audit.companyId)}</p>
                      <p className="text-[11px] text-brand-ink/45">{workplaceName(audit.workplaceId)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill label={audit.type} className={TYPE_STYLES[audit.type]} dot={false} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill label={audit.status} className={AUDIT_STATUS_STYLES[audit.status]} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand-ink">
                        {audit.findingCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-brand-ink/55">
                        <Camera className="h-3.5 w-3.5" /> {audit.photoCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-brand-ink/50" title={audit.updatedAt}>
                      {relativeTime(audit.updatedAt)}
                    </td>
                    <td className="px-2 text-right">
                      <ArrowRight className="h-4 w-4 text-brand-ink/30" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-brand-border px-4 py-2.5 text-xs text-brand-ink/45">
            <span>
              Showing {filtered.length} of {audits.length} audits
            </span>
            <span>{stats.findings} findings recorded</span>
          </div>
        </Card>
      )}

      {canCreate && !loading && filtered.length > 0 && (
        <Card padding="lg" className="flex flex-col items-start gap-3 bg-gradient-to-r from-brand-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-brand-ink">Need another inspection?</p>
            <p className="text-xs text-brand-ink/55">Start a new audit and select a company and workplace.</p>
          </div>
          <Button onClick={() => navigate('/audits/new')}>
            <Plus className="h-4 w-4" /> New audit
          </Button>
        </Card>
      )}
      {status !== 'all' && !loading && (
        <p className="text-center text-xs text-brand-ink/40">
          Viewing “{statusLabel(status)}” audits only.
        </p>
      )}
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
  tone?: 'brand' | 'sky' | 'amber' | 'emerald';
}) {
  const tones = {
    brand: 'bg-brand-primary/10 text-brand-primary',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
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
