export type UserRole = 'admin' | 'auditor' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  clientCompanies: string[];
}

export interface Company {
  id: string;
  orgId: string;
  name: string;
  industry: string;
  status: string;
  workplaceCount: number;
  auditCount: number;
  lastAudit?: string;
}

export interface Workplace {
  id: string;
  companyId: string;
  name: string;
  location: string;
  status: string;
  openFindings: number;
  auditCount: number;
  lastAudit?: string;
}

export type AuditType = 'initial' | 'periodic' | 'incident' | 'follow-up';

export type AuditStatus = 'draft' | 'in_progress' | 'pending_review' | 'reviewed' | 'approved' | 'changes_requested';

export interface Audit {
  id: string;
  orgId: string;
  companyId: string;
  workplaceId: string;
  type: AuditType;
  status: AuditStatus;
  title: string;
  auditorId: string;
  reviewerId?: string;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
  findingCount: number;
}

export interface Finding {
  id: string;
  auditId: string;
  section: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  identifiedHazards: string;
  recommendedControlMeasures: string;
  status: 'unreviewed' | 'verified' | 'ai_suggestion';
  confidence?: number;
  aiSource?: boolean;
  photoRefs: string[];
}

export interface Photo {
  id: string;
  auditId: string;
  url: string;
  filename: string;
  caption: string;
  uploadedAt: string;
}

export interface Report {
  id: string;
  auditId: string;
  version: number;
  status: 'draft' | 'generated' | 'downloaded';
  createdAt: string;
  format: 'PDF' | 'DOCX';
}

export interface Action {
  id: string;
  auditId: string;
  title: string;
  status: 'open' | 'overdue' | 'completed';
  responsible: string;
  deadline: string;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted';
}

export const SEED_ORG: Organization = {
  id: 'org-1',
  name: 'Greenfield Workplace Solutions Ltd.',
  slug: 'greenfield',
  clientCompanies: ['Apex Manufacturing Ltd.', 'Kifaru Logistics Group', 'Mwangaza Food Industries'],
};

export const SEED_USERS: User[] = [
  { id: 'u-1', name: 'Grace Wanjiku', email: 'grace@greenfield.example', role: 'admin', avatar: 'https://ui-avatars.com/api/?name=Grace+Wanjiku&background=126B58&color=fff' },
  { id: 'u-2', name: 'Auditor One', email: 'auditor@greenfield.example', role: 'auditor', avatar: 'https://ui-avatars.com/api/?name=Auditor+One&background=126B58&color=fff' },
  { id: 'u-3', name: 'Reviewer One', email: 'reviewer@greenfield.example', role: 'reviewer', avatar: 'https://ui-avatars.com/api/?name=Reviewer+One&background=126B58&color=fff' },
  { id: 'u-4', name: 'Viewer One', email: 'viewer@greenfield.example', role: 'viewer', avatar: 'https://ui-avatars.com/api/?name=Viewer+One&background=126B58&color=fff' },
];

export const COMPANIES: Company[] = [
  { id: 'c-1', orgId: 'org-1', name: 'Apex Manufacturing Ltd.', industry: 'Manufacturing', status: 'Active', workplaceCount: 3, auditCount: 12, lastAudit: '2025-10-15' },
  { id: 'c-2', orgId: 'org-1', name: 'Kifaru Logistics Group', industry: 'Logistics', status: 'Audit due', workplaceCount: 2, auditCount: 8, lastAudit: '2025-09-22' },
  { id: 'c-3', orgId: 'org-1', name: 'Mwangaza Food Industries', industry: 'Food processing', status: 'Active', workplaceCount: 4, auditCount: 15, lastAudit: '2025-10-01' },
];

export const WORKPLACES: Workplace[] = [
  { id: 'w-1', companyId: 'c-1', name: 'Plant A — Assembly', location: 'Nairobi, Kenya', status: 'Active', openFindings: 2, auditCount: 5, lastAudit: '2025-10-10' },
  { id: 'w-2', companyId: 'c-1', name: 'Plant B — Warehouse', location: 'Nairobi, Kenya', status: 'Active', openFindings: 0, auditCount: 3, lastAudit: '2025-09-30' },
  { id: 'w-3', companyId: 'c-2', name: 'Depot North', location: 'Mombasa, Kenya', status: 'Audit due', openFindings: 4, auditCount: 4, lastAudit: '2025-09-20' },
  { id: 'w-4', companyId: 'c-3', name: 'Kitchen Line 1', location: 'Kisumu, Kenya', status: 'Active', openFindings: 1, auditCount: 6, lastAudit: '2025-09-28' },
];
