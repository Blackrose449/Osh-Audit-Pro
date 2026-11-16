export type UserRole = 'admin' | 'auditor' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
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
  status: 'Active' | 'Audit due' | 'Onboarding';
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  workplaceCount: number;
  auditCount: number;
  lastAudit?: string;
}

export interface Workplace {
  id: string;
  companyId: string;
  name: string;
  location: string;
  status: 'Active' | 'Audit due' | 'Inactive';
  openFindings: number;
  auditCount: number;
  lastAudit?: string;
  supervisor?: string;
  description?: string;
}

export type AuditType = 'initial' | 'periodic' | 'incident' | 'follow-up';

export type AuditStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_review'
  | 'reviewed'
  | 'approved'
  | 'changes_requested';

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
  scheduledDate?: string;
  notes?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
  findingCount: number;
}

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Finding {
  id: string;
  auditId: string;
  section: string;
  riskLevel: RiskLevel;
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

export type ActionStatus = 'open' | 'in_progress' | 'overdue' | 'completed';

export interface Action {
  id: string;
  auditId?: string;
  title: string;
  description?: string;
  status: ActionStatus;
  responsible: string;
  deadline: string;
  priority: RiskLevel;
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
  {
    id: 'u-1',
    name: 'Grace Wanjiku',
    email: 'grace@greenfield.example',
    role: 'admin',
    title: 'Lead Auditor',
    avatar: 'https://ui-avatars.com/api/?name=Grace+Wanjiku&background=126B58&color=fff',
  },
  {
    id: 'u-2',
    name: 'Daniel Otieno',
    email: 'auditor@greenfield.example',
    role: 'auditor',
    title: 'Field Auditor',
    avatar: 'https://ui-avatars.com/api/?name=Daniel+Otieno&background=0B493D&color=fff',
  },
  {
    id: 'u-3',
    name: 'Amina Hassan',
    email: 'reviewer@greenfield.example',
    role: 'reviewer',
    title: 'Reviewer',
    avatar: 'https://ui-avatars.com/api/?name=Amina+Hassan&background=1B7F68&color=fff',
  },
  {
    id: 'u-4',
    name: 'Peter Mwangi',
    email: 'viewer@greenfield.example',
    role: 'viewer',
    title: 'Client Viewer',
    avatar: 'https://ui-avatars.com/api/?name=Peter+Mwangi&background=4B635D&color=fff',
  },
];

export const COMPANIES: Company[] = [
  {
    id: 'c-1',
    orgId: 'org-1',
    name: 'Apex Manufacturing Ltd.',
    industry: 'Manufacturing',
    status: 'Active',
    contactName: 'Jane Njeri',
    email: 'jane@apex.example',
    phone: '+254 711 000 101',
    address: 'Industrial Area, Nairobi',
    workplaceCount: 3,
    auditCount: 12,
    lastAudit: '2025-10-15',
  },
  {
    id: 'c-2',
    orgId: 'org-1',
    name: 'Kifaru Logistics Group',
    industry: 'Logistics',
    status: 'Audit due',
    contactName: 'Brian Kimani',
    email: 'brian@kifaru.example',
    phone: '+254 722 000 202',
    address: 'Mombasa Road, Mombasa',
    workplaceCount: 2,
    auditCount: 8,
    lastAudit: '2025-09-22',
  },
  {
    id: 'c-3',
    orgId: 'org-1',
    name: 'Mwangaza Food Industries',
    industry: 'Food processing',
    status: 'Active',
    contactName: 'Alice Achieng',
    email: 'alice@mwangaza.example',
    phone: '+254 733 000 303',
    address: 'Kisumu Industrial Park',
    workplaceCount: 4,
    auditCount: 15,
    lastAudit: '2025-10-01',
  },
];

export const WORKPLACES: Workplace[] = [
  {
    id: 'w-1',
    companyId: 'c-1',
    name: 'Plant A — Assembly',
    location: 'Nairobi, Kenya',
    status: 'Active',
    openFindings: 2,
    auditCount: 5,
    lastAudit: '2025-10-10',
    supervisor: 'Samuel Kariuki',
    description: 'Main assembly hall with press line, packing and dispatch.',
  },
  {
    id: 'w-2',
    companyId: 'c-1',
    name: 'Plant B — Warehouse',
    location: 'Nairobi, Kenya',
    status: 'Active',
    openFindings: 0,
    auditCount: 3,
    lastAudit: '2025-09-30',
    supervisor: 'Mary Wairimu',
    description: 'Raw material storage and finished goods dispatch.',
  },
  {
    id: 'w-3',
    companyId: 'c-1',
    name: 'Apex Head Office',
    location: 'Westlands, Nairobi',
    status: 'Active',
    openFindings: 1,
    auditCount: 4,
    lastAudit: '2025-08-18',
    supervisor: 'Kevin Ouma',
    description: 'Administration, finance and design teams.',
  },
  {
    id: 'w-4',
    companyId: 'c-2',
    name: 'Depot North',
    location: 'Mombasa, Kenya',
    status: 'Audit due',
    openFindings: 4,
    auditCount: 4,
    lastAudit: '2025-09-20',
    supervisor: 'Fatuma Ali',
    description: 'Fuel and general cargo depot with 24-hour operations.',
  },
  {
    id: 'w-5',
    companyId: 'c-2',
    name: 'Depot South',
    location: 'Mombasa, Kenya',
    status: 'Active',
    openFindings: 1,
    auditCount: 2,
    lastAudit: '2025-07-12',
    supervisor: 'Joseph Mutua',
    description: 'Container yard and vehicle maintenance bay.',
  },
  {
    id: 'w-6',
    companyId: 'c-3',
    name: 'Kitchen Line 1',
    location: 'Kisumu, Kenya',
    status: 'Active',
    openFindings: 1,
    auditCount: 6,
    lastAudit: '2025-09-28',
    supervisor: 'Linet Akinyi',
    description: 'High-care food preparation and packaging line.',
  },
  {
    id: 'w-7',
    companyId: 'c-3',
    name: 'Cold Storage Unit',
    location: 'Kisumu, Kenya',
    status: 'Active',
    openFindings: 2,
    auditCount: 3,
    lastAudit: '2025-08-30',
    supervisor: 'Charles Odhiambo',
    description: 'Refrigerated storage and loading dock.',
  },
];

export function findCompany(id?: string) {
  return COMPANIES.find((c) => c.id === id);
}

export function findWorkplace(id?: string) {
  return WORKPLACES.find((w) => w.id === id);
}

export function findUser(id?: string) {
  return SEED_USERS.find((u) => u.id === id);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
