// Matches backend Pydantic schemas exactly

export type Role =
  | "super_admin"
  | "firm_owner"
  | "intake_manager"
  | "intake_specialist"
  | "attorney";

export type LeadStatus =
  | "new"
  | "contacted"
  | "consultation_scheduled"
  | "consultation_completed"
  | "retained"
  | "lost"
  | "spam";

export type LeadSource =
  | "callrail"
  | "web_form"
  | "manual"
  | "calendly"
  | "facebook"
  | "google";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  organization_id: string;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  assigned_user_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  source: string;
  campaign: string | null;
  keyword: string | null;
  landing_page: string | null;
  tracking_number: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  score: number | null;
  score_breakdown: string | null;
  ai_summary: string | null;
  status: LeadStatus;
  clio_contact_id: string | null;
  clio_matter_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  page_size: number;
}

export interface LeadCreate {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  source?: string;
  campaign?: string;
  assigned_user_id?: string;
}

export interface LeadUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  status?: LeadStatus;
  score?: number;
  assigned_user_id?: string;
  campaign?: string;
}

export interface Note {
  id: string;
  content: string;
  created_at: string;
}

export interface OrgUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  organization_id: string;
  is_active: boolean;
  email_verified: boolean;
  avatar_url: string | null;
}

export interface UserListResponse {
  items: OrgUser[];
  total: number;
}

export interface InviteResponse {
  invite_token: string;
  invite_url: string;
  message: string;
}

export interface DashboardKpis {
  total_leads: { value: number; trend_pct: number; label: string };
  qualified_leads: { value: number; trend_pct: number; label: string };
  consultations: { value: number; trend_pct: number; label: string };
  retained_clients: { value: number; trend_pct: number; label: string };
}

export interface DashboardResponse {
  kpis: DashboardKpis;
  leads_over_time: { date: string; value: number }[];
  leads_by_source: { source: string; count: number }[];
  funnel: { stage: string; value: number; pct: number }[];
}

// RBAC helpers
export const MANAGER_ROLES: Role[] = ["firm_owner", "intake_manager", "super_admin"];
export const FIRM_OWNER_ROLES: Role[] = ["firm_owner", "super_admin"];

export function isManager(role: Role): boolean {
  return MANAGER_ROLES.includes(role);
}

export function isFirmOwner(role: Role): boolean {
  return FIRM_OWNER_ROLES.includes(role);
}

export function canDeleteLead(role: Role): boolean {
  return isManager(role);
}

export function canSetFinalStatus(role: Role): boolean {
  return isManager(role);
}

export function canInviteUser(role: Role): boolean {
  return isFirmOwner(role);
}

export function canChangeRole(role: Role): boolean {
  return isFirmOwner(role);
}
