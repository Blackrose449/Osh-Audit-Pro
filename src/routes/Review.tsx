import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { auditApi } from '@/api/client';
import type { Audit, Finding, Photo } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  RiskBadge,
  StatusPill,
} from '@/components/ui';
import { AUDIT_STATUS_STYLES, RISK_ORDER, formatDate, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

export function Review() {
  const { id = '' } = useParams();
  const { user, hasAnyRole } = useAuth();
  const { toast } = useToast();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const canReview = hasAnyRole(['admin', 'reviewer']);

  const load = async () => {
    try {
      const [auditData, findingData, photoData] = await Promise.all([
        auditApi.get(id),
        auditApi.findings(id),
        auditApi.photos(id),
      ]);
      setAudit(auditData);
      setFindings(findingData);
      setPhotos(photoData);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not load review', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const sorted = useMemo(
    () => findings.slice().sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]),
    [findings],
  );

  const stats = useMemo(() => {
    const verified = findings.filter((finding) => finding.status === 'verified').length;
    return {
      total: findings.length,
      verified,
      unverified: findings.length - verified,
      high: findings.filter((finding) => finding.riskLevel === 'HIGH').length,
      suggestions: findings.filter((finding) => finding.status === 'ai_suggestion').length,
      photos: photos.length,
    };
  }, [findings, photos]);

  const decision =
    audit?.status === 'approved' || audit?.status === 'reviewed'
      ? 'approved'
      : audit?.status === 'changes_requested'
        ? 'changes_requested'
        : null;

  const reviewable =
    audit?.status === 'pending_review' ||
    audit?.status === 'changes_requested' ||
    audit?.status === 'reviewed';

  const verifyFinding = async (finding: Finding) => {
    try {
      const updated = await auditApi.updateFinding(id, finding.id, { status: 'verified' });
      setFindings((current) => current.map((item) => (item.id === finding.id ? updated : item)));
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not verify finding', 'error');
    }
  };

  const verifyAll = async () => {
    const pending = findings.filter((finding) => finding.status !== 'verified');
    if (!pending.length) return;
    setBusy(true);
    try {
      const updated = await Promise.all(
        pending.map((finding) => auditApi.updateFinding(id, finding.id, { status: 'verified' })),
      );
      setFindings((current) =>
        current.map((finding) => updated.find((item) => item.id === finding.id) ?? finding),
      );
      toast(`${updated.length} finding(s) verified.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not verify findings', 'error');
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    setBusy(true);
    try {
      const updated = await auditApi.update(id, {
        status: 'approved',
        reviewerId: user?.id,
        reviewNotes: 'All findings verified and approved.',
      });
      setAudit(updated);
      toast('Audit approved. You can now generate the report.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not approve audit', 'error');
    } finally {
      setBusy(false);
    }
  };

  const requestChanges = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason.trim()) {
      setReasonError('Tell the auditor what needs to change.');
      return;
    }
    setBusy(true);
    try {
      const updated = await auditApi.update(id, {
        status: 'changes_requested',
        reviewerId: user?.id,
        reviewNotes: reason.trim(),
      });
      setAudit(updated);
      setChangesOpen(false);
      setReason('');
      toast('Changes requested from the auditor.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not request changes', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-card bg-brand-border/50" />
        <div className="h-72 animate-pulse rounded-card bg-brand-border/50" />
      </div>
    );
  }

  if (!audit) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-5 w-5" />}
        title="Audit not found"
        action={<Link to="/audits" className="btn btn-primary">Back to audits</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={`/audits/${id}`}
        backLabel="Back to audit"
        eyebrow="Review"
        title="Review findings"
        subtitle={audit.title}
        actions={
          <>
            <StatusPill label={audit.status} className={AUDIT_STATUS_STYLES[audit.status]} />
            <Link to={`/audits/${id}/findings`} className="btn btn-secondary">
              Open findings editor
            </Link>
          </>
        }
      />

      {!canReview && (
        <div className="rounded-card border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          You are viewing the review in read-only mode. Only reviewers and admins can approve or request changes.
        </div>
      )}

      {decision === 'approved' && (
        <Card padding="lg" className="border-emerald-200 bg-emerald-50/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-900">This audit has been approved.</p>
                <p className="text-xs text-emerald-800/70">
                  Next, generate the final report for the client.
                </p>
              </div>
            </div>
            <Link to={`/audits/${id}/report`} className="btn btn-primary">
              <FileText className="h-4 w-4" /> Generate report
            </Link>
          </div>
        </Card>
      )}

      {decision === 'changes_requested' && (
        <Card padding="lg" className="border-rose-200 bg-rose-50/40">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <MessageSquareWarning className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-rose-900">Changes were requested.</p>
              {audit.reviewNotes && (
                <p className="mt-1 text-xs leading-relaxed text-rose-900/70">{audit.reviewNotes}</p>
              )}
              <Link to={`/audits/${id}/findings`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:underline">
                Update findings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ReviewStat label="Findings" value={stats.total} icon={ClipboardList} />
        <ReviewStat label="Verified" value={stats.verified} icon={CheckCircle2} tone="emerald" />
        <ReviewStat label="Unverified" value={stats.unverified} icon={AlertTriangle} tone="amber" />
        <ReviewStat label="Photos" value={stats.photos} icon={Camera} tone="sky" />
      </div>

      <Card padding="lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-brand-ink">Verification checklist</h2>
            <p className="text-xs text-brand-ink/50">
              {stats.verified} of {stats.total} findings verified
              {stats.high > 0 ? ` · ${stats.high} high risk` : ''}
              {stats.suggestions > 0 ? ` · ${stats.suggestions} AI suggestion(s)` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-brand-light">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${stats.total ? (stats.verified / stats.total) * 100 : 0}%` }}
              />
            </div>
            {stats.unverified > 0 && canReview && (
              <Button size="sm" variant="secondary" onClick={verifyAll} disabled={busy}>
                <Check className="h-3.5 w-3.5" /> Verify all
              </Button>
            )}
          </div>
        </div>

        {stats.unverified > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-button border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Verify every finding before approving. AI suggestions should be accepted, edited or dismissed.
          </div>
        )}

        <div className="mt-4 space-y-2">
          {sorted.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="h-5 w-5" />}
              title="No findings to review"
              description="The auditor needs to add findings before this audit can be approved."
              action={
                <Link to={`/audits/${id}/findings`} className="btn btn-secondary text-xs">
                  Go to findings
                </Link>
              }
            />
          ) : (
            sorted.map((finding) => {
              const verified = finding.status === 'verified';
              return (
                <div
                  key={finding.id}
                  className={cn(
                    'rounded-card border p-3 transition',
                    verified ? 'border-emerald-200 bg-emerald-50/30' : 'border-brand-border bg-white',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge level={finding.riskLevel} />
                    <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink/45">
                      {finding.section}
                    </span>
                    {finding.aiSource && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">
                        <Sparkles className="h-2.5 w-2.5" /> AI
                      </span>
                    )}
                    <span
                      className={cn(
                        'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
                      )}
                    >
                      {verified ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {verified ? 'Verified' : statusLabel(finding.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-brand-ink">{finding.identifiedHazards}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-ink/55">
                    <span className="font-semibold text-brand-ink/70">Control:</span>{' '}
                    {finding.recommendedControlMeasures}
                  </p>
                  {!verified && canReview && (
                    <div className="mt-2 flex justify-end">
                      <Button size="sm" onClick={() => verifyFinding(finding)}>
                        <Check className="h-3.5 w-3.5" /> Verify finding
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {!reviewable && (
        <div className="flex items-start gap-2 rounded-card border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          This audit is <span className="font-semibold">{statusLabel(audit.status)}</span>. The auditor must submit
          it for review before a decision can be made.
        </div>
      )}

      {!decision && (
        <Card padding="lg" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-ink">Ready to decide?</p>
              <p className="text-xs text-brand-ink/55">
                Approval unlocks report generation. Requesting changes sends this audit back to the auditor.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => setChangesOpen(true)}
              disabled={!canReview || !reviewable || busy}
            >
              <MessageSquareWarning className="h-4 w-4" /> Request changes
            </Button>
            <Button
              onClick={approve}
              disabled={!canReview || !reviewable || stats.total === 0 || stats.unverified > 0 || busy}
              title={
                stats.total === 0
                  ? 'There are no findings to approve'
                  : stats.unverified > 0
                    ? 'Verify all findings first'
                    : undefined
              }
            >
              <ThumbsUp className="h-4 w-4" /> Approve findings
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between border-t border-brand-border pt-4 text-xs text-brand-ink/45">
        <span>Reviewer: {user?.name ?? '—'}</span>
        <span>Last updated {formatDate(audit.updatedAt)}</span>
      </div>

      <Modal
        open={changesOpen}
        onClose={() => !busy && setChangesOpen(false)}
        title="Request changes"
        description="Explain what the auditor needs to fix or clarify."
        footer={
          <>
            <Button variant="secondary" onClick={() => setChangesOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" form="changes-form" variant="danger" disabled={busy}>
              {busy ? 'Sending…' : 'Request changes'}
            </Button>
          </>
        }
      >
        <form id="changes-form" onSubmit={requestChanges}>
          <label className="label" htmlFor="changes-reason">Reason for changes</label>
          <textarea
            id="changes-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setReasonError('');
            }}
            rows={4}
            className="input"
            placeholder="e.g. Please add photo evidence for the high-risk findings in the warehouse."
            autoFocus
          />
          {reasonError && <p className="mt-1 text-xs font-medium text-rose-600">{reasonError}</p>}
        </form>
      </Modal>
    </div>
  );
}

function ReviewStat({
  label,
  value,
  icon: Icon,
  tone = 'brand',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: 'brand' | 'emerald' | 'amber' | 'sky';
}) {
  const tones = {
    brand: 'bg-brand-primary/10 text-brand-primary',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
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
