import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  ImagePlus,
  ListChecks,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  UserRound,
} from 'lucide-react';
import { actionApi, auditApi, companyApi, reportApi, teamApi, workplaceApi } from '@/api/client';
import type { Action, Audit, AuditStatus, Company, Finding, Photo, Report, User, Workplace } from '@/types';
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
  StatusPill,
} from '@/components/ui';
import {
  ACTION_STATUS_STYLES,
  AUDIT_STATUS_STYLES,
  RISK_ORDER,
  formatDate,
  relativeTime,
  statusLabel,
} from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'findings' | 'photos' | 'actions' | 'report';

export function AuditDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [workplace, setWorkplace] = useState<Workplace | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<Tab>('findings');
  const [busy, setBusy] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [pendingPhotoDelete, setPendingPhotoDelete] = useState<Photo | null>(null);

  const canEdit = hasAnyRole(['admin', 'auditor']);
  const canReview = hasAnyRole(['admin', 'reviewer']);
  const isAdmin = hasAnyRole(['admin']);

  const load = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const auditData = await auditApi.get(id);
      const [companyData, workplaces, findingData, photoData, reportData, actionData, teamData] =
        await Promise.all([
          companyApi.get(auditData.companyId).catch(() => null),
          workplaceApi.listByCompany(auditData.companyId).catch(() => []),
          auditApi.findings(id),
          auditApi.photos(id),
          reportApi.list(),
          actionApi.list(),
          teamApi.list().catch(() => []),
        ]);
      setAudit(auditData);
      setCompany(companyData);
      setWorkplace(workplaces.find((item) => item.id === auditData.workplaceId) ?? null);
      setFindings(findingData);
      setPhotos(photoData);
      setReports(reportData.filter((report) => report.auditId === id));
      setActions(actionData.filter((action) => action.auditId === id));
      setTeam(teamData);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, [id]);

  const userLabel = (userId?: string) =>
    team.find((member) => member.id === userId)?.name ?? '—';

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const sortedFindings = useMemo(
    () => findings.slice().sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]),
    [findings],
  );

  const riskCounts = useMemo(
    () => ({
      HIGH: findings.filter((finding) => finding.riskLevel === 'HIGH').length,
      MEDIUM: findings.filter((finding) => finding.riskLevel === 'MEDIUM').length,
      LOW: findings.filter((finding) => finding.riskLevel === 'LOW').length,
    }),
    [findings],
  );

  const changeStatus = async (status: AuditStatus) => {
    setBusy(true);
    try {
      const updated = await auditApi.update(id, { status });
      setAudit(updated);
      toast(`Audit marked as ${statusLabel(status).toLowerCase()}.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update audit', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (findings.length === 0) {
      toast('Add at least one finding before submitting for review.', 'error');
      return;
    }
    await changeStatus('pending_review');
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast('Choose a photo first.', 'error');
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('caption', caption);
      await auditApi.uploadPhoto(id, body);
      toast('Photo added.');
      setUploadOpen(false);
      setFile(null);
      setCaption('');
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!pendingPhotoDelete) return;
    try {
      await auditApi.removePhoto(id, pendingPhotoDelete.id);
      toast('Photo removed.');
      setPendingPhotoDelete(null);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not remove photo', 'error');
    }
  };

  const handleDeleteAudit = async () => {
    setDeleting(true);
    try {
      await auditApi.remove(id);
      toast('Audit deleted.');
      navigate('/audits', { replace: true });
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not delete audit', 'error');
      setDeleting(false);
    }
  };

  const completeAction = async (action: Action) => {
    try {
      const updated = await actionApi.update(action.id, { status: 'completed' });
      setActions((current) => current.map((item) => (item.id === action.id ? updated : item)));
      toast('Corrective action completed.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not update action', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-card bg-brand-border/50" />
        <div className="h-40 animate-pulse rounded-card bg-brand-border/50" />
        <div className="h-64 animate-pulse rounded-card bg-brand-border/50" />
      </div>
    );
  }

  if (notFound || !audit) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-5 w-5" />}
        title="Audit not found"
        description="It may have been deleted, or the link is incorrect."
        action={
          <Link to="/audits" className="btn btn-primary">
            Back to audits
          </Link>
        }
      />
    );
  }

  const tabs: Array<{ key: Tab; label: string; count: number; icon: React.ElementType }> = [
    { key: 'findings', label: 'Findings', count: findings.length, icon: ListChecks },
    { key: 'photos', label: 'Photos', count: photos.length, icon: Camera },
    { key: 'actions', label: 'Actions', count: actions.length, icon: ClipboardCheck },
    { key: 'report', label: 'Report', count: reports.length, icon: FileText },
  ];

  const primaryAction = (() => {
    if (audit.status === 'draft' && canEdit) {
      return (
        <Button onClick={() => changeStatus('in_progress')} disabled={busy}>
          <ClipboardCheck className="h-4 w-4" /> Start audit
        </Button>
      );
    }
    if (audit.status === 'in_progress' && canEdit) {
      return (
        <Button onClick={handleSubmitForReview} disabled={busy}>
          <ShieldCheck className="h-4 w-4" /> Submit for review
        </Button>
      );
    }
    if (audit.status === 'pending_review' && canReview) {
      return (
        <Link to={`/audits/${id}/review`} className="btn btn-primary">
          <ShieldCheck className="h-4 w-4" /> Review findings
        </Link>
      );
    }
    if (audit.status === 'changes_requested' && canEdit) {
      return (
        <Button onClick={handleSubmitForReview} disabled={busy}>
          <ShieldCheck className="h-4 w-4" /> Resubmit for review
        </Button>
      );
    }
    if (audit.status === 'reviewed' && canReview) {
      return (
        <Button onClick={() => changeStatus('approved')} disabled={busy}>
          <CheckCircle2 className="h-4 w-4" /> Approve audit
        </Button>
      );
    }
    return (
      <Link to={`/audits/${id}/report`} className="btn btn-primary">
        <FileText className="h-4 w-4" /> Generate report
      </Link>
    );
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/audits"
        backLabel="All audits"
        eyebrow={`${statusLabel(audit.type)} audit`}
        title={audit.title}
        subtitle={`${company?.name ?? 'Company'} · ${workplace?.name ?? 'Workplace'}`}
        actions={
          <>
            {primaryAction}
            {canEdit && !['approved'].includes(audit.status) && (
              <Link to={`/audits/${id}/findings`} className="btn btn-secondary">
                <Pencil className="h-4 w-4" /> Findings
              </Link>
            )}
            {isAdmin && (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)} aria-label="Delete audit">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      />

      {audit.status === 'changes_requested' && (
        <div className="flex items-start gap-2 rounded-card border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Changes requested by the reviewer</p>
            <p className="mt-0.5 leading-relaxed text-rose-800/75">
              {audit.reviewNotes || 'Open the review to see what needs to change.'}
            </p>
          </div>
        </div>
      )}

      <Card padding="lg">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill label={audit.status} className={AUDIT_STATUS_STYLES[audit.status]} />
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] font-semibold capitalize text-brand-ink/60">
            {audit.type.replace('-', ' ')}
          </span>
          <span className="text-xs text-brand-ink/45">Updated {relativeTime(audit.updatedAt)}</span>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="Company" value={company?.name ?? '—'} icon={ClipboardList} hint={company?.industry} />
          <Meta label="Workplace" value={workplace?.name ?? '—'} icon={MapPin} hint={workplace?.location} />
          <Meta label="Auditor" value={userLabel(audit.auditorId)} icon={UserRound} hint="Lead inspector" />
          <Meta label="Reviewer" value={userLabel(audit.reviewerId)} icon={ShieldCheck} hint="Approves findings" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-button bg-brand-light/60 px-3 py-2 text-xs text-brand-ink/60">
            <CalendarDays className="h-3.5 w-3.5" /> Scheduled {formatDate(audit.scheduledDate)}
          </div>
          <div className="flex items-center gap-2 rounded-button bg-brand-light/60 px-3 py-2 text-xs text-brand-ink/60">
            <FileText className="h-3.5 w-3.5" /> Created {formatDate(audit.createdAt)}
          </div>
        </div>

        {audit.notes && (
          <div className="mt-4 rounded-button border border-brand-border bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">Scope notes</p>
            <p className="mt-1 text-sm leading-relaxed text-brand-ink/65">{audit.notes}</p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card padding="none" className="xl:col-span-2">
          <div className="flex gap-1 overflow-x-auto border-b border-brand-border px-2 pt-2">
            {tabs.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-t-button px-3 py-2 text-xs font-semibold transition',
                    tab === item.key
                      ? 'border-b-2 border-brand-primary bg-brand-light/60 text-brand-primary'
                      : 'text-brand-ink/50 hover:text-brand-ink',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      tab === item.key ? 'bg-brand-primary/10 text-brand-primary' : 'bg-brand-light text-brand-ink/50',
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4">
            {tab === 'findings' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-brand-ink/50">
                    {findings.length} finding(s), highest risk first.
                  </p>
                  {canEdit && (
                    <Link to={`/audits/${id}/findings`} className="text-xs font-semibold text-brand-primary hover:underline">
                      Manage findings
                    </Link>
                  )}
                </div>
                {sortedFindings.length === 0 ? (
                  <EmptyState
                    icon={<AlertTriangle className="h-5 w-5" />}
                    title="No findings recorded"
                    description="Add findings manually or use photo analysis to generate suggestions."
                    action={
                      canEdit ? (
                        <Link to={`/audits/${id}/findings`} className="btn btn-primary text-xs">
                          Add findings
                        </Link>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="space-y-2.5">
                    {sortedFindings.map((finding) => (
                      <div key={finding.id} className="rounded-card border border-brand-border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <RiskBadge level={finding.riskLevel} />
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-ink/40">
                            {finding.section}
                          </span>
                          {finding.aiSource && (
                            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">
                              AI {finding.confidence ? `${finding.confidence}%` : ''}
                            </span>
                          )}
                          <span
                            className={cn(
                              'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold',
                              finding.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700'
                                : finding.status === 'ai_suggestion'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600',
                            )}
                          >
                            {statusLabel(finding.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-brand-ink">{finding.identifiedHazards}</p>
                        <p className="mt-1 text-xs leading-relaxed text-brand-ink/55">
                          <span className="font-semibold text-brand-ink/70">Control:</span>{' '}
                          {finding.recommendedControlMeasures}
                        </p>
                        {finding.photoRefs.length > 0 && (
                          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-brand-ink/40">
                            <Camera className="h-3 w-3" /> {finding.photoRefs.length} linked photo(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'photos' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-brand-ink/50">Photo evidence for this inspection.</p>
                  {canEdit && (
                    <Button size="sm" onClick={() => setUploadOpen(true)}>
                      <ImagePlus className="h-3.5 w-3.5" /> Upload
                    </Button>
                  )}
                </div>
                {photos.length === 0 ? (
                  <EmptyState
                    icon={<Camera className="h-5 w-5" />}
                    title="No photos yet"
                    description="Upload site photos to support findings and AI analysis."
                    action={
                      canEdit ? (
                        <Button size="sm" onClick={() => setUploadOpen(true)}>
                          Upload photo
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo) => (
                      <div key={photo.id} className="group overflow-hidden rounded-card border border-brand-border">
                        <button
                          onClick={() => setSelectedPhoto(photo)}
                          className="relative block w-full overflow-hidden"
                        >
                          <img src={photo.url} alt={photo.caption || photo.filename} className="h-32 w-full object-cover transition group-hover:scale-105" />
                        </button>
                        <div className="flex items-start justify-between gap-1 p-2">
                          <p className="line-clamp-2 text-[11px] text-brand-ink/60">{photo.caption || photo.filename}</p>
                          {canEdit && (
                            <button
                              onClick={() => setPendingPhotoDelete(photo)}
                              className="shrink-0 rounded p-1 text-brand-ink/35 hover:bg-rose-50 hover:text-rose-600"
                              aria-label="Delete photo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'actions' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-brand-ink/50">Corrective actions raised from this audit.</p>
                  <Link to="/actions" className="text-xs font-semibold text-brand-primary hover:underline">
                    Manage actions
                  </Link>
                </div>
                {actions.length === 0 ? (
                  <EmptyState
                    icon={<ClipboardCheck className="h-5 w-5" />}
                    title="No corrective actions"
                    description="Create actions from the Corrective actions page to track remedies."
                    action={
                      <Link to="/actions" className="btn btn-secondary text-xs">
                        Go to actions
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {actions.map((action) => (
                      <div key={action.id} className="flex flex-wrap items-center gap-2 rounded-button border border-brand-border p-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-brand-ink">{action.title}</p>
                          <p className="text-[10px] text-brand-ink/45">
                            {action.responsible} · due {formatDate(action.deadline)}
                          </p>
                        </div>
                        <RiskBadge level={action.priority} />
                        <StatusPill label={action.status} className={ACTION_STATUS_STYLES[action.status]} dot={false} />
                        {action.status !== 'completed' && canEdit && (
                          <Button size="sm" variant="secondary" onClick={() => completeAction(action)}>
                            <CheckCircle2 className="h-3 w-3" /> Done
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'report' && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-brand-ink/50">Generated reports for this audit.</p>
                  <Link to={`/audits/${id}/report`} className="btn btn-primary text-xs">
                    <FileText className="h-3.5 w-3.5" /> Generate
                  </Link>
                </div>
                {reports.length === 0 ? (
                  <EmptyState
                    icon={<FileText className="h-5 w-5" />}
                    title="No report generated"
                    description="Generate a PDF or DOCX audit report from verified findings."
                    action={
                      <Link to={`/audits/${id}/report`} className="btn btn-primary text-xs">
                        Set up report
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center gap-3 rounded-button border border-brand-border p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-brand-ink">
                            Version {report.version} · {report.format}
                          </p>
                          <p className="text-[10px] text-brand-ink/45">
                            {formatDate(report.createdAt)} · {statusLabel(report.status)}
                          </p>
                        </div>
                        <Link to="/reports" className="btn btn-secondary px-2 py-1 text-[11px]">
                          <Download className="h-3 w-3" /> Open
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card padding="lg">
            <h2 className="text-sm font-bold text-brand-ink">Risk breakdown</h2>
            <div className="mt-3 space-y-2">
              <RiskLine label="High risk" count={riskCounts.HIGH} total={findings.length} className="bg-red-500" />
              <RiskLine label="Medium risk" count={riskCounts.MEDIUM} total={findings.length} className="bg-amber-500" />
              <RiskLine label="Low risk" count={riskCounts.LOW} total={findings.length} className="bg-emerald-500" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-button bg-brand-light px-2 py-2 text-center">
                <p className="text-lg font-bold text-brand-ink">{photos.length}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Photos</p>
              </div>
              <div className="rounded-button bg-brand-light px-2 py-2 text-center">
                <p className="text-lg font-bold text-brand-ink">
                  {findings.filter((finding) => finding.status === 'verified').length}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/40">Verified</p>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-bold text-brand-ink">Audit workflow</h2>
            <ol className="mt-3 space-y-3">
              <WorkflowStep
                done={['in_progress', 'pending_review', 'reviewed', 'approved'].includes(audit.status)}
                active={audit.status === 'draft'}
                title="Capture evidence"
                description="Add photos and findings."
              />
              <WorkflowStep
                done={['pending_review', 'reviewed', 'approved'].includes(audit.status)}
                active={audit.status === 'in_progress'}
                title="Submit for review"
                description="Send findings to a reviewer."
              />
              <WorkflowStep
                done={['reviewed', 'approved'].includes(audit.status)}
                active={audit.status === 'pending_review' || audit.status === 'changes_requested'}
                title="Review & approve"
                description="Verify or request changes."
              />
              <WorkflowStep
                done={audit.status === 'approved'}
                active={reports.length > 0}
                title="Generate report"
                description="Produce the final document."
              />
            </ol>
            <div className="mt-4 flex flex-col gap-2">
              <Link to={`/audits/${id}/review`} className="btn btn-secondary w-full text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Review page
              </Link>
              <Link to={`/audits/${id}/report`} className="btn btn-secondary w-full text-xs">
                <FileText className="h-3.5 w-3.5" /> Report setup
              </Link>
            </div>
          </Card>

          {isAdmin && (
            <Card padding="lg" className="border-rose-200 bg-rose-50/30">
              <h2 className="text-sm font-bold text-brand-ink">Danger zone</h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-ink/55">
                Deleting this audit also removes its findings, photos and reports.
              </p>
              <Button variant="danger" size="sm" className="mt-3 w-full" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete audit
              </Button>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        title="Upload photo"
        description="Add an image and a short caption for the audit record."
        footer={
          <>
            <Button variant="secondary" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" form="photo-form" disabled={uploading || !file}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Upload photo'}
            </Button>
          </>
        }
      >
        <form id="photo-form" onSubmit={handleUpload}>
          <label className="label" htmlFor="photo-file">Image</label>
          <input
            id="photo-file"
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="input py-2 text-xs"
          />
          {preview && (
            <img src={preview} alt="Preview" className="mt-3 h-40 w-full rounded-button object-cover" />
          )}
          <div className="mt-3">
            <Input
              label="Caption"
              id="photo-caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="e.g. Missing guard on conveyor 2"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.caption || selectedPhoto?.filename || 'Photo'}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelectedPhoto(null)}>
            Close
          </Button>
        }
      >
        {selectedPhoto && (
          <img src={selectedPhoto.url} alt={selectedPhoto.caption || selectedPhoto.filename} className="max-h-[60vh] w-full rounded-button object-contain" />
        )}
      </Modal>

      <Modal
        open={pendingPhotoDelete !== null}
        onClose={() => setPendingPhotoDelete(null)}
        title="Remove photo?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingPhotoDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handlePhotoDelete}>Remove</Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          This removes “{pendingPhotoDelete?.caption || pendingPhotoDelete?.filename}” from the audit.
        </p>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        title="Delete this audit?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAudit} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete audit'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          <span className="font-semibold text-brand-ink">{audit.title}</span> and all of its findings,
          photos and reports will be removed. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function Meta({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-brand-light text-brand-ink/50">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">{label}</p>
        <p className="truncate text-sm font-semibold text-brand-ink">{value}</p>
        {hint && <p className="truncate text-[11px] text-brand-ink/45">{hint}</p>}
      </div>
    </div>
  );
}

function RiskLine({
  label,
  count,
  total,
  className,
}: {
  label: string;
  count: number;
  total: number;
  className: string;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-brand-ink/60">{label}</span>
        <span className="font-semibold text-brand-ink">{count}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-light">
        <div className={cn('h-full rounded-full', className)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function WorkflowStep({
  done,
  active,
  title,
  description,
}: {
  done: boolean;
  active: boolean;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          done
            ? 'bg-emerald-100 text-emerald-700'
            : active
              ? 'bg-brand-primary text-white'
              : 'bg-brand-light text-brand-ink/40',
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : active ? <ArrowRight className="h-3 w-3" /> : '•'}
      </span>
      <div>
        <p className={cn('text-xs font-semibold', done || active ? 'text-brand-ink' : 'text-brand-ink/50')}>
          {title}
        </p>
        <p className="text-[11px] text-brand-ink/45">{description}</p>
      </div>
    </li>
  );
}
