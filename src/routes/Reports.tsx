import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  FileType2,
  FolderOpen,
  Search,
  Sparkles,
} from 'lucide-react';
import { auditApi, companyApi, reportApi } from '@/api/client';
import type { Audit, Company, Report } from '@/types';
import { useToast } from '@/hooks/useToast';
import { Button, Card, EmptyState, PageHeader, StatusPill } from '@/components/ui';
import { formatDate, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Reports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<'all' | 'PDF' | 'DOCX'>('all');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [reportData, auditData, companyData] = await Promise.all([
          reportApi.list(),
          auditApi.list(),
          companyApi.list(),
        ]);
        if (cancelled) return;
        setReports(reportData);
        setAudits(auditData);
        setCompanies(companyData);
      } catch (err) {
        if (!cancelled) toast(err instanceof Error ? err.message : 'Could not load reports', 'error');
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
  const companyMap = useMemo(() => new Map(companies.map((company) => [company.id, company])), [companies]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reports
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((report) => {
        if (format !== 'all' && report.format !== format) return false;
        if (!query) return true;
        const audit = auditMap.get(report.auditId);
        const company = audit ? companyMap.get(audit.companyId) : undefined;
        return [audit?.title, company?.name, `v${report.version}`, report.format]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
  }, [reports, search, format, auditMap, companyMap]);

  const stats = useMemo(() => {
    const thisMonth = new Date();
    return {
      total: reports.length,
      pdf: reports.filter((report) => report.format === 'PDF').length,
      month: reports.filter((report) => {
        const date = new Date(report.createdAt);
        return date.getMonth() === thisMonth.getMonth() && date.getFullYear() === thisMonth.getFullYear();
      }).length,
      downloaded: reports.filter((report) => report.status === 'downloaded').length,
    };
  }, [reports]);

  const download = async (report: Report) => {
    setDownloading(report.id);
    try {
      const updated = await reportApi.update(report.id, { status: 'downloaded' });
      setReports((current) => current.map((item) => (item.id === report.id ? updated : item)));
      toast(`Downloading ${report.format} (demo).`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Download failed', 'error');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-card bg-brand-border/50" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Report library"
        subtitle="Generated audit reports and version history"
        actions={
          <Link to="/audits" className="btn btn-primary">
            <FileText className="h-4 w-4" /> Generate from an audit
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total reports" value={stats.total} icon={FolderOpen} />
        <Stat label="PDF exports" value={stats.pdf} icon={FileText} tone="rose" />
        <Stat label="This month" value={stats.month} icon={Sparkles} tone="violet" />
        <Stat label="Downloaded" value={stats.downloaded} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by audit, company or version…"
            className="input pl-9"
            aria-label="Search reports"
          />
        </div>
        <div className="flex items-center gap-1 rounded-button border border-brand-border bg-white p-0.5">
          {(['all', 'PDF', 'DOCX'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={cn(
                'rounded px-3 py-1.5 text-xs font-semibold transition',
                format === option ? 'bg-brand-primary text-white' : 'text-brand-ink/60 hover:bg-brand-light',
              )}
            >
              {option === 'all' ? 'All formats' : option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title={reports.length === 0 ? 'No reports yet' : 'No matching reports'}
          description={
            reports.length === 0
              ? 'Approve an audit, then generate its report to see it here.'
              : 'Try a different search term or format.'
          }
          action={
            reports.length === 0 ? (
              <Link to="/audits" className="btn btn-primary">Browse audits</Link>
            ) : (
              <Button variant="secondary" onClick={() => { setSearch(''); setFormat('all'); }}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-light/60 text-left text-[10px] uppercase tracking-wide text-brand-ink/45">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Audit</th>
                  <th className="px-4 py-2.5 font-semibold">Company</th>
                  <th className="px-4 py-2.5 font-semibold">Version</th>
                  <th className="px-4 py-2.5 font-semibold">Format</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold">Generated</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {filtered.map((report) => {
                  const audit = auditMap.get(report.auditId);
                  const company = audit ? companyMap.get(audit.companyId) : undefined;
                  const Icon = report.format === 'PDF' ? FileText : FileType2;
                  return (
                    <tr key={report.id} className="transition hover:bg-brand-light/40">
                      <td className="px-4 py-3">
                        <Link to={`/audits/${report.auditId}`} className="font-semibold text-brand-ink hover:text-brand-primary">
                          {audit?.title ?? `Audit ${report.auditId}`}
                        </Link>
                        <p className="text-[10px] text-brand-ink/40">{audit ? statusLabel(audit.status) : 'Audit unavailable'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-ink/65">{company?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-brand-ink/70">v{report.version}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand-ink/70">
                          <Icon className="h-3 w-3" /> {report.format}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill
                          label={report.status}
                          className={
                            report.status === 'downloaded'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-ink/55">{formatDate(report.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/audits/${report.auditId}`}
                            className="rounded p-1.5 text-brand-ink/45 transition hover:bg-brand-light hover:text-brand-ink"
                            title="View audit"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => download(report)}
                            disabled={downloading === report.id}
                            title={`Download ${report.format}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-brand-border bg-brand-light/30 px-4 py-2.5 text-[11px] text-brand-ink/50">
            <span>{filtered.length} of {reports.length} report(s)</span>
            <span>Downloads are simulated in this demo</span>
          </div>
        </Card>
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
  tone?: 'brand' | 'rose' | 'violet' | 'emerald';
}) {
  const tones = {
    brand: 'bg-brand-primary/10 text-brand-primary',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
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
