"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, User, Plus, Loader2, X, Copy, Check, Shield, Trash2,
  Plug, Eye, EyeOff, CheckCircle2, AlertCircle,
  Phone, Mic, Brain, MessageSquare, Mail, Zap, Link2, ExternalLink,
} from "lucide-react";
import { usersApi, settingsApi, clioApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { canInviteUser, canChangeRole, isFirmOwner } from "@/lib/types";
import type { Role, IntegrationSettingsIn, ClioSyncLog } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  firm_owner: "Firm Owner",
  intake_manager: "Intake Manager",
  intake_specialist: "Intake Specialist",
  attorney: "Attorney",
};

const ROLE_COLORS: Record<Role, string> = {
  super_admin:       "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800",
  firm_owner:        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  intake_manager:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  intake_specialist: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  attorney:          "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700",
};

function RoleBadge({ role }: { role: Role }) {
  const cls = ROLE_COLORS[role] ?? ROLE_COLORS.intake_specialist;
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border font-sans-body ${cls}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

/* ─── Invite Modal ─── */
function InviteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "intake_specialist" });
  const [result, setResult] = useState<{ invite_url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => usersApi.invite(form),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(result!.invite_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!result ? onClose : undefined} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-[#166534] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-[#166534]">
          <h2 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Invite Team Member</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-800 dark:text-emerald-300 text-sm font-semibold font-sans-body">Invitation created</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-sans-body">Share this link with {form.first_name}</p>
              </div>
            </div>

            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
                Invite Link
              </label>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] rounded-xl px-3.5 py-2.5">
                <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono flex-1 truncate">{result.invite_url}</span>
                <button onClick={copyLink}
                  className="text-[#15803d] dark:text-green-400 hover:text-[#166534] transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-1.5 font-sans-body">
                In production, this link will be emailed automatically.
              </p>
            </div>

            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-sans-body transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); mutate(); }} className="px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm font-sans-body bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                {(error as Error).message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[{ label: "First name", key: "first_name", placeholder: "Sarah" },
                { label: "Last name", key: "last_name", placeholder: "Thornton" }].map(f => (
                <div key={f.key}>
                  <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <input type="text" required value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 outline-none transition-colors font-sans-body" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Work Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="sarah@lawfirm.com"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 outline-none transition-colors font-sans-body" />
            </div>

            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none font-sans-body">
                <option value="intake_specialist">Intake Specialist</option>
                <option value="intake_manager">Intake Manager</option>
                <option value="attorney">Attorney</option>
                <option value="firm_owner">Firm Owner</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-[#166534] text-zinc-600 dark:text-zinc-400 text-sm font-semibold font-sans-body hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-sans-body transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Integrations tab ─── */
type SectionKey = "callrail" | "transcription" | "ai" | "sms" | "email" | "followup" | "clio";

const SECTIONS: { key: SectionKey; label: string; subtitle: string; Icon: React.ElementType }[] = [
  { key: "callrail",      label: "CallRail",      subtitle: "Call tracking",  Icon: Phone },
  { key: "transcription", label: "Transcription", subtitle: "Speech-to-text", Icon: Mic },
  { key: "ai",            label: "AI Analysis",   subtitle: "Lead scoring",   Icon: Brain },
  { key: "sms",           label: "Twilio SMS",    subtitle: "Automated SMS",  Icon: MessageSquare },
  { key: "email",         label: "Email",         subtitle: "Notifications",  Icon: Mail },
  { key: "followup",      label: "Follow-Up",     subtitle: "Sequences",      Icon: Zap },
  { key: "clio",          label: "Clio",          subtitle: "Practice mgmt",  Icon: Link2 },
];

function IntegrationsTab() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [section, setSection] = useState<SectionKey>("callrail");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<IntegrationSettingsIn>({});
  const [saved, setSaved] = useState(false);
  const [clioNotice, setClioNotice] = useState<"connected" | "error" | null>(null);
  const [clioConnecting, setClioConnecting] = useState(false);
  const [clioConnectError, setClioConnectError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: settingsApi.getIntegrations,
  });

  const { data: clioLogs } = useQuery({
    queryKey: ["clio-sync-logs"],
    queryFn: () => clioApi.getSyncLogs({ page_size: 8 }),
    enabled: section === "clio",
  });

  const disconnectClio = useMutation({
    mutationFn: clioApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["clio-sync-logs"] });
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => settingsApi.updateIntegrations(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setForm({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    const clio = searchParams.get("clio");
    if (clio === "connected") {
      setSection("clio");
      setClioNotice("connected");
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      setTimeout(() => setClioNotice(null), 6000);
    } else if (clio === "error") {
      setSection("clio");
      setClioNotice("error");
      setTimeout(() => setClioNotice(null), 6000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleShow = (key: string) => setShowKeys(p => ({ ...p, [key]: !p[key] }));
  const set = (field: keyof IntegrationSettingsIn, value: string) => setForm(p => ({ ...p, [field]: value }));
  const clear = (field: keyof IntegrationSettingsIn) => setForm(p => ({ ...p, [field]: "" }));

  const isConfigured = (key: SectionKey): boolean => {
    if (!data) return false;
    switch (key) {
      case "callrail":      return data.has_callrail_key;
      case "transcription": return data.has_openai_key || data.has_deepgram_key || data.has_assemblyai_key;
      case "ai":            return data.has_openai_key || data.has_anthropic_key || data.has_google_key;
      case "sms":           return data.has_twilio;
      case "email":         return data.has_sendgrid_key;
      case "followup":      return !!(data.missed_call_sms_enabled || data.followup_24h_enabled || data.followup_72h_enabled);
      case "clio":          return data.has_clio;
    }
  };

  // ── Inner field components ────────────────────────────────────────────────

  const KeyField = ({ label, field, description, configured }: {
    label: string; field: keyof IntegrationSettingsIn; description: string; configured: boolean;
  }) => {
    const visible = showKeys[field as string];
    const currentVal = form[field] as string | undefined;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold font-sans-body uppercase tracking-wider">{label}</label>
          <span className={`flex items-center gap-1 text-xs font-semibold font-sans-body ${configured ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`}>
            {configured ? <><CheckCircle2 className="w-3.5 h-3.5" />Configured</> : <><AlertCircle className="w-3.5 h-3.5" />Not set</>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input type={visible ? "text" : "password"}
              placeholder={configured ? "Enter new key to rotate…" : "Paste your API key…"}
              value={currentVal ?? ""} onChange={e => set(field, e.target.value)}
              autoComplete="new-password"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 pr-10 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 outline-none transition-colors font-mono" />
            <button type="button" onClick={() => toggleShow(field as string)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {configured && (
            <button type="button" onClick={() => clear(field)} title="Remove key"
              className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-800 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">{description}</p>
      </div>
    );
  };

  const TextField = ({ label, field, placeholder, description, type = "text" }: {
    label: string; field: keyof IntegrationSettingsIn; placeholder: string; description?: string; type?: string;
  }) => (
    <div>
      <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{label}</label>
      <input type={type} placeholder={placeholder} value={(form[field] as string | undefined) ?? ""}
        autoComplete="off" onChange={e => set(field, e.target.value)}
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 outline-none transition-colors font-mono" />
      {description && <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">{description}</p>}
    </div>
  );

  const ToggleField = ({ label, description, value, onChange }: {
    label: string; description: string; value: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans-body">{label}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-sans-body">{description}</p>
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${value ? "bg-[#15803d]" : "bg-zinc-200 dark:bg-zinc-700"}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );

  // ── Section content ────────────────────────────────────────────────────────

  const missedEnabled = form.missed_call_sms_enabled !== undefined ? form.missed_call_sms_enabled : (data?.missed_call_sms_enabled ?? false);
  const f24hEnabled   = form.followup_24h_enabled   !== undefined ? form.followup_24h_enabled   : (data?.followup_24h_enabled   ?? false);
  const f72hEnabled   = form.followup_72h_enabled   !== undefined ? form.followup_72h_enabled   : (data?.followup_72h_enabled   ?? false);

  const renderContent = () => {
    switch (section) {
      case "callrail":
        return <>
          <TextField label="Account ID" field="callrail_account_id"
            placeholder={data?.callrail_account_id ?? "e.g. AAA111222333"}
            description="Found in CallRail → Settings → Account → Account ID" />
          <KeyField label="API Key" field="callrail_api_key" configured={data?.has_callrail_key ?? false}
            description="Found in CallRail → Settings → API Access. Used to download call recordings." />
        </>;

      case "transcription":
        return <>
          <div>
            <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Primary Provider</label>
            <select value={form.transcription_provider ?? data?.transcription_provider ?? "openai"}
              onChange={e => set("transcription_provider", e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none font-sans-body">
              <option value="openai">OpenAI Whisper</option>
              <option value="deepgram">Deepgram Nova-2 (free tier available)</option>
              <option value="assemblyai">AssemblyAI (free tier available)</option>
            </select>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">Other configured providers are tried automatically on failure.</p>
          </div>
          <KeyField label="OpenAI API Key" field="openai_api_key" configured={data?.has_openai_key ?? false}
            description="Whisper transcription + GPT-4o mini fallback analysis. platform.openai.com/api-keys" />
          <KeyField label="Deepgram API Key" field="deepgram_api_key" configured={data?.has_deepgram_key ?? false}
            description="Nova-2 — fast, accurate, free tier: 12,000 min/year. console.deepgram.com" />
          <KeyField label="AssemblyAI API Key" field="assemblyai_api_key" configured={data?.has_assemblyai_key ?? false}
            description="Free tier: 100 hours. Strong accuracy on legal/medical content. app.assemblyai.com" />
        </>;

      case "ai":
        return <>
          <div>
            <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Primary Provider</label>
            <select value={form.ai_primary_provider ?? data?.ai_primary_provider ?? "openai"}
              onChange={e => set("ai_primary_provider", e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none font-sans-body">
              <option value="openai">OpenAI (GPT-4o mini)</option>
              <option value="anthropic">Anthropic (Claude Haiku)</option>
              <option value="google">Google (Gemini 1.5 Flash)</option>
            </select>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">Other providers are used as automatic fallbacks if the primary fails.</p>
          </div>
          <KeyField label="Anthropic API Key" field="anthropic_api_key" configured={data?.has_anthropic_key ?? false}
            description="Claude Haiku — fallback analysis provider. console.anthropic.com/settings/keys" />
          <KeyField label="Google API Key" field="google_api_key" configured={data?.has_google_key ?? false}
            description="Gemini 1.5 Flash — second fallback. aistudio.google.com/apikey" />
        </>;

      case "sms":
        return <>
          <TextField label="Account SID" field="twilio_account_sid"
            placeholder={data?.has_twilio ? "Configured — enter to rotate" : "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
            description="Found in Twilio Console → Account Info" />
          <KeyField label="Auth Token" field="twilio_auth_token" configured={data?.has_twilio ?? false}
            description="Found in Twilio Console → Account Info. Encrypted at rest, never returned." />
          <TextField label="From Number" field="twilio_from_number"
            placeholder={data?.twilio_from_number ?? "+15550001234"}
            description="Your Twilio phone number in E.164 format (e.g. +15550001234)" />
        </>;

      case "email":
        return <>
          <KeyField label="SendGrid API Key" field="sendgrid_api_key" configured={data?.has_sendgrid_key ?? false}
            description="app.sendgrid.com/settings/api_keys — Full Access or Mail Send scope required." />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="From Email" field="notification_from_email" type="email"
              placeholder={data?.notification_from_email ?? "intake@yourfirm.com"} />
            <TextField label="From Name" field="notification_from_name"
              placeholder={data?.notification_from_name ?? "Law Cube Intake"} />
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-sans-body -mt-1">
            The sending address must be verified in SendGrid before emails will deliver.
          </p>
        </>;

      case "followup":
        return <>
          <ToggleField label="Missed Call SMS"
            description="Send an SMS immediately when a call is missed and goes unanswered"
            value={missedEnabled} onChange={v => setForm(p => ({ ...p, missed_call_sms_enabled: v }))} />
          {missedEnabled && (
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Missed Call Template</label>
              <textarea rows={3}
                value={form.missed_call_sms_template ?? (data?.missed_call_sms_template ?? "Hi {first_name}, we missed your call at {firm_name}. We'd love to help — reply or call back to speak with our intake team.")}
                onChange={e => set("missed_call_sms_template", e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors font-sans-body resize-none" />
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">Variables: {"{first_name}"}, {"{firm_name}"}, {"{case_type}"}</p>
            </div>
          )}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <ToggleField label="24-Hour Follow-Up"
            description="Contact leads who haven't responded 24 hours after a missed call"
            value={f24hEnabled} onChange={v => setForm(p => ({ ...p, followup_24h_enabled: v }))} />
          {f24hEnabled && (
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">24h Template</label>
              <textarea rows={3}
                value={form.followup_24h_sms_template ?? (data?.followup_24h_sms_template ?? "Hi {first_name}, just following up on your call yesterday. We're here to help — reply anytime to schedule a free consultation.")}
                onChange={e => set("followup_24h_sms_template", e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors font-sans-body resize-none" />
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">Variables: {"{first_name}"}, {"{firm_name}"}, {"{case_type}"}</p>
            </div>
          )}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
          <ToggleField label="72-Hour Follow-Up"
            description="Send a final follow-up to leads who still haven't responded after 72 hours"
            value={f72hEnabled} onChange={v => setForm(p => ({ ...p, followup_72h_enabled: v }))} />
          {f72hEnabled && (
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">72h Template</label>
              <textarea rows={3}
                value={form.followup_72h_sms_template ?? (data?.followup_72h_sms_template ?? "Hi {first_name}, we're still here if you need help. Schedule a free consultation at your convenience — no obligation.")}
                onChange={e => set("followup_72h_sms_template", e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-colors font-sans-body resize-none" />
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5 font-sans-body">Variables: {"{first_name}"}, {"{firm_name}"}, {"{case_type}"}</p>
            </div>
          )}
          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-sans-body">
            Sequences respect opt-outs — leads reply STOP to unsubscribe, UNSTOP to resubscribe.
          </p>
        </>;

      case "clio": {
        const connected = data?.has_clio ?? false;
        const connectedAt = data?.clio_connected_at
          ? new Date(data.clio_connected_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : null;

        const connectClio = async () => {
          setClioConnecting(true);
          setClioConnectError(null);
          try {
            const { url } = await clioApi.getAuthUrl();
            window.location.href = url;
          } catch (err) {
            setClioConnecting(false);
            setClioConnectError((err as Error).message ?? "Failed to start Clio connection. Check that CLIO_CLIENT_ID is set in your backend .env.");
          }
        };

        const OP_LABELS: Record<string, string> = {
          contact_create: "Contact created",
          contact_update: "Contact updated",
          matter_create:  "Matter created",
          note_create:    "Note created",
        };

        return <>
          {clioNotice === "connected" && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-emerald-800 dark:text-emerald-300 text-sm font-semibold font-sans-body">Clio connected successfully!</p>
            </div>
          )}
          {clioNotice === "error" && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-800 dark:text-red-300 text-sm font-semibold font-sans-body">Clio connection failed. Please try again.</p>
            </div>
          )}

          {connected ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 font-sans-body">Connected to Clio</p>
                    {connectedAt && <p className="text-xs text-emerald-600 dark:text-emerald-500 font-sans-body">Since {connectedAt}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (confirm("Disconnect Clio? Sync will stop until reconnected.")) disconnectClio.mutate(); }}
                  disabled={disconnectClio.isPending}
                  className="flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all font-sans-body disabled:opacity-50">
                  {disconnectClio.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  Disconnect
                </button>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-sans-body uppercase tracking-wider mb-3">How sync works</p>
                <div className="flex flex-col gap-2">
                  {[
                    ["Consultation Scheduled", "Clio contact created / updated"],
                    ["Retained",               "Clio matter created + AI summary note pushed"],
                    ["Manual",                 "Push any lead from the lead detail page"],
                  ].map(([trigger, action]) => (
                    <div key={trigger} className="flex items-center gap-3 text-sm font-sans-body">
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium w-52 shrink-0">{trigger}</span>
                      <span className="text-zinc-400 dark:text-zinc-500">→</span>
                      <span className="text-zinc-500 dark:text-zinc-400">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {clioLogs && clioLogs.items.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 font-sans-body uppercase tracking-wider mb-3">Recent Sync Activity</p>
                  <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {clioLogs.items.map((log: ClioSyncLog) => (
                      <div key={log.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-sans-body flex-1">{OP_LABELS[log.operation] ?? log.operation}</span>
                        {log.clio_entity_id && <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">#{log.clio_entity_id}</span>}
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600 font-sans-body shrink-0">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 font-sans-body mb-1.5">Connect your Clio account</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans-body leading-relaxed">
                  Sync leads to Clio as contacts and matters automatically. When a lead is marked as retained, Law Cube creates a Clio matter and pushes the AI intake summary as a note.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {["Automatic contact creation on consultation scheduled", "Matter + AI note on retention", "Manual push from any lead page", "Inbound Clio webhooks to keep records in sync"].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 font-sans-body">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              {clioConnectError && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300 font-sans-body">{clioConnectError}</p>
                </div>
              )}
              <button
                type="button"
                onClick={connectClio}
                disabled={clioConnecting}
                className="flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors font-sans-body disabled:opacity-60 w-fit">
                {clioConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Connect to Clio
              </button>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-sans-body -mt-2">
                You will be redirected to Clio to authorize Law Cube. A Clio account is required.
              </p>
            </div>
          )}
        </>;
      }
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-[#166534] rounded-2xl overflow-hidden flex" style={{ minHeight: 520 }}>
        <div className="w-52 shrink-0 border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 p-2 flex flex-col gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="flex-1 p-6 flex flex-col gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeSection = SECTIONS.find(s => s.key === section)!;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-[#166534] rounded-2xl overflow-hidden flex" style={{ minHeight: 540 }}>

      {/* ── Left sidebar ── */}
      <div className="w-52 shrink-0 border-r border-zinc-100 dark:border-zinc-800 flex flex-col bg-zinc-50/40 dark:bg-zinc-900/30">
        {SECTIONS.map(({ key, label, subtitle, Icon }) => {
          const active = section === key;
          const configured = isConfigured(key);
          return (
            <button key={key} type="button" onClick={() => setSection(key)}
              className={`relative flex items-center gap-3 px-4 py-3.5 text-left transition-colors group ${
                active ? "bg-white dark:bg-zinc-950" : "hover:bg-white/60 dark:hover:bg-zinc-950/40"
              }`}>
              {active && <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#15803d]" />}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                active ? "bg-[#f0fdf4] dark:bg-emerald-950/50" : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-700/50"
              }`}>
                <Icon className={`w-3.5 h-3.5 transition-colors ${active ? "text-[#15803d]" : "text-zinc-400 dark:text-zinc-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold font-sans-body leading-tight ${active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>{label}</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-sans-body mt-0.5">{subtitle}</p>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${configured ? "bg-[#22c55e]" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            </button>
          );
        })}
      </div>

      {/* ── Right content panel ── */}
      <form onSubmit={e => { e.preventDefault(); mutate(); }} className="flex-1 flex flex-col overflow-hidden">
        <input type="text" autoComplete="username" className="hidden" aria-hidden="true" readOnly />
        <input type="password" autoComplete="current-password" className="hidden" aria-hidden="true" readOnly />

        {/* Panel header */}
        <div className="shrink-0 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] dark:bg-emerald-950/50 flex items-center justify-center">
              <activeSection.Icon className="w-4 h-4 text-[#15803d]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-tight">{activeSection.label}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body">{activeSection.subtitle}</p>
            </div>
          </div>
          {isConfigured(section) && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans-body bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />Configured
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 shrink-0 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 font-sans-body">
            {(error as Error).message}
          </div>
        )}

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {renderContent()}
        </div>

        {/* Sticky footer — hidden for Clio which has its own inline controls */}
        {section !== "clio" && (
          <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-50/40 dark:bg-zinc-900/30">
            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-sans-body">
              Keys are encrypted at rest and never returned to the client.
            </p>
            <button type="submit" disabled={isPending || Object.keys(form).length === 0}
              className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors font-sans-body disabled:opacity-50">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" />Saved</> : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

/* ─── Settings page ─── */
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const role = currentUser?.role ?? "intake_specialist";

  const [tab, setTab] = useState<"profile" | "team" | "integrations">("team");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
    enabled: tab === "team",
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: string }) => usersApi.updateRole(id, newRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const members = usersData?.items ?? [];

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-sans-body">Manage your firm profile and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-[#166534]">
        {[
          { key: "team" as const, label: "Team", icon: Users },
          { key: "profile" as const, label: "Profile", icon: User },
          { key: "integrations" as const, label: "Integrations", icon: Plug },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold font-sans-body border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#15803d] text-[#15803d] dark:text-green-400 dark:border-green-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Team tab */}
      {tab === "team" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Team Members</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans-body">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canInviteUser(role) && (
              <button onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md font-sans-body">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Invite Member</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-[#166534] rounded-2xl overflow-hidden">
            {usersLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans-body">No team members yet</p>
                {canInviteUser(role) && (
                  <button onClick={() => setInviteOpen(true)}
                    className="mt-3 text-[#15803d] dark:text-green-400 text-sm font-semibold hover:underline font-sans-body">
                    Invite your first team member
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-[#15803d] flex items-center justify-center border border-green-800/20 shrink-0">
                      <span className="text-white text-sm font-bold font-sans-body">
                        {member.first_name[0]}{member.last_name[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm font-sans-body">
                          {member.first_name} {member.last_name}
                          {member.id === currentUser?.id && (
                            <span className="text-zinc-400 dark:text-zinc-500 font-normal"> (you)</span>
                          )}
                        </span>
                        {!member.is_active && (
                          <span className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-sans-body">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body truncate">{member.email}</p>
                    </div>

                    <div className="shrink-0">
                      {canChangeRole(role) && member.id !== currentUser?.id ? (
                        <select
                          value={member.role}
                          onChange={e => roleChangeMutation.mutate({ id: member.id, newRole: e.target.value })}
                          className="bg-transparent border-0 outline-none text-xs font-semibold font-sans-body cursor-pointer"
                          style={{ color: ({ super_admin: "#7c3aed", firm_owner: "#15803d", intake_manager: "#b45309", intake_specialist: "#15803d", attorney: "#52525b" } as Record<string, string>)[member.role] ?? "#52525b" }}
                        >
                          <option value="intake_specialist">Intake Specialist</option>
                          <option value="intake_manager">Intake Manager</option>
                          <option value="attorney">Attorney</option>
                          <option value="firm_owner">Firm Owner</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role as Role} />
                      )}
                    </div>

                    {isFirmOwner(role) && member.id !== currentUser?.id && member.is_active && (
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate ${member.first_name} ${member.last_name}? They will lose access immediately.`)) {
                            deactivateMutation.mutate(member.id);
                          }
                        }}
                        disabled={deactivateMutation.isPending}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-all shrink-0"
                        title="Deactivate user"
                      >
                        {deactivateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-[#166534] rounded-xl">
            <Shield className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body leading-relaxed">
              All user actions are audit-logged. Role changes take effect immediately. Deactivated users retain their data but cannot log in.
            </p>
          </div>
        </div>
      )}

      {/* Profile tab */}
      {tab === "profile" && currentUser && (
        <div className="flex flex-col gap-5">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-[#166534] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#15803d] flex items-center justify-center border-2 border-green-200 dark:border-green-900">
                <span className="text-white text-xl font-bold font-sans-body">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-xl">
                  {currentUser.first_name} {currentUser.last_name}
                </h3>
                <RoleBadge role={currentUser.role as Role} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "First name", value: currentUser.first_name },
                { label: "Last name", value: currentUser.last_name },
                { label: "Email address", value: currentUser.email },
                { label: "Role", value: ROLE_LABELS[currentUser.role as Role] ?? currentUser.role },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 text-sm font-sans-body">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-4 font-sans-body">
              Profile editing will be available in a future update.
            </p>
          </div>
        </div>
      )}

      {/* Integrations tab */}
      {tab === "integrations" && isFirmOwner(role) && <IntegrationsTab />}
      {tab === "integrations" && !isFirmOwner(role) && (
        <div className="flex items-center gap-3 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-800 dark:text-amber-300 text-sm font-sans-body">
            Only Firm Owners can manage integration settings.
          </p>
        </div>
      )}

      <AnimatePresence>
        {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
