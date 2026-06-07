"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { callsApi, type CallRecord } from "@/lib/api";
import {
  Play, X, ExternalLink, PhoneCall, Clock, TrendingUp, Brain, Mic,
  Loader2, AlertCircle, Filter,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ── UI Atoms ───────────────────────────────────────────────────────────────────

function ClassificationPill({ cls }: { cls: string | null }) {
  if (!cls) return <span className="text-zinc-400 text-xs font-sans-body">—</span>;
  const map: Record<string, string> = {
    qualified:      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    unqualified:    "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    spam:           "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    vendor:         "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    wrong_number:   "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700",
    existing_client:"bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };
  const label = cls.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border font-sans-body ${map[cls] ?? map.unqualified}`}>
      {label}
    </span>
  );
}

function SentimentPill({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-zinc-400 text-xs font-sans-body">—</span>;
  const map: Record<string, string> = {
    positive: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    neutral:  "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    negative: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border font-sans-body ${map[sentiment] ?? map.neutral}`}>
      {sentiment}
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number | null; size?: number }) {
  if (score === null) return <span className="text-zinc-400 text-xs font-sans-body">—</span>;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#D97706" : "#DC2626";
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-700" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="font-sans-body font-bold text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

function ProcessingBadge({ status }: { status: CallRecord["processing_status"] }) {
  if (status === "complete") return null;
  const map = {
    pending:     { label: "Pending",      cls: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" },
    transcribing:{ label: "Transcribing", cls: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    analyzing:   { label: "Analyzing…",   cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
    failed:      { label: "Failed",       cls: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-sans-body ${cls}`}>
      {status !== "failed" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "failed" && <AlertCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ── Call Detail Modal ──────────────────────────────────────────────────────────

function CallDetailModal({ call, onClose }: { call: CallRecord; onClose: () => void }) {
  const isProcessing = call.processing_status !== "complete" && call.processing_status !== "failed";

  const scoreBreakdown = call.score_breakdown
    ? [
        { label: "Injury Severity",       key: "injury_severity",    max: 35 },
        { label: "Case Potential",        key: "case_potential",     max: 25 },
        { label: "Representation Status", key: "representation_status", max: 20 },
        { label: "Jurisdiction Match",    key: "jurisdiction_match", max: 12 },
        { label: "Accident Type",         key: "accident_type",      max: 8  },
      ].map(d => ({ ...d, value: call.score_breakdown?.[d.key] ?? 0 }))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-xl sm:h-full bg-white dark:bg-zinc-950 sm:border-l border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              {call.caller_number ?? "Unknown Caller"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5 font-sans-body">
              {formatDate(call.called_at)}
              {call.campaign ? ` · ${call.campaign}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Processing state */}
          {isProcessing && (
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-700 dark:text-amber-400 text-sm font-semibold font-sans-body">
                  AI analysis in progress
                </p>
                <p className="text-amber-600/80 dark:text-amber-500 text-xs font-sans-body">
                  Status: {call.processing_status} — results appear automatically when complete
                </p>
              </div>
            </div>
          )}

          {call.processing_status === "failed" && (
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-3 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 dark:text-red-400 text-sm font-semibold font-sans-body">Processing failed</p>
                {call.processing_error && (
                  <p className="text-red-600/80 dark:text-red-500 text-xs font-sans-body mt-0.5">{call.processing_error}</p>
                )}
              </div>
            </div>
          )}

          {/* Score + meta */}
          <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={call.lead_score} />
              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body">Lead Score</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <ClassificationPill cls={call.classification} />
              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body text-center">Classification</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <SentimentPill sentiment={call.sentiment} />
              <span className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body text-center">
                {call.sentiment_score !== null
                  ? `Sentiment (${Math.round((call.sentiment_score ?? 0) * 100)}%)`
                  : "Sentiment"}
              </span>
            </div>
          </div>

          {/* AI Summary */}
          {call.ai_summary && (
            <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-violet-500" />
                <h4 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-sm">AI Summary</h4>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 font-sans-body">
                {call.ai_summary}
              </p>
              {call.key_facts.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {call.key_facts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-sans-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5 shrink-0" />
                      {fact}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Score breakdown */}
          {scoreBreakdown && (
            <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                <h4 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Score Breakdown</h4>
              </div>
              <div className="flex flex-col gap-3">
                {scoreBreakdown.map((item) => (
                  <div key={item.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400 text-xs font-sans-body">{item.label}</span>
                      <span className="text-zinc-900 dark:text-zinc-100 text-xs font-semibold font-sans-body">
                        {item.value}/{item.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#22c55e] transition-all duration-500"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          {call.next_steps.length > 0 && (
            <div className="px-5 py-5 border-b border-zinc-100 dark:border-zinc-800">
              <h4 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-sm mb-3">Next Steps</h4>
              <ul className="flex flex-col gap-2">
                {call.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400 font-sans-body">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          {call.transcript && (
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-4 h-4 text-zinc-500" />
                <h4 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Transcript</h4>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed font-mono whitespace-pre-line max-h-48 overflow-y-auto">
                {call.transcript}
              </div>
            </div>
          )}

          {!call.ai_summary && !call.transcript && call.processing_status === "complete" && (
            <div className="px-5 py-8 text-center text-zinc-400 dark:text-zinc-600 text-sm font-sans-body">
              No transcript or AI analysis available for this call.
            </div>
          )}
        </div>

        {/* Footer */}
        {call.lead_id && (
          <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
            <a href={`/dashboard/leads`}
              className="flex items-center justify-center gap-2 w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold py-2.5 rounded-xl transition-all font-sans-body">
              <ExternalLink className="w-3.5 h-3.5" />
              View Lead Record
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const CLASSIFICATIONS = ["qualified", "unqualified", "existing_client", "spam", "vendor", "wrong_number"];

export default function CallsPage() {
  const [selected, setSelected] = useState<CallRecord | null>(null);
  const [classFilter, setClassFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["calls", page, classFilter],
    queryFn: () => callsApi.list({ page, page_size: 25, classification: classFilter || undefined }),
  });

  const calls = data?.items ?? [];
  const total = data?.total ?? 0;
  const qualified = calls.filter(c => c.classification === "qualified").length;
  const spam = calls.filter(c => c.classification === "spam").length;
  const avgDuration = calls.length
    ? Math.round(calls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0) / calls.length)
    : 0;

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">Calls</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-sans-body">
            {total} calls &middot; {qualified} qualified
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={classFilter}
            onChange={e => { setClassFilter(e.target.value); setPage(1); }}
            className="text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300 font-sans-body outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
          >
            <option value="">All classifications</option>
            {CLASSIFICATIONS.map(c => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Calls",  value: total,        icon: PhoneCall, color: "#22c55e" },
          { label: "Qualified",    value: qualified,     icon: TrendingUp, color: "#22c55e" },
          { label: "Spam / Other", value: spam,          icon: X,          color: "#DC2626" },
          { label: "Avg Duration", value: formatDuration(avgDuration), icon: Clock, color: "#D97706" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shrink-0"
              style={{ color: s.color }}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-bold text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">{s.value}</div>
              <div className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-zinc-400 font-sans-body text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading calls…
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16 gap-2 text-red-500 font-sans-body text-sm">
            <AlertCircle className="w-4 h-4" /> Failed to load calls
          </div>
        )}

        {!isLoading && !isError && calls.length === 0 && (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600 font-sans-body text-sm">
            No calls yet. Calls appear here after CallRail delivers a webhook.
          </div>
        )}

        {calls.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 sm:px-5 py-3.5 font-sans-body uppercase tracking-wider">Caller</th>
                  <th className="hidden sm:table-cell text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Duration</th>
                  <th className="hidden md:table-cell text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Recording</th>
                  <th className="hidden lg:table-cell text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">AI Summary</th>
                  <th className="text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Score</th>
                  <th className="text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Result</th>
                  <th className="hidden lg:table-cell text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Sentiment</th>
                  <th className="hidden sm:table-cell text-left text-zinc-500 dark:text-zinc-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {calls.map(call => (
                  <tr
                    key={call.id}
                    className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors"
                    onClick={() => setSelected(call)}
                  >
                    <td className="px-4 sm:px-5 py-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm font-sans-body">
                        {call.caller_number ?? "Unknown"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ProcessingBadge status={call.processing_status} />
                        {call.processing_status === "complete" && call.case_type && (
                          <span className="text-zinc-400 dark:text-zinc-600 text-xs font-sans-body">{call.case_type}</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-sm font-sans-body">
                        <Clock className="w-3 h-3" />{formatDuration(call.duration_seconds)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4">
                      {call.recording_url ? (
                        <button
                          onClick={e => e.stopPropagation()}
                          className="w-7 h-7 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:border-[#22c55e] hover:text-[#22c55e] transition-all">
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      ) : (
                        <span className="text-zinc-300 dark:text-zinc-700 text-xs font-sans-body">—</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4" style={{ maxWidth: 240 }}>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2 font-sans-body">
                        {call.ai_summary ?? (call.processing_status !== "complete" ? "Analyzing…" : "—")}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <ScoreRing score={call.lead_score} size={40} />
                    </td>
                    <td className="px-4 py-4">
                      <ClassificationPill cls={call.classification} />
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4">
                      <SentimentPill sentiment={call.sentiment} />
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap font-sans-body">
                      {formatDate(call.called_at)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(call); }}
                        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-semibold font-sans-body transition-colors">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 25 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body">
                  Showing {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-sans-body transition-colors">
                    Previous
                  </button>
                  <button disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-sans-body transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      <AnimatePresence>
        {selected && <CallDetailModal call={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
