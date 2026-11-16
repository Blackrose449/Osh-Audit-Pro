import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  Check,
  CheckCircle2,
  Download,
  FileText,
  FileType2,
  Layers,
  Loader2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { auditApi, companyApi, reportApi, workplaceApi } from '@/api/client';
import type { Audit, Company, Finding, Photo, Report, Workplace } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Card, PageHeader, StatusPill } from '@/components/ui';
import { AUDIT_STATUS_STYLES, formatDate, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

const SECTIONS = [
  { key: 'summary', label: 'Executive summary', description: 'Audit scope, dates and overall risk position.' },
  { key: 'findings', label: 'Detailed findings', description: 'Hazards, risk ratings and control measures.' },
  { key: 'photos', label: 'Photo evidence', description: 'Inspection photos with captions.' },
  { key: 'actions', label: 'Corrective action plan', description: 'Owners, deadlines and status.' },
  { key: 'signature', label: 'Sign-off page', description: 'Auditor and reviewer approval block.' },
];

export function ReportSetup() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState<'PDF' | 'DOCX'>('PDF');
  const [template, setTemplate] = useState('standard');
  const [language, setLanguage] = useState('en');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [sections, setSections] = useState<string[]>(SECTIONS.map((section) => section.key));
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Report | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const auditData = await auditApi.get(id);
        const [companyData, workplaces, findingData, photoData, reportData] = await Promise.all([
          companyApi.get(auditData.companyId).catch(() => null),
          workplaceApi.listByCompany(auditData.companyId).catch(() => []),
          auditApi.findings(id),
          auditApi.photos(id),
          reportApi.list(),
        ]);
        if (cancelled) return;
        setAudit(auditData);
        setCompany(companyData);
        setWorkplace(workplaces.find((item) => item.id === auditData.workplaceId) ?? null);
        setFindings(findingData);
        setPhotos(photoData);
        setReports(reportData.filter((report) => report.auditId === id));
      } catch (err) {
        if (!cancelled) toast(err instanceof Error ? err.message : 'Could not load report setup', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const verifiedCount = useMemo(
    () => findings.filter((finding) => finding.status === 'verified').length,
    [findings],
  );

  const includedFindings = verifiedOnly ? verifiedCount : findings.length;
  const recommended = audit?.status === 'approved';

  const generate = async () => {
    setGenerating(true);
    try {
      const report = await reportApi.generate(id, format);
      setGenerated(report);
      setReports((current) => [report, ...current]);
      toast(`${format} report generated (version ${report.version}).`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not generate report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const download = async () => {
    if (!generated) return;
    try {
      await reportApi.update(generated.id, { status: 'downloaded' });
      setDownloaded(true);
      toast('Download started (demo).');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Download failed', 'error');
    }
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-card bg-brand-border/50" />;
  }

  if (!audit) {
    return (
      <Card className="py-12 text-center">
        <p className="text-sm text-brand-ink/60">Audit not found.</p>
        <Link to="/audits" className="btn btn-primary mt-3">Back to audits</Link>
      </Card>
    );
  }

  if (generated) {
    return (
      <div className="space-y-6">
        <PageHeader
          backTo={`/audits/${id}`}
          backLabel="Back to audit"
          eyebrow="Report"
          title="Report ready"
          subtitle={audit.title}
        />
        <Card padding="lg" className="border-emerald-200 bg-emerald-50/40 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <p className="mt-3 text-lg font-bold text-brand-ink">
            Version {generated.version} · {generated.format}
          </p>
          <p className="mt-1 text-xs text-brand-ink/55">
            Generated {formatDate(generated.createdAt)} for {company?.name ?? 'the client'}.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={download} disabled={downloaded}>
              {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {downloaded ? 'Downloaded' : `Download ${generated.format}`}
            </Button>
            <Link to="/reports" className="btn btn-secondary">
              <FileText className="h-4 w-4" /> Report library
            </Link>
            <Link to={`/audits/${id}`} className="btn btn-ghost">
              Back to audit
            </Link>
          </div>
          <p className="mt-4 text-[10px] text-brand-ink/40">
            This demo simulates report generation. No real PDF or DOCX file is produced.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={`/audits/${id}`}
        backLabel="Back to audit"
        eyebrow="Report"
        title="Generate audit report"
        subtitle={`${company?.name ?? 'Company'} · ${workplace?.name ?? 'Workplace'}`}
        actions={<StatusPill label={audit.status} className={AUDIT_STATUS_STYLES[audit.status]} />}
      />

      {!recommended && (
        <div className="flex items-start gap-2 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This audit is still <span className="font-semibold">{statusLabel(audit.status)}</span>. You can
            generate a draft report now, but approving the audit first is recommended.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card padding="lg">
            <h2 className="text-sm font-bold text-brand-ink">Format</h2>
            <p className="text-xs text-brand-ink/50">Choose how the client will receive the report.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(['PDF', 'DOCX'] as const).map((option) => {
                const Icon = option === 'PDF' ? FileText : FileType2;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormat(option)}
                    className={cn(
                      'flex items-start gap-3 rounded-card border p-3 text-left transition',
                      format === option
                        ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                        : 'border-brand-border bg-white hover:border-brand-primary/40',
                    )}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-brand-ink">{option}</span>
                      <span className="block text-[11px] text-brand-ink/50">
                        {option === 'PDF' ? 'Final, print-ready document.' : 'Editable client copy.'}
                      </span>
                    </span>
                    {format === option && <Check className="ml-auto h-4 w-4 text-brand-primary" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-bold text-brand-ink">Report sections</h2>
            <p className="text-xs text-brand-ink/50">Uncheck anything the client does not need.</p>
            <div className="mt-3 space-y-2">
              {SECTIONS.map((section) => {
                const checked = sections.includes(section.key);
                return (
                  <label
                    key={section.key}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-button border p-2.5 transition',
                      checked ? 'border-brand-primary/30 bg-brand-light/50' : 'border-brand-border bg-white',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSections((current) =>
                          checked ? current.filter((key) => key !== section.key) : [...current, section.key],
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
                    />
                    <span>
                      <span className="block text-xs font-semibold text-brand-ink">{section.label}</span>
                      <span className="block text-[11px] text-brand-ink/50">{section.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-bold text-brand-ink">Options</h2>
            <div className="mt-3 space-y-3">
              <Toggle
                checked={verifiedOnly}
                onChange={setVerifiedOnly}
                label="Include verified findings only"
                description={`${verifiedCount} of ${findings.length} findings are verified.`}
              />
              <Toggle
                checked={includePhotos}
                onChange={setIncludePhotos}
                label="Include photo evidence"
                description={`${photos.length} photo(s) available for this audit.`}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="template">Template</label>
                  <select id="template" value={template} onChange={(event) => setTemplate(event.target.value)} className="input">
                    <option value="standard">Risk Assessment Audit — Version 1</option>
                    <option value="executive">Executive summary — short form</option>
                    <option value="incident">Incident investigation</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="language">Language</label>
                  <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)} className="input">
                    <option value="en">English</option>
                    <option value="sw">Kiswahili</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card padding="lg">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-brand-ink">Report contents</h2>
            </div>
            <dl className="mt-3 space-y-2.5 text-xs">
              <Row label="Audit" value={audit.title} />
              <Row label="Company" value={company?.name ?? '—'} />
              <Row label="Workplace" value={workplace?.name ?? '—'} />
              <Row label="Auditor" value={user?.name ?? '—'} />
              <Row label="Findings" value={`${includedFindings} included`} />
              <Row label="Photos" value={includePhotos ? `${photos.length} included` : 'Excluded'} />
              <Row label="Sections" value={`${sections.length} of ${SECTIONS.length}`} />
              <Row label="Format" value={format} />
            </dl>
            <Button className="mt-4 w-full" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {generating ? 'Generating…' : `Generate ${format}`}
            </Button>
            <p className="mt-2 text-center text-[10px] text-brand-ink/40">
              Report generation is simulated for this demo.
            </p>
          </Card>

          {reports.length > 0 && (
            <Card padding="lg">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-brand-ink">
                <Layers className="h-4 w-4 text-brand-ink/40" /> Previous versions
              </h2>
              <div className="mt-2 space-y-2">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between rounded-button bg-brand-light/70 px-2.5 py-2 text-xs">
                    <span className="font-semibold text-brand-ink">v{report.version} · {report.format}</span>
                    <span className="text-[10px] text-brand-ink/45">{formatDate(report.createdAt)}</span>
                  </div>
                ))}
              </div>
              <Link to="/reports" className="btn btn-secondary mt-3 w-full text-xs">
                Open report library
              </Link>
            </Card>
          )}

          <Card padding="lg" className="bg-brand-light/50">
            <p className="flex items-center gap-1.5 text-xs font-bold text-brand-ink">
              <Camera className="h-3.5 w-3.5" /> Good to know
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-brand-ink/55">
              Each new report increments the version number. Previous versions stay available in the
              report library for your records.
            </p>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-4">
        <Button variant="secondary" onClick={() => navigate(`/audits/${id}`)}>Cancel</Button>
        <Button onClick={generate} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {generating ? 'Generating…' : `Generate ${format} report`}
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-brand-ink/50">{label}</dt>
      <dd className="text-right font-semibold text-brand-ink">{value}</dd>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-button border border-brand-border p-2.5">
      <span>
        <span className="block text-xs font-semibold text-brand-ink">{label}</span>
        <span className="block text-[11px] text-brand-ink/50">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition',
          checked ? 'bg-brand-primary' : 'bg-brand-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </button>
    </label>
  );
}
