import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Camera,
  Check,
  CheckCircle2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { auditApi } from '@/api/client';
import type { Audit, Finding, Photo, RiskLevel } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  RiskBadge,
  Select,
} from '@/components/ui';
import { RISK_ORDER, statusLabel } from '@/lib/format';
import { cn } from '@/lib/cn';

type FindingDraft = {
  section: string;
  riskLevel: RiskLevel;
  identifiedHazards: string;
  recommendedControlMeasures: string;
  photoRefs: string[];
};

const EMPTY_DRAFT: FindingDraft = {
  section: '',
  riskLevel: 'MEDIUM',
  identifiedHazards: '',
  recommendedControlMeasures: '',
  photoRefs: [],
};

const SECTION_SUGGESTIONS = [
  'Walkways & exits',
  'Machinery & guarding',
  'Electrical safety',
  'Fire safety',
  'Chemical storage',
  'PPE & signage',
  'Housekeeping',
  'Ergonomics',
  'First aid',
];

export function Findings() {
  const { id = '' } = useParams();
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | RiskLevel | 'verified' | 'suggested'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Finding | null>(null);
  const [draft, setDraft] = useState<FindingDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Finding | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canEdit = hasAnyRole(['admin', 'auditor']);
  const canVerify = hasAnyRole(['admin', 'reviewer', 'auditor']);

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
      toast(err instanceof Error ? err.message : 'Could not load findings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const counts = useMemo(
    () => ({
      HIGH: findings.filter((finding) => finding.riskLevel === 'HIGH').length,
      MEDIUM: findings.filter((finding) => finding.riskLevel === 'MEDIUM').length,
      LOW: findings.filter((finding) => finding.riskLevel === 'LOW').length,
      verified: findings.filter((finding) => finding.status === 'verified').length,
      suggested: findings.filter((finding) => finding.status === 'ai_suggestion').length,
    }),
    [findings],
  );

  const filtered = useMemo(() => {
    const sorted = findings.slice().sort((a, b) => RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel]);
    if (filter === 'all') return sorted;
    if (filter === 'verified') return sorted.filter((finding) => finding.status === 'verified');
    if (filter === 'suggested') return sorted.filter((finding) => finding.status === 'ai_suggestion');
    return sorted.filter((finding) => finding.riskLevel === filter);
  }, [findings, filter]);

  const openCreate = () => {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (finding: Finding) => {
    setEditing(finding);
    setDraft({
      section: finding.section,
      riskLevel: finding.riskLevel,
      identifiedHazards: finding.identifiedHazards,
      recommendedControlMeasures: finding.recommendedControlMeasures,
      photoRefs: finding.photoRefs,
    });
    setError('');
    setFormOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.section.trim() || !draft.identifiedHazards.trim() || !draft.recommendedControlMeasures.trim()) {
      setError('Section, hazard and control measure are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await auditApi.updateFinding(id, editing.id, {
          ...draft,
          section: draft.section.trim(),
          identifiedHazards: draft.identifiedHazards.trim(),
          recommendedControlMeasures: draft.recommendedControlMeasures.trim(),
        });
        setFindings((current) => current.map((finding) => (finding.id === updated.id ? updated : finding)));
        toast('Finding updated.');
      } else {
        const created = await auditApi.addFinding(id, {
          ...draft,
          section: draft.section.trim(),
          identifiedHazards: draft.identifiedHazards.trim(),
          recommendedControlMeasures: draft.recommendedControlMeasures.trim(),
          status: 'unreviewed',
        });
        setFindings((current) => [...current, created]);
        toast('Finding added.');
      }
      setFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save finding');
    } finally {
      setSaving(false);
    }
  };

  const verify = async (finding: Finding) => {
    try {
      const updated = await auditApi.updateFinding(id, finding.id, { status: 'verified' });
      setFindings((current) => current.map((item) => (item.id === finding.id ? updated : item)));
      toast('Finding verified.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not verify finding', 'error');
    }
  };

  const dismiss = async (finding: Finding) => {
    try {
      await auditApi.removeFinding(id, finding.id);
      setFindings((current) => current.filter((item) => item.id !== finding.id));
      toast('AI suggestion dismissed.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not remove finding', 'error');
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await auditApi.removeFinding(id, pendingDelete.id);
      setFindings((current) => current.filter((item) => item.id !== pendingDelete.id));
      toast('Finding deleted.');
      setPendingDelete(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not delete finding', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await auditApi.analyze(id);
      setFindings((current) => [...current, ...result.findings]);
      if (result.findings.length) {
        toast(`${result.findings.length} AI suggestion(s) added. Review each one before verifying.`);
      } else {
        toast('No new suggestions found.', 'error');
      }
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Analysis failed', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-card bg-brand-border/50" />;
  }

  const photoById = (photoId: string) => photos.find((photo) => photo.id === photoId);

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={`/audits/${id}`}
        backLabel="Back to audit"
        eyebrow="Findings"
        title={audit?.title ?? 'Audit findings'}
        subtitle="Record hazards, agree control measures and verify AI suggestions."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
                <Sparkles className="h-4 w-4" /> {analyzing ? 'Analysing…' : 'Analyse photos'}
              </Button>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add finding
              </Button>
            </>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <RiskSummary label="High risk" value={counts.HIGH} tone="danger" active={filter === 'HIGH'} onClick={() => setFilter('HIGH')} />
        <RiskSummary label="Medium risk" value={counts.MEDIUM} tone="amber" active={filter === 'MEDIUM'} onClick={() => setFilter('MEDIUM')} />
        <RiskSummary label="Low risk" value={counts.LOW} tone="emerald" active={filter === 'LOW'} onClick={() => setFilter('LOW')} />
        <RiskSummary label="Verified" value={counts.verified} tone="brand" active={filter === 'verified'} onClick={() => setFilter('verified')} />
        <RiskSummary label="AI suggested" value={counts.suggested} tone="violet" active={filter === 'suggested'} onClick={() => setFilter('suggested')} />
      </div>

      {!canEdit && (
        <div className="rounded-card border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
          You have read-only access. Reviewers can verify findings, but only admins and auditors can edit them.
        </div>
      )}

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" count={findings.length} active={filter === 'all'} onClick={() => setFilter('all')} />
          <FilterChip label="High" count={counts.HIGH} active={filter === 'HIGH'} onClick={() => setFilter('HIGH')} />
          <FilterChip label="Medium" count={counts.MEDIUM} active={filter === 'MEDIUM'} onClick={() => setFilter('MEDIUM')} />
          <FilterChip label="Low" count={counts.LOW} active={filter === 'LOW'} onClick={() => setFilter('LOW')} />
          <FilterChip label="Verified" count={counts.verified} active={filter === 'verified'} onClick={() => setFilter('verified')} />
          <FilterChip label="AI" count={counts.suggested} active={filter === 'suggested'} onClick={() => setFilter('suggested')} />
        </div>
        <p className="text-xs text-brand-ink/45">
          {photos.length} photo(s) available for analysis
        </p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-5 w-5" />}
          title={findings.length ? 'No findings match this filter' : 'No findings recorded yet'}
          description={
            findings.length
              ? 'Choose another risk level or show all findings.'
              : 'Add a finding manually, or upload photos and let the AI assistant suggest hazards.'
          }
          action={
            canEdit ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add finding
                </Button>
                <Button variant="secondary" onClick={handleAnalyze} disabled={analyzing}>
                  <Sparkles className="h-4 w-4" /> Analyse photos
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((finding) => {
            const linkedPhotos = finding.photoRefs
              .map((photoId) => photoById(photoId))
              .filter((photo): photo is Photo => Boolean(photo));
            return (
              <Card key={finding.id} padding="lg" className="border-l-4" style={{ borderLeftColor: finding.riskLevel === 'HIGH' ? '#EF4444' : finding.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981' }}>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={finding.riskLevel} />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink/45">
                    {finding.section || 'General'}
                  </span>
                  {finding.aiSource && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-200">
                      <Sparkles className="h-2.5 w-2.5" /> AI {finding.confidence ? `${finding.confidence}%` : ''}
                    </span>
                  )}
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                      finding.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        : finding.status === 'ai_suggestion'
                          ? 'bg-amber-50 text-amber-700 ring-amber-200'
                          : 'bg-slate-100 text-slate-600 ring-slate-200',
                    )}
                  >
                    {statusLabel(finding.status)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">Identified hazard</p>
                    <p className="mt-1 text-sm leading-relaxed text-brand-ink">{finding.identifiedHazards}</p>
                  </div>
                  <div className="rounded-button bg-brand-light/70 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/40">Recommended control</p>
                    <p className="mt-1 text-sm leading-relaxed text-brand-ink/70">{finding.recommendedControlMeasures}</p>
                  </div>
                </div>

                {linkedPhotos.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Camera className="h-3.5 w-3.5 text-brand-ink/35" />
                    {linkedPhotos.slice(0, 4).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt={photo.caption || photo.filename}
                        title={photo.caption || photo.filename}
                        className="h-10 w-10 rounded border border-brand-border object-cover"
                      />
                    ))}
                    {linkedPhotos.length > 4 && (
                      <span className="text-[10px] text-brand-ink/45">+{linkedPhotos.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-brand-border pt-3">
                  {finding.status === 'ai_suggestion' && canVerify && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => dismiss(finding)}>
                        <X className="h-3.5 w-3.5" /> Dismiss
                      </Button>
                      <Button size="sm" onClick={() => verify(finding)}>
                        <Check className="h-3.5 w-3.5" /> Accept
                      </Button>
                    </>
                  )}
                  {finding.status !== 'verified' && finding.status !== 'ai_suggestion' && canVerify && (
                    <Button size="sm" onClick={() => verify(finding)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                    </Button>
                  )}
                  {canEdit && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(finding)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setPendingDelete(finding)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-brand-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-brand-ink/50">
          {findings.length} finding{findings.length === 1 ? '' : 's'} · {counts.verified} verified
        </span>
        <div className="flex gap-2">
          <Link to={`/audits/${id}`} className="btn btn-secondary">
            Back to audit
          </Link>
          <Link to={`/audits/${id}/review`} className="btn btn-primary">
            Continue to review <CheckCircle2 className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit finding' : 'Add finding'}
        description="Describe the hazard and the control measure agreed with the client."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="finding-form" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add finding'}
            </Button>
          </>
        }
      >
        <form id="finding-form" onSubmit={handleSave} className="space-y-3">
          <div className="grid gap-x-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="finding-section">Section in the workplace</label>
              <input
                id="finding-section"
                list="section-suggestions"
                value={draft.section}
                onChange={(event) => setDraft({ ...draft, section: event.target.value })}
                className="input"
                placeholder="e.g. Machinery & guarding"
                required
              />
              <datalist id="section-suggestions">
                {SECTION_SUGGESTIONS.map((section) => (
                  <option key={section} value={section} />
                ))}
              </datalist>
            </div>
            <Select
              label="Risk level"
              id="finding-risk"
              value={draft.riskLevel}
              onChange={(event) => setDraft({ ...draft, riskLevel: event.target.value as RiskLevel })}
            >
              <option value="HIGH">High — stop work / immediate action</option>
              <option value="MEDIUM">Medium — fix within weeks</option>
              <option value="LOW">Low — monitor / housekeeping</option>
            </Select>
          </div>
          <div>
            <label className="label" htmlFor="finding-hazard">Identified hazard</label>
            <textarea
              id="finding-hazard"
              value={draft.identifiedHazards}
              onChange={(event) => setDraft({ ...draft, identifiedHazards: event.target.value })}
              rows={3}
              className="input"
              placeholder="What is unsafe, where, and who could be harmed?"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="finding-control">Recommended control measures</label>
            <textarea
              id="finding-control"
              value={draft.recommendedControlMeasures}
              onChange={(event) => setDraft({ ...draft, recommendedControlMeasures: event.target.value })}
              rows={3}
              className="input"
              placeholder="What should be done, by whom, and by when?"
              required
            />
          </div>

          {photos.length > 0 && (
            <div>
              <p className="label">Link photo evidence</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((photo) => {
                  const selected = draft.photoRefs.includes(photo.id);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          photoRefs: selected
                            ? draft.photoRefs.filter((photoId) => photoId !== photo.id)
                            : [...draft.photoRefs, photo.id],
                        })
                      }
                      className={cn(
                        'relative overflow-hidden rounded-button border-2 transition',
                        selected ? 'border-brand-primary' : 'border-transparent hover:border-brand-border',
                      )}
                    >
                      <img src={photo.url} alt={photo.caption || photo.filename} className="h-16 w-full object-cover" />
                      {selected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete finding?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete finding'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-brand-ink/60">
          The hazard record will be permanently removed from this audit.
        </p>
      </Modal>
    </div>
  );
}

function RiskSummary({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: 'danger' | 'amber' | 'emerald' | 'brand' | 'violet';
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    danger: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    brand: 'text-brand-primary bg-brand-primary/10',
    violet: 'text-violet-600 bg-violet-50',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-card border bg-white px-3 py-2.5 text-left transition hover:border-brand-primary/40',
        active ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-brand-border',
      )}
    >
      <span className={cn('inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold', tones[tone])}>{label}</span>
      <p className="mt-1 text-xl font-bold text-brand-ink">{value}</p>
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-semibold transition',
        active ? 'bg-brand-primary text-white' : 'bg-brand-light text-brand-ink/60 hover:text-brand-ink',
      )}
    >
      {label} <span className="ml-1 opacity-70">{count}</span>
    </button>
  );
}
