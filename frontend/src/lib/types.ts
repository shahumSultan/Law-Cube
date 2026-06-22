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
  plan: string;
  trial_ends_at: string | null;
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

export interface IntegrationSettingsOut {
  has_callrail_key: boolean;
  has_openai_key: boolean;
  has_anthropic_key: boolean;
  has_google_key: boolean;
  has_deepgram_key: boolean;
  has_assemblyai_key: boolean;
  has_twilio: boolean;
  has_sendgrid_key: boolean;
  ai_primary_provider: string;
  transcription_provider: string;
  callrail_account_id: string | null;
  notification_from_email: string | null;
  notification_from_name: string | null;
  twilio_from_number: string | null;
  missed_call_sms_enabled: boolean;
  followup_24h_enabled: boolean;
  followup_72h_enabled: boolean;
  missed_call_sms_template: string | null;
  followup_24h_sms_template: string | null;
  followup_72h_sms_template: string | null;
  has_clio: boolean;
  clio_connected_at: string | null;
}

export interface ClioSyncLog {
  id: string;
  lead_id: string | null;
  operation: string;
  status: string;
  clio_entity_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ClioSyncLogListResponse {
  items: ClioSyncLog[];
  total: number;
}

export interface IntegrationSettingsIn {
  callrail_api_key?: string;
  callrail_account_id?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  google_api_key?: string;
  ai_primary_provider?: string;
  deepgram_api_key?: string;
  assemblyai_api_key?: string;
  transcription_provider?: string;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_from_number?: string;
  sendgrid_api_key?: string;
  notification_from_email?: string;
  notification_from_name?: string;
  missed_call_sms_enabled?: boolean;
  followup_24h_enabled?: boolean;
  followup_72h_enabled?: boolean;
  missed_call_sms_template?: string;
  followup_24h_sms_template?: string;
  followup_72h_sms_template?: string;
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

export interface FollowUpLogEntry {
  id: string;
  lead_id: string;
  lead_name: string | null;
  lead_phone: string | null;
  sequence_step: number;
  channel: string;
  sent_at: string;
}

export interface FollowUpStats {
  sent_this_month: number;
  sent_24h: number;
  sent_72h: number;
  sent_missed_call: number;
  opted_out_leads: number;
}
