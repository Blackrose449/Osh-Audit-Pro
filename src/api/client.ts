/// <reference types="vite/client" />

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

const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(input.toString(), {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let message = `${res.status} ${res.statusText}`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      if (body) message = `${message}: ${body}`;
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(`${API_BASE_URL}${path}`),
  post: <T>(path: string, body?: unknown) =>
    request<T>(`${API_BASE_URL}${path}`, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => request<T>(`${API_BASE_URL}${path}`, { method: 'DELETE' }),
};

export const auditApi = {
  list: () => api.get<Audit[]>('/audits'),
  get: (id: string) => api.get<Audit>(`/audits/${id}`),
  create: (body: Partial<Audit>) => api.post<Audit>('/audits', body),
  update: (id: string, body: Partial<Audit>) => api.put<Audit>(`/audits/${id}`, body),
  remove: (id: string) => api.del<{ ok: boolean }>(`/audits/${id}`),
  findings: (id: string) => api.get<Finding[]>(`/audits/${id}/findings`),
  addFinding: (auditId: string, body: Partial<Finding>) =>
    api.post<Finding>(`/audits/${auditId}/findings`, body),
  updateFinding: (auditId: string, findingId: string, body: Partial<Finding>) =>
    api.put<Finding>(`/audits/${auditId}/findings/${findingId}`, body),
  removeFinding: (auditId: string, findingId: string) =>
    api.del<{ ok: boolean }>(`/audits/${auditId}/findings/${findingId}`),
  analyze: (id: string) =>
    api.post<{ findings: Finding[]; scanned: number; existing: number }>(
      `/audits/${id}/analyze`,
    ),
  photos: (id: string) => api.get<Photo[]>(`/audits/${id}/photos`),
  uploadPhoto: (id: string, form: FormData) => api.post<Photo>(`/audits/${id}/photos`, form),
  updatePhoto: (auditId: string, photoId: string, body: Partial<Photo>) =>
    api.put<Photo>(`/audits/${auditId}/photos/${photoId}`, body),
  removePhoto: (auditId: string, photoId: string) =>
    api.del<{ ok: boolean }>(`/audits/${auditId}/photos/${photoId}`),
};

export const companyApi = {
  list: () => api.get<Company[]>('/companies'),
  get: (id: string) => api.get<Company>(`/companies/${id}`),
  create: (body: Partial<Company>) => api.post<Company>('/companies', body),
  update: (id: string, body: Partial<Company>) => api.put<Company>(`/companies/${id}`, body),
  remove: (id: string) => api.del<{ ok: boolean }>(`/companies/${id}`),
};

export const workplaceApi = {
  listByCompany: (companyId: string) =>
    api.get<Workplace[]>(`/companies/${companyId}/workplaces`),
  create: (companyId: string, body: Partial<Workplace>) =>
    api.post<Workplace>(`/companies/${companyId}/workplaces`, body),
  update: (companyId: string, id: string, body: Partial<Workplace>) =>
    api.put<Workplace>(`/companies/${companyId}/workplaces/${id}`, body),
  remove: (companyId: string, id: string) =>
    api.del<{ ok: boolean }>(`/companies/${companyId}/workplaces/${id}`),
};

export const reportApi = {
  list: () => api.get<Report[]>('/reports'),
  generate: (auditId: string, format: 'PDF' | 'DOCX') =>
    api.post<Report>('/reports', { auditId, format }),
  update: (id: string, body: Partial<Report>) => api.put<Report>(`/reports/${id}`, body),
};

export const actionApi = {
  list: () => api.get<Action[]>('/actions'),
  create: (body: Partial<Action>) => api.post<Action>('/actions', body),
  update: (id: string, body: Partial<Action>) => api.put<Action>(`/actions/${id}`, body),
  remove: (id: string) => api.del<{ ok: boolean }>(`/actions/${id}`),
};

export const teamApi = {
  list: () => api.get<User[]>('/team'),
  create: (body: Partial<User>) => api.post<User>('/team', body),
  update: (id: string, body: Partial<User>) => api.put<User>(`/team/${id}`, body),
  remove: (id: string) => api.del<{ ok: boolean }>(`/team/${id}`),
};

export interface SearchResults {
  companies: Company[];
  workplaces: Workplace[];
  audits: Audit[];
  actions: Action[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  tone: 'danger' | 'warning';
  href: string;
}

export const searchApi = {
  query: (q: string) => api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
};

export const notificationApi = {
  list: () => api.get<NotificationItem[]>('/notifications'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (body: { name: string; email: string; password: string; role?: User['role'] }) =>
    api.post<{ user: User; token: string }>('/auth/register', body),
  reset: (email: string) => api.post<{ ok: boolean }>('/auth/reset', { email }),
  me: () => api.get<User>('/auth/me'),
};

export const demoApi = {
  reset: () => api.post<{ ok: boolean }>('/demo/reset'),
};

export { API_MODE, API_BASE_URL };
