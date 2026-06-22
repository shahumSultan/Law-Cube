"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MessageSquare, Zap, Clock, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Phone, Mail, Settings,
  ToggleLeft, ToggleRight, Edit3, Save, X, Users,
} from "lucide-react";
import { followupApi, settingsApi } from "@/lib/api";
import type { FollowUpLogEntry, IntegrationSettingsIn } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="font-display font-bold text-2xl text-zinc-900 dark:text-zinc-100">{value.toLocaleString()}</div>
        <div className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── Sequence card ─────────────────────────────────────────────────────────────

const DEFAULT_TEMPLATES = {
  missed_call: "Hi, you just called {firm_name}. We missed you! Reply to schedule a free consultation or call us back at {callback_number}. Reply STOP to opt out.",
  followup_24h: "Hi {lead_name}, this is {firm_name} following up. We'd love to discuss your case — call us at {callback_number} or reply here. Reply STOP to opt out.",
  followup_72h: "Hi {lead_name}, final follow-up from {firm_name}. We're still here to help — {callback_number}. Reply STOP to unsubscribe.",
};

function SequenceCard({
  title,
  subtitle,
  description,
  enabled,
  template,
  templateKey,
  enabledKey,
  onToggle,
  onSaveTemplate,
  hasTwilio,
}: {
  title: string;
  subtitle: string;
  description: string;
  enabled: boolean;
  template: string;
  templateKey: string;
  enabledKey: string;
  onToggle: (key: string, value: boolean) => void;
  onSaveTemplate: (key: string, value: string) => void;
  hasTwilio: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(template);

  const handleSave = () => {
    onSaveTemplate(templateKey, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(template);
    setEditing(false);
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
      enabled && hasTwilio
        ? "border-zinc-200 dark:border-[#166534]"
        : "border-zinc-200 dark:border-zinc-800 opacity-75"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            enabled && hasTwilio
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-zinc-100 dark:bg-zinc-800"
          }`}>
            <MessageSquare className={`w-4 h-4 ${
              enabled && hasTwilio ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-base">{title}</h3>
              <span className="text-zinc-400 dark:text-zinc-600 text-xs font-sans-body font-medium">{subtitle}</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => hasTwilio && onToggle(enabledKey, !enabled)}
          disabled={!hasTwilio}
          title={!hasTwilio ? "Configure Twilio in Settings to enable" : undefined}
          className="shrink-0 mt-1 disabled:cursor-not-allowed"
        >
          {enabled && hasTwilio
            ? <ToggleRight className="w-8 h-8 text-[#22c55e]" />
            : <ToggleLeft className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
          }
        </button>
      </div>

      {/* Template */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold font-sans-body uppercase tracking-wider">
            SMS Template
          </span>
          {!editing ? (
            <button
              onClick={() => { setDraft(template); setEditing(true); }}
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-[#15803d] dark:hover:text-emerald-400 transition-colors font-sans-body"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={handleCancel} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors font-sans-body">
                <X className="w-3 h-3" /> Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs text-[#15803d] dark:text-emerald-400 font-semibold hover:text-[#166534] transition-colors font-sans-body">
                <Save className="w-3 h-3" /> Save
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#15803d] dark:focus:border-emerald-600 rounded-xl px-3.5 py-3 text-zinc-900 dark:text-zinc-100 text-xs font-mono leading-relaxed outline-none transition-colors resize-none"
          />
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3.5 py-3 text-zinc-600 dark:text-zinc-400 text-xs font-mono leading-relaxed border border-zinc-100 dark:border-zinc-700">
            {template}
          </div>
        )}

        <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-sans-body mt-2">
          Variables:{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{firm_name}"}</code>{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{callback_number}"}</code>{" "}
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{"{lead_name}"}</code>
        </p>
      </div>
    </div>
  );
}

// ── Activity log helpers ───────────────────────────────────────────────────────

function ChannelIcon({ channel }: { channel: string }) {
  if (channel === "sms") return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
  return <Mail className="w-3.5 h-3.5 text-blue-500" />;
}

function StepLabel({ step }: { step: number }) {
  const map: Record<number, { label: string; cls: string }> = {
    0: { label: "Missed call", cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" },
    1: { label: "24h follow-up", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" },
    2: { label: "72h follow-up", cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" },
  };
  const entry = map[step] ?? map[1];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border font-sans-body ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

// ── Twilio empty state ─────────────────────────────────────────────────────────

function TwilioEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
        <MessageSquare className="w-6 h-6 text-zinc-400" />
      </div>
      <div>
        <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg">Twilio not configured</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans-body mt-1 max-w-sm">
          Add your Twilio Account SID, Auth Token, and From Number in Settings to enable SMS follow-up automation.
        </p>
      </div>
      <a
        href="/dashboard/settings"
        className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors font-sans-body"
      >
        <Settings className="w-4 h-4" /> Go to Settings
      </a>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FollowUpPage() {
  const qc = useQueryClient();
  const [logPage, setLogPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState("");
  const [stepFilter, setStepFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["integrations"],
    queryFn: settingsApi.getIntegrations,
  });

  const { data: stats } = useQuery({
    queryKey: ["followup-stats"],
    queryFn: followupApi.getStats,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["followup-logs", logPage, channelFilter, stepFilter],
    queryFn: () => followupApi.getLogs({
      page: logPage,
      page_size: 20,
      channel: channelFilter || undefined,
      step: stepFilter !== "" ? Number(stepFilter) : undefined,
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (body: IntegrationSettingsIn) => settingsApi.updateIntegrations(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      setSaving(false);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    },
    onError: () => setSaving(false),
  });

  const handleToggle = (key: string, value: boolean) => {
    setSaving(true);
    updateMutation.mutate({ [key]: value } as IntegrationSettingsIn);
  };

  const handleSaveTemplate = (key: string, value: string) => {
    setSaving(true);
    updateMutation.mutate({ [key]: value } as IntegrationSettingsIn);
  };

  const hasTwilio = settings?.has_twilio ?? false;
  const logs: FollowUpLogEntry[] = logsData?.items ?? [];
  const totalLogs = logsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalLogs / 20));

  const sequences = settings
    ? [
        {
          title: "Missed Call",
          subtitle: "· Immediate",
          description:
            "Fires automatically when CallRail reports a missed or no-answer call. Texts the caller within 60 seconds.",
          enabled: settings.missed_call_sms_enabled,
          template: settings.missed_call_sms_template ?? DEFAULT_TEMPLATES.missed_call,
          templateKey: "missed_call_sms_template",
          enabledKey: "missed_call_sms_enabled",
        },
        {
          title: "24h Follow-Up",
          subtitle: "· 1 day",
          description:
            "Sent to qualified leads still in 'New' or 'Contacted' status 24 hours after creation.",
          enabled: settings.followup_24h_enabled,
          template: settings.followup_24h_sms_template ?? DEFAULT_TEMPLATES.followup_24h,
          templateKey: "followup_24h_sms_template",
          enabledKey: "followup_24h_enabled",
        },
        {
          title: "72h Follow-Up",
          subtitle: "· 3 days",
          description:
            "Final automated touchpoint for leads that haven't progressed to a consultation.",
          enabled: settings.followup_72h_enabled,
          template: settings.followup_72h_sms_template ?? DEFAULT_TEMPLATES.followup_72h,
          templateKey: "followup_72h_sms_template",
          enabledKey: "followup_72h_enabled",
        },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 max-w-[1200px]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Follow-Up Automation
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans-body mt-0.5">
            Automatic SMS sequences triggered by call events and lead status.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {saving && (
            <span className="text-zinc-400 text-xs font-sans-body animate-pulse">Saving…</span>
          )}
          {savedMsg && (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-sans-body">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Twilio warning banner */}
      {!settingsLoading && !hasTwilio && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-amber-700 dark:text-amber-400 text-sm font-sans-body">
            Twilio is not configured — sequences are disabled.{" "}
            <a href="/dashboard/settings" className="font-semibold underline hover:no-underline">
              Add credentials in Settings →
            </a>
          </p>
        </div>
      )}

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Sent this month"
            value={stats.sent_this_month}
            icon={Zap}
            color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Missed call SMS"
            value={stats.sent_missed_call}
            icon={Phone}
            color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="24h / 72h sends"
            value={stats.sent_24h + stats.sent_72h}
            icon={Clock}
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Opted-out leads"
            value={stats.opted_out_leads}
            icon={Users}
            color="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          />
        </div>
      )}

      {/* Sequence cards */}
      {settingsLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !hasTwilio ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <TwilioEmptyState />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {sequences.map(seq => (
            <SequenceCard
              key={seq.enabledKey}
              {...seq}
              hasTwilio={hasTwilio}
              onToggle={handleToggle}
              onSaveTemplate={handleSaveTemplate}
            />
          ))}
        </div>
      )}

      {/* Activity log */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-[#166534] rounded-2xl overflow-hidden">
        {/* Log header + filters */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-wrap">
          <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-base">Activity Log</h3>
          <div className="flex items-center gap-2">
            <select
              value={channelFilter}
              onChange={e => { setChannelFilter(e.target.value); setLogPage(1); }}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs outline-none font-sans-body cursor-pointer"
            >
              <option value="">All channels</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
            <select
              value={stepFilter}
              onChange={e => { setStepFilter(e.target.value); setLogPage(1); }}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 text-xs outline-none font-sans-body cursor-pointer"
            >
              <option value="">All sequences</option>
              <option value="0">Missed call</option>
              <option value="1">24h follow-up</option>
              <option value="2">72h follow-up</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {logsLoading ? (
          <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-32 h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-20 h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="w-24 h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 dark:text-zinc-600 text-sm font-sans-body">
            No follow-up messages sent yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  {["Lead", "Sequence", "Channel", "Phone", "Sent"].map((h, i) => (
                    <th
                      key={h}
                      className={`text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-${i === 0 ? 5 : 4} py-3 font-sans-body uppercase tracking-wider ${i === 3 ? "hidden md:table-cell" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <a
                        href={`/dashboard/leads/${log.lead_id}`}
                        className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold font-sans-body hover:text-[#15803d] dark:hover:text-emerald-400 transition-colors"
                      >
                        {log.lead_name ?? "Unknown"}
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <StepLabel step={log.sequence_step} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <ChannelIcon channel={log.channel} />
                        <span className="text-zinc-600 dark:text-zinc-400 text-xs font-sans-body capitalize">{log.channel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        {log.lead_phone ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body"
                        title={formatDate(log.sent_at)}
                      >
                        {timeAgo(log.sent_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-zinc-400 text-xs font-sans-body">{totalLogs} total</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-zinc-500 text-xs font-sans-body px-2">{logPage} / {totalPages}</span>
              <button
                onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                disabled={logPage === totalPages}
                className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
