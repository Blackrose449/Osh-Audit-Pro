import { http, HttpResponse, delay } from 'msw';
import type {
  Action,
  Audit,
  Company,
  Finding,
  Photo,
  Report,
  User,
  Workplace,
} from '@/types';
import { SEED_USERS, COMPANIES, WORKPLACES } from '@/types';
import { removeStore, readStore, writeStore } from '@/lib/storage';

const DATA_KEY = 'data-v1';

interface StoreData {
  companies: Company[];
  workplaces: Workplace[];
  audits: Audit[];
  findings: Finding[];
  photos: Photo[];
  reports: Report[];
  actions: Action[];
  users: User[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function seedData(): StoreData {
  return {
    companies: clone(COMPANIES),
    workplaces: clone(WORKPLACES),
    users: clone(SEED_USERS),
    audits: [
      {
        id: 'a-1',
        orgId: 'org-1',
        companyId: 'c-1',
        workplaceId: 'w-1',
        type: 'initial',
        status: 'approved',
        title: 'Plant A — Initial Safety Audit',
        auditorId: 'u-1',
        reviewerId: 'u-3',
        scheduledDate: '2025-10-10',
        notes: 'Baseline audit covering the press line, packing and dispatch areas.',
        createdAt: '2025-10-10T09:00:00Z',
        updatedAt: '2025-10-11T14:00:00Z',
        photoCount: 2,
        findingCount: 3,
      },
      {
        id: 'a-2',
        orgId: 'org-1',
        companyId: 'c-2',
        workplaceId: 'w-4',
        type: 'periodic',
        status: 'pending_review',
        title: 'Depot North — Periodic Review',
        auditorId: 'u-2',
        reviewerId: 'u-3',
        scheduledDate: '2025-09-20',
        notes: 'Quarterly review of fuel handling and cargo movement.',
        createdAt: '2025-09-20T08:00:00Z',
        updatedAt: '2025-09-21T10:00:00Z',
        photoCount: 1,
        findingCount: 4,
      },
      {
        id: 'a-3',
        orgId: 'org-1',
        companyId: 'c-3',
        workplaceId: 'w-6',
        type: 'incident',
        status: 'in_progress',
        title: 'Kitchen Line 1 — Incident Audit',
        auditorId: 'u-2',
        scheduledDate: '2025-09-28',
        notes: 'Follow-up after a minor burn incident on the packaging line.',
        createdAt: '2025-09-28T09:30:00Z',
        updatedAt: '2025-10-01T11:00:00Z',
        photoCount: 1,
        findingCount: 2,
      },
      {
        id: 'a-4',
        orgId: 'org-1',
        companyId: 'c-3',
        workplaceId: 'w-7',
        type: 'periodic',
        status: 'approved',
        title: 'Cold Storage — Periodic Audit',
        auditorId: 'u-1',
        reviewerId: 'u-3',
        scheduledDate: '2025-08-30',
        notes: 'Temperature controls and ammonia detection review.',
        createdAt: '2025-08-30T07:45:00Z',
        updatedAt: '2025-09-02T09:15:00Z',
        photoCount: 1,
        findingCount: 2,
      },
      {
        id: 'a-5',
        orgId: 'org-1',
        companyId: 'c-1',
        workplaceId: 'w-2',
        type: 'follow-up',
        status: 'changes_requested',
        title: 'Plant B — Follow-up Audit',
        auditorId: 'u-2',
        reviewerId: 'u-3',
        scheduledDate: '2025-09-30',
        notes: 'Verify closure of warehouse stacking and noise findings.',
        createdAt: '2025-09-30T10:00:00Z',
        updatedAt: '2025-10-02T16:20:00Z',
        photoCount: 0,
        findingCount: 2,
      },
      {
        id: 'a-6',
        orgId: 'org-1',
        companyId: 'c-1',
        workplaceId: 'w-3',
        type: 'initial',
        status: 'draft',
        title: 'Apex Head Office — First Audit',
        auditorId: 'u-1',
        scheduledDate: '2025-11-04',
        notes: 'Office ergonomics, fire safety and electrical safety.',
        createdAt: '2025-10-14T13:10:00Z',
        updatedAt: '2025-10-14T13:10:00Z',
        photoCount: 0,
        findingCount: 0,
      },
    ],
    findings: [
      { id: 'f-1', auditId: 'a-1', section: 'Machine Guarding', riskLevel: 'HIGH', identifiedHazards: 'Exposed rotating parts on press line.', recommendedControlMeasures: 'Install fixed guards and interlocks; add a lockout/tagout procedure.', status: 'verified', aiSource: false, photoRefs: ['p-1'] },
      { id: 'f-2', auditId: 'a-1', section: 'PPE', riskLevel: 'MEDIUM', identifiedHazards: 'Missing hearing protection in press area.', recommendedControlMeasures: 'Issue ear defenders and post mandatory signage.', status: 'verified', aiSource: false, photoRefs: [] },
      { id: 'f-3', auditId: 'a-1', section: 'Housekeeping', riskLevel: 'LOW', identifiedHazards: 'Oil spill near emergency exit aisle.', recommendedControlMeasures: 'Clean spill, add absorbent bins and mark the walkway.', status: 'verified', aiSource: false, photoRefs: ['p-2'] },
      { id: 'f-4', auditId: 'a-2', section: 'Fire Safety', riskLevel: 'HIGH', identifiedHazards: 'Two extinguishers past their service date in the fuel bay.', recommendedControlMeasures: 'Service or replace extinguishers and add monthly inspections.', status: 'ai_suggestion', confidence: 88, aiSource: true, photoRefs: ['p-3'] },
      { id: 'f-5', auditId: 'a-2', section: 'Vehicle Traffic', riskLevel: 'MEDIUM', identifiedHazards: 'Forklift route crosses the pedestrian walkway.', recommendedControlMeasures: 'Separate routes with barriers and floor markings.', status: 'unreviewed', aiSource: false, photoRefs: [] },
      { id: 'f-6', auditId: 'a-2', section: 'PPE', riskLevel: 'LOW', identifiedHazards: 'High-visibility vests are not worn in the yard.', recommendedControlMeasures: 'Enforce vest use and provide spares at the gate.', status: 'unreviewed', aiSource: false, photoRefs: [] },
      { id: 'f-7', auditId: 'a-2', section: 'Emergency Preparedness', riskLevel: 'HIGH', identifiedHazards: 'Rear emergency exit is blocked by stacked pallets.', recommendedControlMeasures: 'Clear the exit and paint a no-storage zone.', status: 'verified', aiSource: false, photoRefs: [] },
      { id: 'f-8', auditId: 'a-3', section: 'Food Hygiene', riskLevel: 'HIGH', identifiedHazards: 'Hand-wash station lacks soap and sanitiser.', recommendedControlMeasures: 'Restock daily and add a supervisor checklist.', status: 'verified', aiSource: false, photoRefs: ['p-4'] },
      { id: 'f-9', auditId: 'a-3', section: 'Slip Prevention', riskLevel: 'MEDIUM', identifiedHazards: 'Standing water near the packaging conveyor.', recommendedControlMeasures: 'Repair the drain and add anti-slip matting.', status: 'ai_suggestion', confidence: 74, aiSource: true, photoRefs: ['p-4'] },
      { id: 'f-10', auditId: 'a-4', section: 'Temperature Control', riskLevel: 'MEDIUM', identifiedHazards: 'Cold room log missing two hourly readings.', recommendedControlMeasures: 'Use an automated logger and weekly calibration checks.', status: 'verified', aiSource: false, photoRefs: ['p-5'] },
      { id: 'f-11', auditId: 'a-4', section: 'Chemical Safety', riskLevel: 'HIGH', identifiedHazards: 'Ammonia detector test is overdue.', recommendedControlMeasures: 'Book an accredited test and keep the certificate on site.', status: 'verified', aiSource: false, photoRefs: [] },
      { id: 'f-12', auditId: 'a-5', section: 'Noise Control', riskLevel: 'MEDIUM', identifiedHazards: 'Noise from the compactor exceeds 85 dB.', recommendedControlMeasures: 'Enclose the compactor and rotate staff exposure.', status: 'verified', aiSource: false, photoRefs: [] },
      { id: 'f-13', auditId: 'a-5', section: 'Storage', riskLevel: 'HIGH', identifiedHazards: 'Shelving is not anchored to the wall.', recommendedControlMeasures: 'Anchor all racks and add load rating labels.', status: 'unreviewed', aiSource: false, photoRefs: [] },
    ],
    photos: [
      { id: 'p-1', auditId: 'a-1', url: '/placeholders/press-line.svg', filename: 'press-line.svg', caption: 'Press line with exposed rotating parts.', uploadedAt: '2025-10-10T09:15:00Z' },
      { id: 'p-2', auditId: 'a-1', url: '/placeholders/exit-aisle.svg', filename: 'exit-aisle.svg', caption: 'Oil spill beside the emergency exit.', uploadedAt: '2025-10-10T09:20:00Z' },
      { id: 'p-3', auditId: 'a-2', url: '/placeholders/depot.svg', filename: 'depot.svg', caption: 'Fuel bay extinguisher point.', uploadedAt: '2025-09-20T09:10:00Z' },
      { id: 'p-4', auditId: 'a-3', url: '/placeholders/kitchen.svg', filename: 'kitchen.svg', caption: 'Packaging line hand-wash station.', uploadedAt: '2025-09-28T10:05:00Z' },
      { id: 'p-5', auditId: 'a-4', url: '/placeholders/cold-storage.svg', filename: 'cold-storage.svg', caption: 'Cold room control panel.', uploadedAt: '2025-08-30T08:20:00Z' },
    ],
    reports: [
      { id: 'r-1', auditId: 'a-1', version: 1, status: 'generated', createdAt: '2025-10-11T15:00:00Z', format: 'PDF' },
      { id: 'r-2', auditId: 'a-4', version: 1, status: 'generated', createdAt: '2025-09-02T10:30:00Z', format: 'DOCX' },
    ],
    actions: [
      { id: 'ac-1', auditId: 'a-1', title: 'Install press guards', description: 'Fit fixed guards and interlocks to press line 2.', status: 'open', responsible: 'Plant Manager', deadline: '2025-11-25', priority: 'HIGH' },
      { id: 'ac-2', auditId: 'a-1', title: 'Issue hearing protection', description: 'Provide ear defenders and display mandatory signage.', status: 'overdue', responsible: 'Safety Officer', deadline: '2025-10-15', priority: 'HIGH' },
      { id: 'ac-3', auditId: 'a-1', title: 'Clean oil spill', description: 'Clear the spill and place absorbent bins near the exit.', status: 'completed', responsible: 'Shift Lead', deadline: '2025-10-12', priority: 'LOW' },
      { id: 'ac-4', auditId: 'a-2', title: 'Service fire extinguishers', description: 'Service all units in the fuel bay and update tags.', status: 'in_progress', responsible: 'Depot Supervisor', deadline: '2025-11-30', priority: 'HIGH' },
      { id: 'ac-5', auditId: 'a-3', title: 'Repair walkway drainage', description: 'Fix the drain beside the packaging conveyor.', status: 'open', responsible: 'Maintenance Lead', deadline: '2025-12-05', priority: 'MEDIUM' },
      { id: 'ac-6', auditId: 'a-4', title: 'Calibrate cold room sensors', description: 'Calibrate all temperature probes and record certificates.', status: 'completed', responsible: 'Cold Store Manager', deadline: '2025-09-10', priority: 'MEDIUM' },
    ],
  };
}

function loadData(): StoreData {
  return readStore<StoreData>(DATA_KEY, seedData());
}

let data = loadData();

function persist() {
  writeStore(DATA_KEY, data);
}

function findAudit(id: string | readonly string[] | undefined) {
  return data.audits.find((a) => a.id === id);
}

function decorateAudit(a: Audit): Audit {
  const findings = data.findings.filter((f) => f.auditId === a.id);
  return {
    ...a,
    findingCount: findings.length,
    photoCount: data.photos.filter((p) => p.auditId === a.id).length,
  };
}

function decorateCompany(c: Company): Company {
  const workplaces = data.workplaces.filter((w) => w.companyId === c.id);
  const audits = data.audits.filter((a) => a.companyId === c.id);
  const sortedAudits = audits.map((a) => a.updatedAt).sort();
  const lastAudit = sortedAudits[sortedAudits.length - 1];
  return {
    ...c,
    workplaceCount: workplaces.length,
    auditCount: audits.length,
    lastAudit: lastAudit ? lastAudit.slice(0, 10) : c.lastAudit,
  };
}

function decorateWorkplace(w: Workplace): Workplace {
  const audits = data.audits.filter((a) => a.workplaceId === w.id);
  const auditIds = new Set(audits.map((a) => a.id));
  const openFindings = data.findings.filter(
    (f) => auditIds.has(f.auditId) && f.status !== 'verified',
  ).length;
  const sortedAudits = audits.map((a) => a.updatedAt).sort();
  const lastAudit = sortedAudits[sortedAudits.length - 1];
  return {
    ...w,
    openFindings,
    auditCount: audits.length,
    lastAudit: lastAudit ? lastAudit.slice(0, 10) : w.lastAudit,
  };
}

const SUGGESTION_TEMPLATES: Array<Pick<Finding, 'section' | 'riskLevel' | 'identifiedHazards' | 'recommendedControlMeasures'>> = [
  {
    section: 'Machine Guarding',
    riskLevel: 'HIGH',
    identifiedHazards: 'Guarding appears incomplete around moving belts.',
    recommendedControlMeasures: 'Fit interlocked guards and verify with a physical test.',
  },
  {
    section: 'Housekeeping',
    riskLevel: 'MEDIUM',
    identifiedHazards: 'Materials are stored in a marked walkway.',
    recommendedControlMeasures: 'Relocate storage and repaint the walkway boundary.',
  },
  {
    section: 'Electrical Safety',
    riskLevel: 'HIGH',
    identifiedHazards: 'A socket outlet shows signs of overheating.',
    recommendedControlMeasures: 'Isolate the circuit and have a licensed electrician inspect it.',
  },
  {
    section: 'PPE',
    riskLevel: 'LOW',
    identifiedHazards: 'Eye protection is not consistently worn near the bench.',
    recommendedControlMeasures: 'Refresh PPE training and display reminder signs.',
  },
];

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    await delay(180);
    const { email, password } = (await request.json()) as { email: string; password: string };
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || password !== 'password') {
      return HttpResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    return HttpResponse.json({ user, token: 'mock-token' });
  }),
  http.post('*/auth/register', async ({ request }) => {
    await delay(220);
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
      role?: User['role'];
    };
    if (data.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return HttpResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role ?? 'viewer',
      title: body.role === 'reviewer' ? 'Reviewer' : body.role === 'auditor' ? 'Field Auditor' : 'Team Member',
    };
    data.users.push(user);
    persist();
    return HttpResponse.json({ user, token: 'mock-token' });
  }),
  http.post('*/auth/reset', async ({ request }) => {
    await delay(180);
    const { email } = (await request.json()) as { email: string };
    return HttpResponse.json({ ok: data.users.some((u) => u.email.toLowerCase() === email.toLowerCase()) });
  }),
  http.get('*/auth/me', () => HttpResponse.json(data.users[0])),

  http.get('*/companies', async () => {
    await delay(120);
    return HttpResponse.json(data.companies.map(decorateCompany));
  }),
  http.post('*/companies', async ({ request }) => {
    const body = (await request.json()) as Partial<Company>;
    if (!body.name?.trim()) {
      return HttpResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }
    const company: Company = {
      id: `c-${Date.now()}`,
      orgId: 'org-1',
      name: body.name.trim(),
      industry: body.industry?.trim() || 'General',
      status: body.status ?? 'Active',
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      address: body.address,
      workplaceCount: 0,
      auditCount: 0,
    };
    data.companies.push(company);
    persist();
    return HttpResponse.json(decorateCompany(company), { status: 201 });
  }),
  http.get('*/companies/:id', ({ params }) => {
    const company = data.companies.find((c) => c.id === params.id);
    return company
      ? HttpResponse.json(decorateCompany(company))
      : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.put('*/companies/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Company>;
    const index = data.companies.findIndex((c) => c.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    if (body.name !== undefined && !body.name.trim()) {
      return HttpResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }
    data.companies[index] = { ...data.companies[index], ...body, name: body.name?.trim() ?? data.companies[index].name };
    persist();
    return HttpResponse.json(decorateCompany(data.companies[index]));
  }),
  http.delete('*/companies/:id', ({ params }) => {
    if (!data.companies.some((c) => c.id === params.id)) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (data.audits.some((a) => a.companyId === params.id)) {
      return HttpResponse.json({ error: 'This company has audits. Delete its audits first.' }, { status: 409 });
    }
    data.companies = data.companies.filter((c) => c.id !== params.id);
    data.workplaces = data.workplaces.filter((w) => w.companyId !== params.id);
    persist();
    return HttpResponse.json({ ok: true });
  }),
  http.get('*/companies/:id/workplaces', ({ params }) => {
    const items = data.workplaces.filter((w) => w.companyId === params.id);
    return HttpResponse.json(items.map(decorateWorkplace));
  }),
  http.post('*/companies/:id/workplaces', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Workplace>;
    const company = data.companies.find((c) => c.id === params.id);
    if (!company) return HttpResponse.json({ error: 'Company not found' }, { status: 404 });
    if (!body.name?.trim()) {
      return HttpResponse.json({ error: 'Workplace name is required.' }, { status: 400 });
    }
    const workplace: Workplace = {
      id: `w-${Date.now()}`,
      companyId: company.id,
      name: body.name.trim(),
      location: body.location?.trim() || company.address || 'Unspecified',
      status: body.status ?? 'Active',
      openFindings: 0,
      auditCount: 0,
      supervisor: body.supervisor,
      description: body.description,
    };
    data.workplaces.push(workplace);
    persist();
    return HttpResponse.json(decorateWorkplace(workplace), { status: 201 });
  }),
  http.put('*/companies/:companyId/workplaces/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Workplace>;
    const index = data.workplaces.findIndex(
      (w) => w.id === params.id && w.companyId === params.companyId,
    );
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    if (body.name !== undefined && !body.name.trim()) {
      return HttpResponse.json({ error: 'Workplace name is required.' }, { status: 400 });
    }
    data.workplaces[index] = {
      ...data.workplaces[index],
      ...body,
      name: body.name?.trim() ?? data.workplaces[index].name,
    };
    persist();
    return HttpResponse.json(decorateWorkplace(data.workplaces[index]));
  }),
  http.delete('*/companies/:companyId/workplaces/:id', ({ params }) => {
    if (!data.workplaces.some((w) => w.id === params.id && w.companyId === params.companyId)) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (data.audits.some((a) => a.workplaceId === params.id)) {
      return HttpResponse.json({ error: 'This workplace has audits. Delete its audits first.' }, { status: 409 });
    }
    data.workplaces = data.workplaces.filter((w) => w.id !== params.id);
    persist();
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/audits', async () => {
    await delay(120);
    const items = data.audits
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(decorateAudit);
    return HttpResponse.json(items);
  }),
  http.get('*/audits/:id', ({ params }) => {
    const audit = findAudit(params.id);
    return audit
      ? HttpResponse.json(decorateAudit(audit))
      : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.post('*/audits', async ({ request }) => {
    const body = (await request.json()) as Partial<Audit>;
    if (!body.companyId || !body.workplaceId) {
      return HttpResponse.json({ error: 'Company and workplace are required.' }, { status: 400 });
    }
    const now = new Date().toISOString();
    const audit: Audit = {
      id: `a-${Date.now()}`,
      orgId: 'org-1',
      companyId: body.companyId,
      workplaceId: body.workplaceId,
      type: body.type ?? 'initial',
      status: body.status ?? 'draft',
      title: body.title?.trim() || 'New audit',
      auditorId: body.auditorId ?? 'u-1',
      reviewerId: body.reviewerId,
      scheduledDate: body.scheduledDate,
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
      photoCount: 0,
      findingCount: 0,
    };
    data.audits.push(audit);
    persist();
    return HttpResponse.json(decorateAudit(audit), { status: 201 });
  }),
  http.put('*/audits/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Audit>;
    const index = data.audits.findIndex((a) => a.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.audits[index] = {
      ...data.audits[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    persist();
    return HttpResponse.json(decorateAudit(data.audits[index]));
  }),
  http.delete('*/audits/:id', ({ params }) => {
    const exists = data.audits.some((a) => a.id === params.id);
    if (!exists) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.audits = data.audits.filter((a) => a.id !== params.id);
    data.findings = data.findings.filter((f) => f.auditId !== params.id);
    data.photos = data.photos.filter((p) => p.auditId !== params.id);
    data.reports = data.reports.filter((r) => r.auditId !== params.id);
    data.actions = data.actions.map((a) => (a.auditId === params.id ? { ...a, auditId: undefined } : a));
    persist();
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/audits/:id/findings', ({ params }) =>
    HttpResponse.json(data.findings.filter((f) => f.auditId === params.id)),
  ),
  http.post('*/audits/:id/findings', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Finding>;
    const audit = findAudit(params.id);
    if (!audit) return HttpResponse.json({ error: 'Audit not found' }, { status: 404 });
    const finding: Finding = {
      id: `f-${Date.now()}`,
      auditId: audit.id,
      section: body.section?.trim() || 'General',
      riskLevel: body.riskLevel ?? 'MEDIUM',
      identifiedHazards: body.identifiedHazards?.trim() || 'Hazard to be described.',
      recommendedControlMeasures: body.recommendedControlMeasures?.trim() || 'Control measure to be agreed.',
      status: body.status ?? 'unreviewed',
      confidence: body.confidence,
      aiSource: body.aiSource ?? false,
      photoRefs: body.photoRefs ?? [],
    };
    data.findings.push(finding);
    audit.updatedAt = new Date().toISOString();
    persist();
    return HttpResponse.json(finding, { status: 201 });
  }),
  http.put('*/audits/:auditId/findings/:findingId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Finding>;
    const index = data.findings.findIndex(
      (f) => f.id === params.findingId && f.auditId === params.auditId,
    );
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.findings[index] = { ...data.findings[index], ...body };
    persist();
    return HttpResponse.json(data.findings[index]);
  }),
  http.delete('*/audits/:auditId/findings/:findingId', ({ params }) => {
    const exists = data.findings.some(
      (f) => f.id === params.findingId && f.auditId === params.auditId,
    );
    if (!exists) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.findings = data.findings.filter(
      (f) => !(f.id === params.findingId && f.auditId === params.auditId),
    );
    persist();
    return HttpResponse.json({ ok: true });
  }),
  http.post('*/audits/:id/analyze', async ({ params }) => {
    await delay(1400);
    const audit = findAudit(params.id);
    if (!audit) return HttpResponse.json({ error: 'Audit not found' }, { status: 404 });
    const auditPhotos = data.photos.filter((p) => p.auditId === audit.id);
    const start = data.findings.filter((f) => f.auditId === audit.id).length;
    const created: Finding[] = SUGGESTION_TEMPLATES.slice(0, 2).map((template, index) => ({
      ...template,
      id: `f-ai-${Date.now()}-${index}`,
      auditId: audit.id,
      status: 'ai_suggestion',
      confidence: 68 + Math.floor(Math.random() * 24),
      aiSource: true,
      photoRefs: auditPhotos[index] ? [auditPhotos[index].id] : [],
    }));
    data.findings.push(...created);
    audit.updatedAt = new Date().toISOString();
    persist();
    return HttpResponse.json({ findings: created, scanned: auditPhotos.length, existing: start });
  }),

  http.get('*/audits/:id/photos', ({ params }) =>
    HttpResponse.json(data.photos.filter((p) => p.auditId === params.id)),
  ),
  http.post('*/audits/:id/photos', async ({ request, params }) => {
    const audit = findAudit(params.id);
    if (!audit) return HttpResponse.json({ error: 'Audit not found' }, { status: 404 });
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return HttpResponse.json({ error: 'A file is required.' }, { status: 400 });
    }
    const photo: Photo = {
      id: `p-${Date.now()}`,
      auditId: audit.id,
      url: await fileToDataUrl(file),
      filename: file.name,
      caption: (form.get('caption') as string) || '',
      uploadedAt: new Date().toISOString(),
    };
    data.photos.push(photo);
    audit.updatedAt = new Date().toISOString();
    persist();
    return HttpResponse.json(photo, { status: 201 });
  }),
  http.put('*/audits/:auditId/photos/:photoId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Photo>;
    const index = data.photos.findIndex(
      (p) => p.id === params.photoId && p.auditId === params.auditId,
    );
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.photos[index] = { ...data.photos[index], ...body };
    persist();
    return HttpResponse.json(data.photos[index]);
  }),
  http.delete('*/audits/:auditId/photos/:photoId', ({ params }) => {
    const exists = data.photos.some(
      (p) => p.id === params.photoId && p.auditId === params.auditId,
    );
    if (!exists) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.photos = data.photos.filter(
      (p) => !(p.id === params.photoId && p.auditId === params.auditId),
    );
    persist();
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/reports', async () => {
    const items = data.reports
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json(items);
  }),
  http.post('*/reports', async ({ request }) => {
    const body = (await request.json()) as { auditId: string; format: 'PDF' | 'DOCX' };
    const audit = findAudit(body.auditId);
    if (!audit) return HttpResponse.json({ error: 'Audit not found' }, { status: 404 });
    const version = data.reports.filter((r) => r.auditId === audit.id).length + 1;
    const report: Report = {
      id: `r-${Date.now()}`,
      auditId: audit.id,
      version,
      status: 'generated',
      createdAt: new Date().toISOString(),
      format: body.format,
    };
    data.reports.push(report);
    audit.updatedAt = new Date().toISOString();
    persist();
    return HttpResponse.json(report, { status: 201 });
  }),
  http.put('*/reports/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Report>;
    const index = data.reports.findIndex((r) => r.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.reports[index] = { ...data.reports[index], ...body };
    persist();
    return HttpResponse.json(data.reports[index]);
  }),

  http.get('*/actions', async () => {
    const items = data.actions.slice().sort((a, b) => a.deadline.localeCompare(b.deadline));
    return HttpResponse.json(items);
  }),
  http.post('*/actions', async ({ request }) => {
    const body = (await request.json()) as Partial<Action>;
    if (!body.title?.trim()) {
      return HttpResponse.json({ error: 'Action title is required.' }, { status: 400 });
    }
    const action: Action = {
      id: `ac-${Date.now()}`,
      auditId: body.auditId,
      title: body.title.trim(),
      description: body.description,
      status: body.status ?? 'open',
      responsible: body.responsible?.trim() || 'Unassigned',
      deadline: body.deadline ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      priority: body.priority ?? 'MEDIUM',
    };
    data.actions.push(action);
    persist();
    return HttpResponse.json(action, { status: 201 });
  }),
  http.put('*/actions/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Action>;
    const index = data.actions.findIndex((a) => a.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.actions[index] = { ...data.actions[index], ...body };
    persist();
    return HttpResponse.json(data.actions[index]);
  }),
  http.delete('*/actions/:id', ({ params }) => {
    if (!data.actions.some((a) => a.id === params.id)) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }
    data.actions = data.actions.filter((a) => a.id !== params.id);
    persist();
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/team', () => HttpResponse.json(data.users)),
  http.post('*/team', async ({ request }) => {
    const body = (await request.json()) as Partial<User>;
    if (!body.name?.trim() || !body.email?.trim()) {
      return HttpResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }
    if (data.users.some((u) => u.email.toLowerCase() === body.email!.toLowerCase())) {
      return HttpResponse.json({ error: 'That email is already on the team.' }, { status: 409 });
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role ?? 'viewer',
      title: body.title ?? 'Team Member',
    };
    data.users.push(user);
    persist();
    return HttpResponse.json(user, { status: 201 });
  }),
  http.put('*/team/:id', async ({ request, params }) => {
    const body = (await request.json()) as Partial<User>;
    const index = data.users.findIndex((u) => u.id === params.id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    data.users[index] = { ...data.users[index], ...body };
    persist();
    return HttpResponse.json(data.users[index]);
  }),
  http.delete('*/team/:id', ({ params }) => {
    const user = data.users.find((u) => u.id === params.id);
    if (!user) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    if (user.role === 'admin' && data.users.filter((u) => u.role === 'admin').length === 1) {
      return HttpResponse.json({ error: 'At least one admin is required.' }, { status: 409 });
    }
    data.users = data.users.filter((u) => u.id !== params.id);
    persist();
    return HttpResponse.json({ ok: true });
  }),

  http.get('*/notifications', () => {
    const overdue = data.actions.filter((a) => a.status === 'overdue');
    const pending = data.audits.filter((a) => a.status === 'pending_review');
    const items = [
      ...overdue.map((a) => ({
        id: `n-${a.id}`,
        title: 'Corrective action overdue',
        body: a.title,
        tone: 'danger' as const,
        href: '/actions',
      })),
      ...pending.map((a) => ({
        id: `n-${a.id}`,
        title: 'Audit awaiting review',
        body: a.title,
        tone: 'warning' as const,
        href: `/audits/${a.id}/review`,
      })),
    ];
    return HttpResponse.json(items.slice(0, 8));
  }),

  http.get('*/search', ({ request }) => {
    const query = (new URL(request.url).searchParams.get('q') ?? '').trim().toLowerCase();
    if (!query) {
      return HttpResponse.json({ companies: [], workplaces: [], audits: [], actions: [] });
    }
    const matches = (value: string | undefined) => (value ?? '').toLowerCase().includes(query);
    return HttpResponse.json({
      companies: data.companies.filter((c) => matches(c.name) || matches(c.industry)).slice(0, 5),
      workplaces: data.workplaces.filter((w) => matches(w.name) || matches(w.location)).slice(0, 5),
      audits: data.audits.filter((a) => matches(a.title) || matches(a.type)).slice(0, 5),
      actions: data.actions.filter((a) => matches(a.title) || matches(a.responsible)).slice(0, 5),
    });
  }),

  http.post('*/demo/reset', () => {
    removeStore(DATA_KEY);
    data = seedData();
    persist();
    return HttpResponse.json({ ok: true });
  }),
];

export { data as demoData };
