import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Calendar, FileText, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditApi } from '@/api/client';
import { Button, Card, Input } from '@/components/ui';
import { COMPANIES, WORKPLACES } from '@/types';

const STEPS = [
  { key: 'company', label: 'Select company', icon: Building2 },
  { key: 'workplace', label: 'Select workplace', icon: Building2 },
  { key: 'type', label: 'Audit type', icon: FileText },
  { key: 'details', label: 'Audit details', icon: Calendar },
  { key: 'photos', label: 'Photographs', icon: Image },
];

const AUDIT_TYPES = [
  { key: 'initial', label: 'Initial audit' },
  { key: 'periodic', label: 'Periodic review' },
  { key: 'incident', label: 'Incident audit' },
  { key: 'follow-up', label: 'Follow-up audit' },
];

export function AuditCreate() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    companyId: '' as string,
    workplaceId: '' as string,
    type: '' as string,
    title: '',
    date: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
const fileInput = useRef<HTMLInputElement>(null);

  const company = COMPANIES.find((c) => c.id === form.companyId);
  const workplace = WORKPLACES.find((w) => w.id === form.workplaceId);
  const step = STEPS[stepIndex];

  const canNext = () => {
    switch (step.key) {
      case 'company': return !!form.companyId;
      case 'workplace': return !!form.workplaceId;
      case 'type': return !!form.type;
      case 'details': return !!form.title && !!form.date;
      case 'photos': return true;
      default: return false;
    }
  };

  const handleSave = async () => {
    const created = await auditApi.create({
      title: form.title || `${company?.name} — ${workplace?.name} audit`,
      type: form.type as any,
      status: 'draft',
      companyId: form.companyId,
      workplaceId: form.workplaceId,
      auditorId: 'u-1',
    });
    navigate(`/audits/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/audits" className="text-sm text-brand-primary hover:underline">&larr; Back to audits</Link>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-brand-ink/70 uppercase tracking-wider">Create audit</span>
          <span className="text-xs text-brand-ink/60">{stepIndex + 1} of {STEPS.length}</span>
        </div>
        <div className="flex w-full gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 relative">
              <div className={`h-1 absolute top-1/2 left-0 right-0 ${i < stepIndex ? 'bg-brand-primary' : 'bg-brand-border'}`} />
              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1 ${
                i < stepIndex ? 'bg-brand-primary text-white' : i === stepIndex ? 'bg-white border-2 border-brand-primary text-brand-primary' : 'bg-brand-light text-brand-ink/60 border border-brand-border'
              }`}>{i + 1}</div>
              <span className={`text-xs text-center block ${i === stepIndex ? 'text-brand-primary font-semibold' : 'text-brand-ink/60'}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {step.key === 'company' && (
            <>
              <p className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">Choose the client company for this audit.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {COMPANIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setForm({ ...form, companyId: c.id, workplaceId: '' })}
                    className={`card cursor-pointer text-left p-3 hover:border-brand-primary/50 transition ${form.companyId === c.id ? 'border-brand-primary bg-brand-light/50' : 'border-brand-border'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-light/50 flex items-center justify-center text-brand-primary mb-2">
                      {c.name.split(' ').map((w: string) => w[0]).join('')}
                    </div>
                    <h4 className="font-semibold text-brand-ink">{c.name}</h4>
                    <p className="text-xs text-brand-ink/60">{c.industry}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-brand-ink/60">Selected: {company?.name || '—'}</p>
              </div>
            </>
          )}
          {step.key === 'workplace' && (
            <>
              <p className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">Choose the workplace/site to audit.</p>
              {company ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORKPLACES.filter((w) => w.companyId === company.id).map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setForm({ ...form, workplaceId: w.id })}
                      className={`card cursor-pointer text-left p-3 hover:border-brand-primary/50 transition ${form.workplaceId === w.id ? 'border-brand-primary bg-brand-light/50' : 'border-brand-border'}`}
                    >
                      <h4 className="font-semibold text-brand-ink">{w.name}</h4>
                      <p className="text-xs text-brand-ink/60">{w.location}</p>
                      <p className="text-xs text-brand-ink/60 mt-1">{w.openFindings} open findings • {w.auditCount} audits</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-brand-ink/60">Select a company first.</p>
              )}
            </>
          )}
          {step.key === 'type' && (
            <>
              <p className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">What kind of audit is this?</p>
              <div className="space-y-3">
                {AUDIT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setForm({ ...form, type: t.key })}
                    className={`w-full text-left p-3 rounded-button border ${form.type === t.key ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white border-brand-border text-brand-ink hover:bg-brand-light'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {step.key === 'details' && (
            <>
              <p className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">Audit details</p>
              <Input label="Audit title" placeholder="e.g. Plant A — Initial safety audit" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Audit date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </>
          )}
          {step.key === 'photos' && (
            <>
              <p className="text-xs font-semibold text-brand-ink/70 uppercase mb-3">Upload inspection photographs (optional). Images only.</p>
              <div className="border-2 border-dashed border-brand-border rounded-card p-6 text-center hover:border-brand-primary/50 transition cursor-pointer" onClick={() => fileInput.current?.click()}>
                <Image className="w-10 h-10 text-brand-ink/60 mx-auto mb-2" />
                <p className="text-sm text-brand-ink/70">Click to upload photos</p>
                <p className="text-xs text-brand-ink/60">JPG, PNG, WEBP • up to 50 MB</p>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = Array.from(e.target.files ?? []);
                  setPhotos((prev) => [...prev, ...files]);
                }} />
              </div>
              {photos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {photos.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-brand-ink/60">{p.name}</span>
                      <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="text-red-600 hover:underline text-xs">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-8 flex justify-between">
          {stepIndex > 0 && (
            <Button variant="secondary" onClick={() => setStepIndex((i) => i - 1)}><ChevronLeft className="w-4 h-4 mr-2" /> Back</Button>
          )}
          {stepIndex < STEPS.length - 1 ? (
            <Button disabled={!canNext()} onClick={() => setStepIndex((i) => i + 1)}>
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!canNext()}>Save draft & continue</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
