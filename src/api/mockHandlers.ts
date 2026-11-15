import { http, HttpResponse } from 'msw';
import type { Audit, Finding, Photo, Report, User } from '@/types';
import { SEED_USERS, COMPANIES, WORKPLACES } from '@/types';

const USERS: Record<string, User> = Object.fromEntries(SEED_USERS.map((u) => [u.email, u]));

let audits: Audit[] = [
  {
    id: 'a-1', orgId: 'org-1', companyId: 'c-1', workplaceId: 'w-1', type: 'initial', status: 'approved',
    title: 'Plant A — Initial Safety Audit', auditorId: 'u-1', reviewerId: 'u-3', createdAt: '2025-10-10T09:00:00Z', updatedAt: '2025-10-11T14:00:00Z', photoCount: 6, findingCount: 3,
  },
  {
    id: 'a-2', orgId: 'org-1', companyId: 'c-2', workplaceId: 'w-3', type: 'periodic', status: 'pending_review',
    title: 'Depot North — Periodic Review', auditorId: 'u-2', reviewerId: 'u-3', createdAt: '2025-09-20T08:00:00Z', updatedAt: '2025-09-21T10:00:00Z', photoCount: 4, findingCount: 4,
  },
  {
    id: 'a-3', orgId: 'org-1', companyId: 'c-3', workplaceId: 'w-4', type: 'incident', status: 'in_progress',
    title: 'Kitchen Line 1 — Incident Audit', auditorId: 'u-2', reviewerId: undefined, createdAt: '2025-09-28T09:30:00Z', updatedAt: '2025-10-01T11:00:00Z', photoCount: 2, findingCount: 1,
  },
];

let findings: Finding[] = [
  { id: 'f-1', auditId: 'a-1', section: 'Machine Guarding', riskLevel: 'HIGH', identifiedHazards: 'Exposed rotating parts on press line.', recommendedControlMeasures: 'Install fixed guards and interlocks.', status: 'verified', aiSource: false, photoRefs: ['p-1'] },
  { id: 'f-2', auditId: 'a-1', section: 'PPE', riskLevel: 'MEDIUM', identifiedHazards: 'Missing hearing protection in press area.', recommendedControlMeasures: 'Issue ear defenders and post signage.', status: 'verified', aiSource: false, photoRefs: [] },
  { id: 'f-3', auditId: 'a-1', section: 'Housekeeping', riskLevel: 'LOW', identifiedHazards: 'Oil spill near exit aisle.', recommendedControlMeasures: 'Clean spill and add absorbent bins.', status: 'verified', aiSource: false, photoRefs: ['p-2'] },
];

let photos: Photo[] = [
  { id: 'p-1', auditId: 'a-1', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', filename: 'press-line.jpg', caption: 'Press line with exposed parts.', uploadedAt: '2025-10-10T09:15:00Z' },
  { id: 'p-2', auditId: 'a-1', url: 'https://images.unsplash.com/photo-1542632159-625cd77ad3f9?auto=format&fit=crop&w=600&q=80', filename: 'exit-aisle.jpg', caption: 'Oil spill near exit.', uploadedAt: '2025-10-10T09:20:00Z' },
];

let reports: Report[] = [
  { id: 'r-1', auditId: 'a-1', version: 1, status: 'generated', createdAt: '2025-10-11T15:00:00Z', format: 'PDF' },
];

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    const user = USERS[email];
    if (!user || password !== 'password') return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    return HttpResponse.json({ user, token: 'mock-token' });
  }),
  http.post('*/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string; role?: User['role'] };
    const user: User = { id: `u-${Date.now()}`, name: body.name, email: body.email, role: body.role ?? 'viewer' };
    USERS[body.email] = user;
    return HttpResponse.json({ user, token: 'mock-token' });
  }),
  http.post('*/auth/reset', async ({ request }) => {
    const { email } = await request.json() as { email: string };
    return HttpResponse.json({ ok: !!USERS[email] });
  }),
  http.get('*/auth/me', () => HttpResponse.json(SEED_USERS[0])),
  http.get('*/companies', () => HttpResponse.json(COMPANIES)),
  http.get('*/companies/:id', ({ params }) => {
    const c = COMPANIES.find((x) => x.id === params.id);
    return c ? HttpResponse.json(c) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.get('*/companies/:id/workplaces', ({ params }) => HttpResponse.json(WORKPLACES.filter((w) => w.companyId === params.id))),
  http.get('*/audits', () => HttpResponse.json(audits)),
  http.get('*/audits/:id', ({ params }) => {
    const a = audits.find((x) => x.id === params.id);
    return a ? HttpResponse.json(a) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
  http.post('*/audits', async ({ request }) => {
    const body = await request.json() as Partial<Audit>;
    const a: Audit = { ...body, id: `a-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), photoCount: 0, findingCount: 0 } as Audit;
    audits.push(a);
    return HttpResponse.json(a);
  }),
  http.put('*/audits/:id', async ({ request, params }) => {
    const body = await request.json() as Partial<Audit>;
    const idx = audits.findIndex((x) => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    audits[idx] = { ...audits[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json(audits[idx]);
  }),
  http.get('*/audits/:id/findings', ({ params }) => HttpResponse.json(findings.filter((f) => f.auditId === params.id))),
  http.put('*/audits/:auditId/findings/:findingId', async ({ request, params }) => {
    const body = await request.json() as Partial<Finding>;
    const idx = findings.findIndex((f) => f.id === params.findingId && f.auditId === params.auditId);
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    findings[idx] = { ...findings[idx], ...body };
    return HttpResponse.json(findings[idx]);
  }),
  http.get('*/audits/:id/photos', ({ params }) => HttpResponse.json(photos.filter((p) => p.auditId === params.id))),
  http.post('*/audits/:id/photos', async ({ request }) => {
    const form = await request.formData();
    const file = form.get('file') as File;
    const p: Photo = { id: `p-${Date.now()}`, auditId: '', url: URL.createObjectURL(file), filename: file.name, caption: '', uploadedAt: new Date().toISOString() };
    photos.push(p);
    return HttpResponse.json(p);
  }),
  http.get('*/reports', () => HttpResponse.json(reports)),
  http.post('*/reports', async ({ request }) => {
    const body = await request.json() as { auditId: string; format: 'PDF' | 'DOCX' };
    const r: Report = { id: `r-${Date.now()}`, auditId: body.auditId, version: reports.length + 1, status: 'generated', createdAt: new Date().toISOString(), format: body.format };
    reports.push(r);
    return HttpResponse.json(r);
  }),
];
