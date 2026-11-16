import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { auditApi, companyApi, workplaceApi } from '@/api/client';
import type { AuditType, Company, Workplace } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Button, Card, Input, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';

const STEPS = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'workplace', label: 'Workplace', icon: MapPin },
  { key: 'type', label: 'Audit type', icon: ClipboardList },
  { key: 'details', label: 'Details', icon: CalendarDays },
  { key: 'photos', label: 'Photos', icon: Camera },
] as const;

const AUDIT_TYPES: Array<{ value: AuditType; label: string; description: string }> = [
  { value: 'initial', label: 'Initial audit', description: 'First full baseline inspection of a workplace.' },
  { value: 'periodic', label: 'Periodic review', description: 'Routine scheduled audit, e.g. every 6 or 12 months.' },
  { value: 'incident', label: 'Incident audit', description: 'Investigate an accident, near miss or complaint.' },
  { value: 'follow-up', label: 'Follow-up audit', description: 'Verify corrective actions from a previous audit.' },
];

export function AuditCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [form, setForm] = useState({
    companyId: '',
    workplaceId: '',
    type: 'initial' as AuditType,
    title: '',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [titleTouched, setTitleTouched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const companyData = await companyApi.list();
        const groups = await Promise.all(
          companyData.map((company) => workplaceApi.listByCompany(company.id).catch(() => [])),
        );
        if (cancelled) return;
        const allWorkplaces = groups.flat();
        setCompanies(companyData);
        setWorkplaces(allWorkplaces);

        const initialCompany = params.get('companyId') ?? '';
        const initialWorkplace = params.get('workplaceId') ?? '';
        const companyId = companyData.some((company) => company.id === initialCompany)
          ? initialCompany
          : '';
        const workplaceId =
          allWorkplaces.some((workplace) => workplace.id === initialWorkplace && workplace.companyId === companyId)
            ? initialWorkplace
            : '';
        setForm((current) => ({ ...current, companyId, workplaceId }));
        if (companyId && workplaceId) setStepIndex(2);
        else if (companyId) setStepIndex(1);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load companies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const company = companies.find((item) => item.id === form.companyId);
  const workplace = workplaces.find((item) => item.id === form.workplaceId);
  const companyWorkplaces = workplaces.filter((item) => item.companyId === form.companyId);
  const step = STEPS[stepIndex];

  const suggestedTitle = useMemo(() => {
    const parts = [];
    if (workplace?.name) parts.push(workplace.name);
    const typeLabel = AUDIT_TYPES.find((item) => item.value === form.type)?.label.replace(' audit', '');
    if (typeLabel) parts.push(typeLabel);
    parts.push('audit');
    return parts.join(' — ').replace(' — audit', ' audit');
  }, [workplace, form.type]);

  useEffect(() => {
    if (step.key === 'details' && !titleTouched) {
      setForm((current) => ({ ...current, title: current.title || suggestedTitle }));
    }
  }, [step.key, suggestedTitle, titleTouched]);

  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const canContinue = (() => {
    switch (step.key) {
      case 'company':
        return Boolean(form.companyId);
      case 'workplace':
        return Boolean(form.workplaceId);
      case 'type':
        return Boolean(form.type);
      case 'details':
        return Boolean(form.title.trim() && form.date);
      default:
        return true;
    }
  })();

  const addFiles = (files: File[]) => {
    const valid = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast(`${file.name} is not an image.`, 'error');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast(`${file.name} is larger than 10 MB.`, 'error');
        return false;
      }
      return true;
    });
    setPhotos((current) => [...current, ...valid]);
  };

  const handleSave = async () => {
    if (!form.companyId || !form.workplaceId) return;
    setSaving(true);
    setError('');
    try {
      const created = await auditApi.create({
        title: form.title.trim(),
        type: form.type,
        status: 'draft',
        companyId: form.companyId,
        workplaceId: form.workplaceId,
        auditorId: user?.id ?? 'u-1',
        scheduledDate: form.date,
        notes: form.notes.trim() || undefined,
      });

      if (photos.length) {
        const results = await Promise.allSettled(
          photos.map((file) => {
            const body = new FormData();
            body.append('file', file);
            body.append('caption', '');
            return auditApi.uploadPhoto(created.id, body);
          }),
        );
        const failed = results.filter((result) => result.status === 'rejected').length;
        if (failed) toast(`${failed} photo(s) could not be uploaded.`, 'error');
      }

      toast('Audit created as a draft.');
      navigate(`/audits/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create audit');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/audits"
        backLabel="All audits"
        eyebrow="New audit"
        title="Create an audit"
        subtitle="Pick the client, site and audit type. You can add findings after saving."
      />

      <Card padding="lg">
        <ol className="flex items-center gap-1">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            const complete = index < stepIndex;
            const active = index === stepIndex;
            return (
              <li key={item.key} className="flex flex-1 items-center gap-1">
                <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition',
                      complete
                        ? 'bg-brand-primary text-white'
                        : active
                          ? 'border-2 border-brand-primary bg-white text-brand-primary'
                          : 'border border-brand-border bg-brand-light text-brand-ink/40',
                    )}
                  >
                    {complete ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                  </span>
                  <span
                    className={cn(
                      'hidden text-[10px] font-semibold uppercase tracking-wide sm:block',
                      active ? 'text-brand-primary' : complete ? 'text-brand-ink/70' : 'text-brand-ink/35',
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      'mb-4 hidden h-px flex-1 sm:block',
                      complete ? 'bg-brand-primary' : 'bg-brand-border',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </Card>

      <Card padding="lg" className="min-h-[22rem]">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-brand-ink/40">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading companies…
          </div>
        ) : (
          <>
            {step.key === 'company' && (
              <section>
                <StepHeading
                  title="Which company is this audit for?"
                  description="Client organizations in your workspace."
                />
                {companies.length === 0 ? (
                  <div className="rounded-card border border-dashed border-brand-border p-8 text-center">
                    <Building2 className="mx-auto h-8 w-8 text-brand-ink/30" />
                    <p className="mt-2 text-sm font-semibold text-brand-ink">No companies yet</p>
                    <p className="mt-1 text-xs text-brand-ink/50">Add a client company first.</p>
                    <Link to="/companies" className="btn btn-primary mt-3 text-xs">
                      Go to companies
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {companies.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setForm({ ...form, companyId: item.id, workplaceId: '' })}
                        className={cn(
                          'rounded-card border p-3 text-left transition hover:border-brand-primary/50',
                          form.companyId === item.id
                            ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                            : 'border-brand-border bg-white',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-primary/10 text-brand-primary">
                            <Building2 className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-brand-ink">{item.name}</p>
                            <p className="text-[11px] text-brand-ink/50">{item.industry}</p>
                          </div>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-[11px] text-brand-ink/45">
                          <MapPin className="h-3 w-3" /> {item.workplaceCount} workplace(s)
                          <span className="mx-1">·</span>
                          {item.status}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {step.key === 'workplace' && (
              <section>
                <StepHeading
                  title="Choose the workplace"
                  description={company ? `Sites operated by ${company.name}.` : 'Select a company first.'}
                />
                {companyWorkplaces.length === 0 ? (
                  <div className="rounded-card border border-dashed border-brand-border p-8 text-center">
                    <MapPin className="mx-auto h-8 w-8 text-brand-ink/30" />
                    <p className="mt-2 text-sm font-semibold text-brand-ink">No workplaces yet</p>
                    <p className="mt-1 text-xs text-brand-ink/50">Add a site for this company to continue.</p>
                    {company && (
                      <Link to={`/companies/${company.id}/workplaces`} className="btn btn-primary mt-3 text-xs">
                        Add a workplace
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {companyWorkplaces.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setForm({ ...form, workplaceId: item.id })}
                        className={cn(
                          'rounded-card border p-3 text-left transition hover:border-brand-primary/50',
                          form.workplaceId === item.id
                            ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                            : 'border-brand-border bg-white',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-brand-ink">{item.name}</p>
                          <span className="text-[10px] font-semibold text-brand-ink/40">{item.status}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-brand-ink/50">
                          <MapPin className="h-3 w-3" /> {item.location}
                        </p>
                        <p className="mt-1 text-[11px] text-brand-ink/45">
                          {item.openFindings} open findings · {item.auditCount} audits
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {step.key === 'type' && (
              <section>
                <StepHeading
                  title="What kind of audit is this?"
                  description="This sets the default checklist and report wording."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {AUDIT_TYPES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: item.value })}
                      className={cn(
                        'rounded-card border p-3 text-left transition hover:border-brand-primary/50',
                        form.type === item.value
                          ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary'
                          : 'border-brand-border bg-white',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-brand-ink">{item.label}</p>
                        <span
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full border',
                            form.type === item.value
                              ? 'border-brand-primary bg-brand-primary text-white'
                              : 'border-brand-border',
                          )}
                        >
                          {form.type === item.value && <Check className="h-3 w-3" />}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-brand-ink/55">{item.description}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step.key === 'details' && (
              <section>
                <StepHeading title="Audit details" description="Give the audit a clear title and planned date." />
                <div className="grid gap-x-4 lg:grid-cols-2">
                  <div>
                    <Input
                      label="Audit title"
                      id="audit-title"
                      value={form.title}
                      onChange={(event) => {
                        setTitleTouched(true);
                        setForm({ ...form, title: event.target.value });
                      }}
                      placeholder={suggestedTitle}
                      required
                    />
                    {suggestedTitle && form.title !== suggestedTitle && (
                      <button
                        type="button"
                        onClick={() => {
                          setTitleTouched(true);
                          setForm({ ...form, title: suggestedTitle });
                        }}
                        className="mb-3 flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline"
                      >
                        <Sparkles className="h-3 w-3" /> Use suggested title
                      </button>
                    )}
                    <Input
                      label="Scheduled date"
                      id="audit-date"
                      type="date"
                      value={form.date}
                      onChange={(event) => setForm({ ...form, date: event.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="audit-notes">
                      Notes (optional)
                    </label>
                    <textarea
                      id="audit-notes"
                      value={form.notes}
                      onChange={(event) => setForm({ ...form, notes: event.target.value })}
                      rows={6}
                      className="input resize-none"
                      placeholder="Scope, areas to inspect, contacts on site…"
                    />
                  </div>
                </div>
              </section>
            )}

            {step.key === 'photos' && (
              <section>
                <StepHeading
                  title="Add inspection photos (optional)"
                  description="Photos can be analysed later for AI finding suggestions."
                />
                <div
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    addFiles(Array.from(event.dataTransfer.files));
                  }}
                  className="cursor-pointer rounded-card border-2 border-dashed border-brand-border p-8 text-center transition hover:border-brand-primary/50 hover:bg-brand-light/40"
                >
                  <ImagePlus className="mx-auto h-9 w-9 text-brand-ink/30" />
                  <p className="mt-2 text-sm font-semibold text-brand-ink">
                    Click to upload or drag photos here
                  </p>
                  <p className="mt-0.5 text-xs text-brand-ink/45">JPG, PNG or WEBP · up to 10 MB each</p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      addFiles(Array.from(event.target.files ?? []));
                      event.target.value = '';
                    }}
                  />
                </div>

                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {photos.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-button border border-brand-border">
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                          className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-rose-600 shadow transition hover:bg-white"
                          aria-label={`Remove ${file.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <p className="truncate bg-white px-2 py-1 text-[10px] text-brand-ink/55">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-card border border-brand-border bg-brand-light/60 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-brand-ink/45">Summary</p>
                  <div className="mt-1.5 grid gap-1 text-xs text-brand-ink/65 sm:grid-cols-2">
                    <p><span className="font-semibold text-brand-ink">Company:</span> {company?.name ?? '—'}</p>
                    <p><span className="font-semibold text-brand-ink">Workplace:</span> {workplace?.name ?? '—'}</p>
                    <p><span className="font-semibold text-brand-ink">Type:</span> {AUDIT_TYPES.find((item) => item.value === form.type)?.label}</p>
                    <p><span className="font-semibold text-brand-ink">Date:</span> {formatDate(form.date)}</p>
                  </div>
                </div>
              </section>
            )}

            {error && (
              <div className="mt-4 rounded-button border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}
          </>
        )}
      </Card>

      <div className="flex flex-col-reverse items-stretch justify-between gap-2 sm:flex-row sm:items-center">
        <Button
          variant="secondary"
          onClick={() => (stepIndex === 0 ? navigate('/audits') : setStepIndex((index) => index - 1))}
          disabled={saving}
        >
          <ChevronLeft className="h-4 w-4" /> {stepIndex === 0 ? 'Cancel' : 'Back'}
        </Button>
        <div className="flex items-center gap-2">
          {step.key === 'photos' && (
            <Button variant="ghost" onClick={handleSave} disabled={saving}>
              Skip photos
            </Button>
          )}
          {stepIndex < STEPS.length - 1 ? (
            <Button onClick={() => setStepIndex((index) => index + 1)} disabled={!canContinue || loading}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {saving ? 'Creating…' : 'Create draft audit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-brand-ink">{title}</h2>
      <p className="mt-0.5 text-xs text-brand-ink/50">{description}</p>
    </div>
  );
}
