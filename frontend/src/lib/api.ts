/**
 * Typed API client for Law Cube backend.
 * Reads the auth store for tokens; auto-refreshes on 401.
 */

import type {
  ClioSyncLog, ClioSyncLogListResponse,
  DashboardResponse, IntegrationSettingsIn, IntegrationSettingsOut,
  InviteResponse, Lead, LeadCreate, LeadListResponse, LeadUpdate,
  Note, OrgUser, TokenResponse, User, UserListResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Lazy import to avoid circular dependency — auth store imports api, api imports auth store
function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./auth-store").useAuthStore.getState();
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  skipAuth?: boolean;
};

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, skipAuth = false } = opts;
  const store = getStore();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!skipAuth && store.accessToken) {
    headers["Authorization"] = `Bearer ${store.accessToken}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh on 401 and retry once
  if (res.status === 401 && !skipAuth && store.refreshToken) {
    try {
      await store.refreshAccessToken();
      const newToken = getStore().accessToken;
      const retryRes = await fetch(`${BASE}${path}`, {
        method,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retryRes.ok) throw new Error(await retryRes.text());
      return retryRes.json() as Promise<T>;
    } catch {
      store.logout();
      if (typeof window !== "undefined") window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail?.detail ?? "Request failed");
  }

  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    firm_name: string;
  }) => request<TokenResponse>("/api/auth/register", { method: "POST", body, skipAuth: true }),

  login: (email: string, password: string) =>
    request<TokenResponse>("/api/auth/login", { method: "POST", body: { email, password }, skipAuth: true }),

  google: (token: string, firm_name = "") =>
    request<TokenResponse>("/api/auth/google", { method: "POST", body: { token, firm_name }, skipAuth: true }),

  refresh: (refresh_token: string) =>
    request<TokenResponse>("/api/auth/refresh", { method: "POST", body: { refresh_token }, skipAuth: true }),

  me: () => request<User>("/api/auth/me"),
};

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leadsApi = {
  list: (params: {
    page?: number;
    page_size?: number;
    status?: string;
    source?: string;
    search?: string;
    assigned_user_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    if (params.status) qs.set("status", params.status);
    if (params.source) qs.set("source", params.source);
    if (params.search) qs.set("search", params.search);
    if (params.assigned_user_id) qs.set("assigned_user_id", params.assigned_user_id);
    return request<LeadListResponse>(`/api/leads?${qs}`);
  },

  get: (id: string) => request<Lead>(`/api/leads/${id}`),

  create: (body: LeadCreate) =>
    request<Lead>("/api/leads", { method: "POST", body }),

  update: (id: string, body: LeadUpdate) =>
    request<Lead>(`/api/leads/${id}`, { method: "PUT", body }),

  delete: (id: string) =>
    request<void>(`/api/leads/${id}`, { method: "DELETE" }),

  addNote: (id: string, content: string) =>
    request<Note>(`/api/leads/${id}/notes`, { method: "POST", body: { content } }),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersApi = {
  list: () => request<UserListResponse>("/api/users"),

  get: (id: string) => request<OrgUser>(`/api/users/${id}`),

  invite: (body: { email: string; first_name: string; last_name: string; role: string }) =>
    request<InviteResponse>("/api/users/invite", { method: "POST", body }),

  acceptInvite: (token: string, password: string) =>
    request<OrgUser>("/api/users/accept-invite", { method: "POST", body: { token, password }, skipAuth: true }),

  updateRole: (id: string, role: string) =>
    request<OrgUser>(`/api/users/${id}/role`, { method: "PATCH", body: { role } }),

  deactivate: (id: string) =>
    request<void>(`/api/users/${id}`, { method: "DELETE" }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: () => request<DashboardResponse>("/api/dashboard"),
};

// ── Calls ─────────────────────────────────────────────────────────────────────

export interface CallRecord {
  id: string;
  organization_id: string;
  lead_id: string | null;
  callrail_id: string | null;
  caller_number: string | null;
  duration_seconds: number | null;
  direction: string;
  recording_url: string | null;
  processing_status: "pending" | "transcribing" | "analyzing" | "complete" | "failed";
  processing_error: string | null;
  transcript: string | null;
  ai_summary: string | null;
  caller_intent: string | null;
  case_type: string | null;
  key_facts: string[];
  next_steps: string[];
  lead_score: number | null;
  score_breakdown: Record<string, number> | null;
  classification: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  ai_processed_at: string | null;
  ai_provider: string | null;
  campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  called_at: string;
  created_at: string;
}

export interface CallListResponse {
  items: CallRecord[];
  total: number;
  page: number;
  page_size: number;
}

export const callsApi = {
  list: (params: {
    page?: number;
    page_size?: number;
    classification?: string;
    lead_id?: string;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    if (params.classification) qs.set("classification", params.classification);
    if (params.lead_id) qs.set("lead_id", params.lead_id);
    return request<CallListResponse>(`/api/calls?${qs}`);
  },

  get: (id: string) => request<CallRecord>(`/api/calls/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationRecord {
  id: string;
  organization_id: string;
  user_id: string;
  event_type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationRecord[];
  total: number;
  page: number;
  page_size: number;
}

export const notificationsApi = {
  list: (params: { page?: number; page_size?: number; unread?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    if (params.unread !== undefined) qs.set("unread", String(params.unread));
    return request<NotificationListResponse>(`/api/notifications?${qs}`);
  },
  unreadCount: () => request<{ count: number }>("/api/notifications/unread-count"),
  markRead: (id: string) => request<NotificationRecord>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request<{ count: number }>("/api/notifications/read-all", { method: "PATCH" }),
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const settingsApi = {
  getIntegrations: () =>
    request<IntegrationSettingsOut>("/api/settings/integrations"),
  updateIntegrations: (body: IntegrationSettingsIn) =>
    request<IntegrationSettingsOut>("/api/settings/integrations", { method: "PUT", body }),
};

// ── Clio ──────────────────────────────────────────────────────────────────────

export const clioApi = {
  getAuthUrl: () =>
    request<{ url: string }>("/api/clio/auth-url"),

  disconnect: () =>
    request<{ status: string; message: string }>("/api/clio/disconnect", { method: "DELETE" }),

  getSyncLogs: (params: { lead_id?: string; page?: number; page_size?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.lead_id) qs.set("lead_id", params.lead_id);
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    return request<ClioSyncLogListResponse>(`/api/clio/sync-logs?${qs}`);
  },

  syncLead: (leadId: string) =>
    request<{ status: string; message: string }>(`/api/leads/${leadId}/clio-sync`, { method: "POST" }),
};
