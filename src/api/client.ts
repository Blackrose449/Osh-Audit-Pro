/// <reference types="vite/client" />

import type { Audit, Company, Finding, Photo, Report, User, Workplace } from '@/types';

const API_MODE = import.meta.env.VITE_API_MODE ?? 'mock';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input.toString(), {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? ': ' + body : ''}`);
  }
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(`${API_BASE_URL}${path}`),
  post: <T>(path: string, body?: unknown) => request<T>(`${API_BASE_URL}${path}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(`${API_BASE_URL}${path}`, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(`${API_BASE_URL}${path}`, { method: 'DELETE' }),
};

export const auditApi = {
  list: () => api.get<Audit[]>('/audits'),
  get: (id: string) => api.get<Audit>(`/audits/${id}`),
  create: (body: Partial<Audit>) => api.post<Audit>('/audits', body),
  update: (id: string, body: Partial<Audit>) => api.put<Audit>(`/audits/${id}`, body),
  findings: (id: string) => api.get<Finding[]>(`/audits/${id}/findings`),
  updateFinding: (auditId: string, findingId: string, body: Partial<Finding>) => api.put<Finding>(`/audits/${auditId}/findings/${findingId}`, body),
  photos: (id: string) => api.get<Photo[]>(`/audits/${id}/photos`),
  uploadPhoto: (id: string, form: FormData) => api.post<Photo>(`/audits/${id}/photos`, form),
};

export const companyApi = {
  list: () => api.get<Company[]>('/companies'),
  get: (id: string) => api.get<Company>(`/companies/${id}`),
};

export const workplaceApi = {
  listByCompany: (companyId: string) => api.get<Workplace[]>(`/companies/${companyId}/workplaces`),
};

export const reportApi = {
  list: () => api.get<Report[]>('/reports'),
  generate: (auditId: string, format: 'PDF' | 'DOCX') => api.post<Report>('/reports', { auditId, format }),
};

export const authApi = {
  login: (email: string, password: string) => api.post<{ user: User; token: string }>('/auth/login', { email, password }),
  register: (body: { name: string; email: string; password: string; role?: User['role'] }) => api.post<{ user: User; token: string }>('/auth/register', body),
  reset: (email: string) => api.post<{ ok: boolean }>('/auth/reset', { email }),
  me: () => api.get<User>('/auth/me'),
};

export { API_MODE, API_BASE_URL };
