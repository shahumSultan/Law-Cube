"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Phone, Mail, Calendar, Tag, User, Clock,
  Link2, RefreshCw, Loader2, CheckCircle2, AlertCircle,
  ExternalLink, ChevronRight,
} from "lucide-react";
import { leadsApi, settingsApi, clioApi } from "@/lib/api";
import type { ClioSyncLog } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  new:                     "New",
  contacted:               "Contacted",
  consultation_scheduled:  "Consult Scheduled",
  consultation_completed:  "Consult Completed",
  retained:                "Retained",
  lost:                    "Lost",
  spam:                    "Spam",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  new:                     { bg: "bg-blue-50 dark:bg-blue-950/30",    text: "text-blue-700 dark:text-blue-300",    dot: "bg-blue-400" },
  contacted:               { bg: "bg-amber-50 dark:bg-amber-950/30",  text: "text-amber-700 dark:text-amber-300",  dot: "bg-amber-400" },
  consultation_scheduled:  { bg: "bg-violet-50 dark:bg-violet-950/30",text: "text-violet-700 dark:text-violet-300",dot: "bg-violet-400" },
  consultation_completed:  { bg: "bg-sky-50 dark:bg-sky-950/30",      text: "text-sky-700 dark:text-sky-300",      dot: "bg-sky-400" },
  retained:                { bg: "bg-emerald-50 dark:bg-emerald-950/30",text: "text-emerald-700 dark:text-emerald-300",dot: "bg-emerald-400" },
  lost:                    { bg: "bg-slate-100 dark:bg-zinc-800",      text: "text-slate-500 dark:text-slate-400",  dot: "bg-slate-400" },
  spam:                    { bg: "bg-red-50 dark:bg-red-950/30",       text: "text-red-600 dark:text-red-400",      dot: "bg-red-400" },
};

const OP_LABELS: Record<string, string> = {
  contact_create: "Contact created",
  contact_update: "Contact updated",
  matter_create:  "Matter created",
  note_create:    "Note created",
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full font-sans-body ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => leadsApi.get(id),
    enabled: !!id,
  });

  const { data: settings } = useQuery({
    queryKey: ["integrations"],
    queryFn: settingsApi.getIntegrations,
  });

  const { data: clioLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["clio-sync-logs", id],
    queryFn: () => clioApi.getSyncLogs({ lead_id: id, page_size: 10 }),
    enabled: !!id && (settings?.has_clio ?? false),
  });

  const syncMutation = useMutation({
    mutationFn: () => clioApi.syncLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clio-sync-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-100 dark:bg-zinc-800 rounded-xl" />
        <div className="h-48 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-72 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-sans-body mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-slate-500 font-sans-body">Lead not found.</p>
      </div>
    );
  }

  const clioConnected = settings?.has_clio ?? false;
  const clioBaseUrl = "https://app.clio.com";

  return (
    <div className="max-w-4xl flex flex-col gap-6">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-[#166534] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
            {lead.first_name} {lead.last_name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">Lead details</p>
        </div>
      </div>

      {/* Lead info card */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#15803d] flex items-center justify-center border border-green-700/20 shrink-0">
              <span className="text-white text-lg font-bold font-sans-body">
                {lead.first_name[0]}{lead.last_name[0]}
              </span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl leading-tight">
                {lead.first_name} {lead.last_name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body capitalize mt-0.5">
                Source: {lead.source}
              </p>
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {lead.phone && (
            <div className="flex items-center gap-2.5 text-sm font-sans-body">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-mono">{lead.phone}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2.5 text-sm font-sans-body">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{lead.email}</span>
            </div>
          )}
          {lead.campaign && (
            <div className="flex items-center gap-2.5 text-sm font-sans-body">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">{lead.campaign}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-sm font-sans-body">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {lead.ai_summary && (
          <div className="mt-5 p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 font-sans-body">AI Summary</p>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-sans-body leading-relaxed">{lead.ai_summary}</p>
          </div>
        )}

        {lead.score !== null && lead.score !== undefined && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans-body uppercase tracking-wider">AI Score</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#15803d] transition-all" style={{ width: `${lead.score}%` }} />
              </div>
              <span className="text-sm font-bold text-[#15803d] font-sans-body">{lead.score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Clio sync panel */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] dark:bg-emerald-950/50 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#15803d]" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base leading-tight">Clio Sync</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Practice management integration</p>
            </div>
          </div>

          {clioConnected && (
            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="flex items-center gap-2 text-sm font-semibold text-[#15803d] hover:text-[#166534] border border-[#15803d]/30 hover:border-[#15803d] rounded-xl px-4 py-2 transition-all font-sans-body disabled:opacity-50">
              {syncMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              Push to Clio
            </button>
          )}
        </div>

        <div className="p-6">
          {!clioConnected ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-sans-body">Clio not connected</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans-body mt-0.5">Connect Clio in Settings → Integrations to enable sync.</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/settings?tab=integrations")}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#15803d] hover:underline font-sans-body">
                Go to Settings <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Sync result notification */}
              {syncMutation.isSuccess && (
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 font-sans-body">Sync queued — Clio will be updated shortly.</p>
                </div>
              )}
              {syncMutation.isError && (
                <div className="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300 font-sans-body">{(syncMutation.error as Error).message}</p>
                </div>
              )}

              {/* Clio IDs */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans-body mb-1.5">Contact ID</p>
                  {lead.clio_contact_id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{lead.clio_contact_id}</span>
                      <a
                        href={`${clioBaseUrl}/contacts/${lead.clio_contact_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#15803d] hover:text-[#166534] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-sans-body">Not synced yet</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-700 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans-body mb-1.5">Matter ID</p>
                  {lead.clio_matter_id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-slate-800 dark:text-slate-200">{lead.clio_matter_id}</span>
                      <a
                        href={`${clioBaseUrl}/matters/${lead.clio_matter_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[#15803d] hover:text-[#166534] transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-sans-body">
                        {lead.status === "retained" ? "Sync pending" : "Created on retention"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sync log */}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans-body mb-3">Sync History</p>
                {logsLoading ? (
                  <div className="space-y-2">
                    {[0, 1, 2].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)}
                  </div>
                ) : clioLogs && clioLogs.items.length > 0 ? (
                  <div className="border border-slate-100 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
                    {clioLogs.items.map((log: ClioSyncLog) => (
                      <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans-body">
                            {OP_LABELS[log.operation] ?? log.operation}
                          </p>
                          {log.error_message && (
                            <p className="text-[11px] text-red-500 font-sans-body mt-0.5 truncate">{log.error_message}</p>
                          )}
                        </div>
                        {log.clio_entity_id && (
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-600 shrink-0">#{log.clio_entity_id}</span>
                        )}
                        <span className="text-[11px] text-slate-400 dark:text-slate-600 font-sans-body shrink-0">
                          {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center border border-slate-100 dark:border-zinc-800 rounded-xl">
                    <User className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                    <p className="text-xs text-slate-400 dark:text-slate-600 font-sans-body">No sync history yet. Click "Push to Clio" to sync.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
