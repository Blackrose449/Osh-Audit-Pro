import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Plus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { actionApi, auditApi, companyApi, reportApi } from '@/api/client';
import type { Action, Audit, Company, Finding, Report } from '@/types';
import { Button, Card, EmptyState, PageHeader, StatusPill } from '@/components/ui';
import { AUDIT_STATUS_STYLES, ACTION_STATUS_STYLES, formatDate, isOverdue } from '@/lib/format';
import { cn } from '@/lib/cn';

interface DashboardData {
  audits: Audit[];
  companies: Company[];
  findings: Finding[];
  actions: Action[];
  reports: Report[];
}

const EMPTY: DashboardData = { audits: [], companies: [], findings: [], actions: [], reports: [] };

export function Dashboard() {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [audits, companies, actions, reports] = await Promise.all([
          auditApi.list(),
          companyApi.list(),
          actionApi.list(),
          reportApi.list(),
        ]);
        const findings = (await Promise.all(audits.map((audit) => auditApi.findings(audit.id)))).flat();
        if (!cancelled) setData({ audits, companies, findings, actions, reports });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const companyName = (id: string) => data.companies.find((company) => company.id === id)?.name ?? 'Unknown company';

  const stats = useMemo(() => {
    const openFindings = data.findings.filter((finding) => finding.status !== 'verified');
    const overdueActions = data.actions.filter((action) => action.status === 'overdue' || (action.status !== 'completed' && isOverdue(action.deadline)));
    const workplaces = data.companies.reduce((sum, company) => sum + company.workplaceCount, 0);
    return {
      audits: data.audits.length,
      openFindings: openFindings.length,
      workplaces,
      reports: data.reports.length,
      overdueActions: overdueActions.length,
    };
  }, [data]);

  const riskCounts = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    data.findings.forEach((finding) => {
      counts[finding.riskLevel] += 1;
    });
    return counts;
  }, [data.findings]);

  const totalFindings = riskCounts.HIGH + riskCounts.MEDIUM + riskCounts.LOW;
  const highPct = totalFindings ? (riskCounts.HIGH / totalFindings) * 100 : 0;
  const mediumPct = totalFindings ? (riskCounts.MEDIUM / totalFindings) * 100 : 0;

  const attention = data.audits
    .filter((audit) => ['pending_review', 'changes_requested', 'in_progress', 'draft'].includes(audit.status))
    .slice(0, 4);

  const recentAudits = data.audits.slice(0, 5);
  const pendingReview = data.audits.filter((audit) => audit.status === 'pending_review').length;
  const canCreate = hasAnyRole(['admin', 'auditor']);
  const greeting = getGreeting();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting}, ${user?.name.split(' ')[0] ?? 'there'}`}
        subtitle="Here is what needs attention across Greenfield Workplace Solutions today."
        actions={
          <>
            {canCreate && (
              <Button onClick={() => navigate('/audits/new')}>
                <Plus className="h-4 w-4" /> New audit
              </Button>
            )}
            <Link to="/reports" className="btn btn-secondary">
              <FileText className="h-4 w-4" /> Reports
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total audits"
          value={stats.audits}
          hint={`${pendingReview} awaiting review`}
          icon={ClipboardList}
          tone="brand"
          href="/audits"
        />
        <StatCard
          label="Open findings"
          value={stats.openFindings}
          hint={`${riskCounts.HIGH} high risk`}
          icon={ShieldAlert}
          tone="danger"
          href="/audits"
        />
        <StatCard
          label="Workplaces"
          value={stats.workplaces}
          hint={`${data.companies.length} client companies`}
          icon={Building2}
          tone="sky"
          href="/companies"
        />
        <StatCard
          label="Reports"
          value={stats.reports}
          hint={data.reports[0] ? `Last ${formatDate(data.reports[0].createdAt)}` : 'None generated yet'}
          icon={FileText}
          tone="violet"
          href="/reports"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Risk snapshot</h2>
              <p className="text-xs text-brand-ink/55">
                {totalFindings} findings across all audits
              </p>
            </div>
            <Link
              to="/audits"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              Review audits <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0">
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: totalFindings
                    ? `conic-gradient(#EF4444 0 ${highPct}%, #F59E0B ${highPct}% ${highPct + mediumPct}%, #10B981 ${highPct + mediumPct}% 100%)`
                    : '#E2E8E5',
                }}
                role="img"
                aria-label={`Risk distribution: ${riskCounts.HIGH} high, ${riskCounts.MEDIUM} medium, ${riskCounts.LOW} low`}
              />
              <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-3xl font-bold text-brand-ink">{totalFindings}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/45">
                  Findings
                </span>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              <RiskRow label="High risk" count={riskCounts.HIGH} total={totalFindings} color="bg-red-500" />
              <RiskRow label="Medium risk" count={riskCounts.MEDIUM} total={totalFindings} color="bg-amber-500" />
              <RiskRow label="Low risk" count={riskCounts.LOW} total={totalFindings} color="bg-emerald-500" />
              <div className="pt-2">
                <div className="flex items-center justify-between rounded-button bg-brand-light px-3 py-2 text-xs">
                  <span className="text-brand-ink/60">Verified findings</span>
                  <span className="font-bold text-brand-ink">
                    {data.findings.filter((finding) => finding.status === 'verified').length} / {totalFindings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-brand-ink">Needs attention</h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
              {attention.length}
            </span>
          </div>
          <div className="mt-3 flex-1 space-y-2">
            {attention.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-button bg-brand-light/60 py-6 text-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                <p className="mt-2 text-xs font-medium text-brand-ink/60">Everything is on track.</p>
              </div>
            ) : (
              attention.map((audit) => {
                const target =
                  audit.status === 'pending_review'
                    ? `/audits/${audit.id}/review`
                    : audit.status === 'changes_requested'
                      ? `/audits/${audit.id}/findings`
                      : `/audits/${audit.id}`;
                return (
                  <Link
                    key={audit.id}
                    to={target}
                    className="flex items-start gap-2.5 rounded-button border border-transparent p-2.5 transition hover:border-brand-border hover:bg-brand-light/70"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        audit.status === 'pending_review' || audit.status === 'changes_requested'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-sky-50 text-sky-600',
                      )}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-brand-ink">
                        {audit.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <StatusPill
                          label={audit.status}
                          className={AUDIT_STATUS_STYLES[audit.status]}
                          dot={false}
                        />
                        <span className="text-[10px] text-brand-ink/45">{formatDate(audit.updatedAt)}</span>
                      </span>
                    </span>
                  </Link>
                );
              })
            )}
          </div>
          <Link to="/audits" className="btn btn-ghost mt-3 w-full text-xs">
            View all audits <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-brand-ink">Recent audits</h2>
              <p className="text-xs text-brand-ink/55">Latest activity across client workplaces</p>
            </div>
            <Link to="/audits" className="text-xs font-semibold text-brand-primary hover:underline">
              View all
            </Link>
          </div>
          {recentAudits.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={<ClipboardList className="h-5 w-5" />}
              title="No audits yet"
              description="Create your first audit to get started."
              action={canCreate ? <Button onClick={() => navigate('/audits/new')}>New audit</Button> : undefined}
            />
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="table-head pb-2">Audit</th>
                    <th className="table-head pb-2">Company</th>
                    <th className="table-head pb-2">Status</th>
                    <th className="table-head pb-2 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAudits.map((audit) => (
                    <tr key={audit.id} className="row-hover">
                      <td className="py-2.5 pr-3">
                        <Link to={`/audits/${audit.id}`} className="font-medium text-brand-ink hover:text-brand-primary">
                          {audit.title}
                        </Link>
                        <p className="text-[10px] capitalize text-brand-ink/45">{audit.type} audit</p>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-brand-ink/60">{companyName(audit.companyId)}</td>
                      <td className="py-2.5 pr-3">
                        <StatusPill label={audit.status} className={AUDIT_STATUS_STYLES[audit.status]} />
                      </td>
                      <td className="py-2.5 text-right text-xs text-brand-ink/50">
                        {formatDate(audit.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-brand-ink">Corrective actions</h2>
              <Link to="/actions" className="text-xs font-semibold text-brand-primary hover:underline">
                Open
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Open" value={data.actions.filter((action) => action.status === 'open' || action.status === 'in_progress').length} tone="sky" />
              <MiniStat label="Overdue" value={stats.overdueActions} tone="danger" />
              <MiniStat label="Done" value={data.actions.filter((action) => action.status === 'completed').length} tone="emerald" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-ink/55">Completion</span>
                <span className="font-bold text-brand-ink">
                  {data.actions.length
                    ? Math.round((data.actions.filter((action) => action.status === 'completed').length / data.actions.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-light">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${data.actions.length ? (data.actions.filter((action) => action.status === 'completed').length / data.actions.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {data.actions.slice(0, 2).map((action) => (
                <div key={action.id} className="flex items-start gap-2 rounded-button bg-brand-light/60 p-2">
                  <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-ink/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-brand-ink">{action.title}</p>
                    <p className="text-[10px] text-brand-ink/45">
                      Due {formatDate(action.deadline)} · {action.responsible}
                    </p>
                  </div>
                  <StatusPill label={action.status} className={ACTION_STATUS_STYLES[action.status]} dot={false} />
                </div>
              ))}
              {data.actions.length === 0 && (
                <p className="text-xs text-brand-ink/45">No corrective actions recorded.</p>
              )}
            </div>
          </Card>

          <Card padding="lg" className="bg-gradient-to-br from-brand-primary/5 to-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="mt-2 text-sm font-bold text-brand-ink">Quick start</p>
            <p className="mt-1 text-xs leading-relaxed text-brand-ink/60">
              Add a company, create an audit and let the AI assistant suggest findings from photos.
            </p>
            <div className="mt-3 space-y-2">
              {canCreate && (
                <Button size="sm" className="w-full" onClick={() => navigate('/audits/new')}>
                  <Plus className="h-3.5 w-3.5" /> Start an audit
                </Button>
              )}
              <Link to="/companies" className="btn btn-secondary w-full py-1.5 text-xs">
                <Building2 className="h-3.5 w-3.5" /> Browse companies
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ElementType;
  tone: 'brand' | 'danger' | 'sky' | 'violet';
  href: string;
}) {
  const tones = {
    brand: 'bg-brand-primary/10 text-brand-primary',
    danger: 'bg-rose-50 text-rose-600',
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <Link
      to={href}
      className="card group flex flex-col justify-between transition hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-ink/45">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-brand-ink">{value}</p>
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-button', tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-[11px] font-medium text-brand-ink/50">{hint}</p>
    </Link>
  );
}

function RiskRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-brand-ink/60">
          <span className={cn('h-2 w-2 rounded-full', color)} /> {label}
        </span>
        <span className="font-semibold text-brand-ink">
          {count} <span className="font-normal text-brand-ink/40">· {pct}%</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-light">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: 'sky' | 'danger' | 'emerald' }) {
  const tones = {
    sky: 'text-sky-600 bg-sky-50',
    danger: 'text-rose-600 bg-rose-50',
    emerald: 'text-emerald-600 bg-emerald-50',
  };
  return (
    <div className={cn('rounded-button px-2 py-2', tones[tone])}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 animate-pulse rounded-card bg-brand-border/50" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-card bg-brand-border/50" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-64 animate-pulse rounded-card bg-brand-border/50 xl:col-span-2" />
        <div className="h-64 animate-pulse rounded-card bg-brand-border/50" />
      </div>
    </div>
  );
}
