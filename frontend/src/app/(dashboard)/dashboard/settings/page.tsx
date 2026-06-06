"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, User, Plus, Loader2, X, Copy, Check,
  Shield, Trash2, Plug, Eye, EyeOff, CheckCircle2, AlertCircle,
} from "lucide-react";
import { usersApi, settingsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { canInviteUser, canChangeRole, isFirmOwner } from "@/lib/types";
import type { Role, IntegrationSettingsIn } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  firm_owner: "Firm Owner",
  intake_manager: "Intake Manager",
  intake_specialist: "Intake Specialist",
  attorney: "Attorney",
};

const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  super_admin:       { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
  firm_owner:        { bg: "#EFF6FF", text: "#1E3A8A", border: "#BFDBFE" },
  intake_manager:    { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  intake_specialist: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  attorney:          { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
};

function RoleBadge({ role }: { role: Role }) {
  const c = ROLE_COLORS[role] ?? ROLE_COLORS.intake_specialist;
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full font-sans-body"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
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
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Invite Team Member</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
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
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
                Invite Link
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5">
                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono flex-1 truncate">{result.invite_url}</span>
                <button onClick={copyLink}
                  className="text-[#1E3A8A] dark:text-blue-400 hover:text-[#1D4ED8] transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-1.5 font-sans-body">
                In production, this link will be emailed automatically.
              </p>
            </div>

            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold font-sans-body transition-colors">
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
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <input type="text" required value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Work Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="sarah@lawfirm.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none font-sans-body">
                <option value="intake_specialist">Intake Specialist</option>
                <option value="intake_manager">Intake Manager</option>
                <option value="attorney">Attorney</option>
                <option value="firm_owner">Firm Owner</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold font-sans-body hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold font-sans-body transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
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
function IntegrationsTab() {
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<IntegrationSettingsIn>({});
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: settingsApi.getIntegrations,
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

  const toggle = (key: string) =>
    setShowKeys(p => ({ ...p, [key]: !p[key] }));

  const set = (field: keyof IntegrationSettingsIn, value: string) =>
    setForm(p => ({ ...p, [field]: value }));

  const clear = (field: keyof IntegrationSettingsIn) =>
    setForm(p => ({ ...p, [field]: "" }));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const KeyField = ({
    label, field, description, configured,
  }: {
    label: string;
    field: keyof IntegrationSettingsIn;
    description: string;
    configured: boolean;
  }) => {
    const visible = showKeys[field];
    const currentVal = form[field] as string | undefined;
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold font-sans-body uppercase tracking-wider">
            {label}
          </label>
          <span className={`flex items-center gap-1 text-xs font-semibold font-sans-body ${
            configured ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
          }`}>
            {configured
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Configured</>
              : <><AlertCircle className="w-3.5 h-3.5" /> Not set</>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={visible ? "text" : "password"}
              placeholder={configured ? "Enter new key to rotate…" : "Paste your API key…"}
              value={currentVal ?? ""}
              onChange={e => set(field, e.target.value)}
              autoComplete="new-password"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => toggle(field)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {configured && (
            <button
              type="button"
              onClick={() => clear(field)}
              title="Remove key"
              className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-800 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-sans-body">{description}</p>
      </div>
    );
  };

  return (
    <form onSubmit={e => { e.preventDefault(); mutate(); }} className="flex flex-col gap-5">
      {/* Hidden fields absorb browser autofill before it reaches real inputs */}
      <input type="text" autoComplete="username" className="hidden" aria-hidden="true" readOnly />
      <input type="password" autoComplete="current-password" className="hidden" aria-hidden="true" readOnly />
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 font-sans-body">
          {(error as Error).message}
        </p>
      )}

      {/* CallRail */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-blue-950/30 flex items-center justify-center">
            <Plug className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">CallRail</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Inbound call tracking and attribution</p>
          </div>
        </div>
        <div>
          <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
            Account ID
          </label>
          <input
            type="text"
            placeholder={data?.callrail_account_id ?? "e.g. AAA111222333"}
            value={form.callrail_account_id ?? ""}
            autoComplete="off"
            onChange={e => set("callrail_account_id", e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-mono"
          />
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-sans-body">
            Found in CallRail → Settings → Account → Account ID
          </p>
        </div>
        <KeyField
          label="API Key"
          field="callrail_api_key"
          configured={data?.has_callrail_key ?? false}
          description="Found in CallRail → Settings → API Access. Used to download call recordings."
        />
      </div>

      {/* Transcription */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] dark:bg-emerald-950/30 flex items-center justify-center">
            <span className="text-emerald-700 text-sm font-bold">STT</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">Transcription</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Converts call recordings to text — configure at least one provider</p>
          </div>
        </div>

        <div>
          <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
            Primary Provider
          </label>
          <select
            value={form.transcription_provider ?? data?.transcription_provider ?? "openai"}
            onChange={e => set("transcription_provider", e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none font-sans-body"
          >
            <option value="openai">OpenAI Whisper</option>
            <option value="deepgram">Deepgram Nova-2 (free tier available)</option>
            <option value="assemblyai">AssemblyAI (free tier available)</option>
          </select>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-sans-body">
            Other providers with a key configured are tried automatically if the primary fails.
          </p>
        </div>

        <KeyField
          label="OpenAI API Key"
          field="openai_api_key"
          configured={data?.has_openai_key ?? false}
          description="Used for Whisper transcription. Also used for GPT-4o mini call analysis. platform.openai.com/api-keys"
        />
        <KeyField
          label="Deepgram API Key"
          field="deepgram_api_key"
          configured={data?.has_deepgram_key ?? false}
          description="Nova-2 model — fast, accurate, free tier: 12,000 min/year. console.deepgram.com"
        />
        <KeyField
          label="AssemblyAI API Key"
          field="assemblyai_api_key"
          configured={data?.has_assemblyai_key ?? false}
          description="Free tier: 100 hours. Good accuracy on legal/medical content. app.assemblyai.com"
        />
      </div>

      {/* AI Analysis Providers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] dark:bg-purple-950/30 flex items-center justify-center">
            <span className="text-[#5B21B6] text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">AI Analysis</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Lead scoring, call classification, and sentiment analysis</p>
          </div>
        </div>

        <div>
          <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
            Primary Provider
          </label>
          <select
            value={form.ai_primary_provider ?? data?.ai_primary_provider ?? "openai"}
            onChange={e => set("ai_primary_provider", e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none font-sans-body"
          >
            <option value="openai">OpenAI (GPT-4o mini)</option>
            <option value="anthropic">Anthropic (Claude Haiku)</option>
            <option value="google">Google (Gemini 1.5 Flash)</option>
          </select>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-sans-body">
            Other providers are used as automatic fallbacks if the primary fails.
          </p>
        </div>

        <KeyField
          label="Anthropic API Key"
          field="anthropic_api_key"
          configured={data?.has_anthropic_key ?? false}
          description="Used as fallback AI analysis provider. console.anthropic.com/settings/keys"
        />
        <KeyField
          label="Google API Key"
          field="google_api_key"
          configured={data?.has_google_key ?? false}
          description="Used as second fallback AI provider. aistudio.google.com/apikey"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-sans-body">
          Keys are stored encrypted and never returned in API responses.
        </p>
        <button
          type="submit"
          disabled={isPending || Object.keys(form).length === 0}
          className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors font-sans-body disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><Check className="w-4 h-4" /> Saved</>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
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
        <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-sans-body">Manage your firm profile and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {[
          { key: "team" as const, label: "Team", icon: Users },
          { key: "profile" as const, label: "Profile", icon: User },
          { key: "integrations" as const, label: "Integrations", icon: Plug },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold font-sans-body border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400 dark:border-blue-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
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
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Team Members</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canInviteUser(role) && (
              <button onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md font-sans-body">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Invite Member</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {usersLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">No team members yet</p>
                {canInviteUser(role) && (
                  <button onClick={() => setInviteOpen(true)}
                    className="mt-3 text-[#1E3A8A] dark:text-blue-400 text-sm font-semibold hover:underline font-sans-body">
                    Invite your first team member
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center border border-blue-800/20 shrink-0">
                      <span className="text-white text-sm font-bold font-sans-body">
                        {member.first_name[0]}{member.last_name[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                          {member.first_name} {member.last_name}
                          {member.id === currentUser?.id && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal"> (you)</span>
                          )}
                        </span>
                        {!member.is_active && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-sans-body">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body truncate">{member.email}</p>
                    </div>

                    <div className="shrink-0">
                      {canChangeRole(role) && member.id !== currentUser?.id ? (
                        <select
                          value={member.role}
                          onChange={e => roleChangeMutation.mutate({ id: member.id, newRole: e.target.value })}
                          className="bg-transparent border-0 outline-none text-xs font-semibold font-sans-body cursor-pointer"
                          style={{ color: ROLE_COLORS[member.role as Role]?.text ?? "#475569" }}
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
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 transition-all shrink-0"
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

          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body leading-relaxed">
              All user actions are audit-logged. Role changes take effect immediately. Deactivated users retain their data but cannot log in.
            </p>
          </div>
        </div>
      )}

      {/* Profile tab */}
      {tab === "profile" && currentUser && (
        <div className="flex flex-col gap-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#1E3A8A] flex items-center justify-center border-2 border-blue-200 dark:border-blue-900">
                <span className="text-white text-xl font-bold font-sans-body">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl">
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
                  <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs mt-4 font-sans-body">
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
