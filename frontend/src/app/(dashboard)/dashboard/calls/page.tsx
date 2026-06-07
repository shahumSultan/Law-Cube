"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mockCalls } from "@/lib/mock-data";
import { Play, X, ExternalLink, PhoneCall, Clock, TrendingUp, Brain, Mic } from "lucide-react";

type Call = typeof mockCalls[0];

function ClassificationPill({ cls }: { cls: string }) {
  const map: Record<string, string> = {
    qualified:      "pill-qualified",
    unqualified:    "pill-unqualified",
    spam:           "pill-spam",
    vendor:         "pill-vendor",
    "wrong-number": "pill-wrong-number",
    existing:       "pill-existing",
  };
  return <span className={`pill ${map[cls] ?? "pill-spam"}`}>{cls.replace("-", " ")}</span>;
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  return <span className={`pill pill-${sentiment}`}>{sentiment}</span>;
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const color = score >= 75 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
          className="text-slate-200 dark:text-slate-700" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="font-sans-body font-bold text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

function CallDetailModal({ call, onClose }: { call: Call; onClose: () => void }) {
  const scoreBreakdown = [
    { label: "Injury Severity",       value: Math.round(call.score * 0.35), max: 35 },
    { label: "Case Potential",        value: Math.round(call.score * 0.25), max: 25 },
    { label: "Representation Status", value: Math.round(call.score * 0.20), max: 20 },
    { label: "Jurisdiction Match",    value: Math.round(call.score * 0.12), max: 12 },
    { label: "Accident Type",         value: Math.round(call.score * 0.08), max: 8 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full width bottom sheet on mobile, side panel on sm+ */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-xl sm:h-full bg-white dark:bg-zinc-950 sm:border-l border-t sm:border-t-0 border-slate-200 dark:border-[#166534] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-none"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#166534] shrink-0">
          <div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-base">{call.caller}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body">{call.phone} · {call.date}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Score + meta — responsive 3-col */}
          <div className="px-5 py-5 border-b border-slate-100 dark:border-[#166534] grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={call.score} />
              <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Lead Score</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <ClassificationPill cls={call.classification} />
              <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body text-center">Classification</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <SentimentPill sentiment={call.sentiment} />
              <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body text-center">
                Sentiment ({Math.round(call.sentimentScore * 100)}%)
              </span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="px-5 py-5 border-b border-slate-100 dark:border-[#166534]">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-violet-500" />
              <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Summary</h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed bg-slate-50 dark:bg-zinc-900 rounded-xl p-4 border border-slate-200 dark:border-[#166534] font-sans-body">
              {call.summary}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="px-5 py-5 border-b border-slate-100 dark:border-[#166534]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#15803d]" />
              <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Score Breakdown</h4>
            </div>
            <div className="flex flex-col gap-3">
              {scoreBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400 text-xs font-sans-body">{item.label}</span>
                    <span className="text-slate-900 dark:text-slate-100 text-xs font-semibold font-sans-body">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#15803d]" style={{ width: `${(item.value / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript */}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-[#15803d]" />
              <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">Transcript</h4>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl p-4 text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-mono whitespace-pre-line max-h-48 overflow-y-auto">
              {call.transcript}
            </div>
          </div>
        </div>

        {/* Footer */}
        {call.leadId && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-[#166534] shrink-0">
            <a href="/dashboard/leads"
              className="flex items-center justify-center gap-2 w-full bg-[#f0fdf4] dark:bg-[#15803d]/20 hover:bg-[#dcfce7] dark:hover:bg-[#15803d]/30 border border-[#bbf7d0] dark:border-[#15803d]/40 text-[#15803d] dark:text-green-400 text-sm font-semibold py-2.5 rounded-xl transition-all font-sans-body">
              <ExternalLink className="w-3.5 h-3.5" />
              View Lead Record
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function CallsPage() {
  const [selected, setSelected] = useState<Call | null>(null);

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">Calls</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-sans-body">
            {mockCalls.length} calls today &middot; {mockCalls.filter(c => c.classification === "qualified").length} qualified
          </p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Calls",   value: mockCalls.length,                                               icon: PhoneCall, color: "#15803d", bg: "#f0fdf4" },
          { label: "Qualified",     value: mockCalls.filter(c => c.classification === "qualified").length,  icon: TrendingUp, color: "#059669", bg: "#ECFDF5" },
          { label: "Spam / Other",  value: mockCalls.filter(c => c.classification === "spam").length,       icon: X,          color: "#DC2626", bg: "#FEF2F2" },
          { label: "Avg Duration",  value: "3:14",                                                          icon: Clock,      color: "#D97706", bg: "#FFFBEB" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: s.bg, color: s.color }}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">{s.value}</div>
              <div className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#166534]">
                {/* Caller: always */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 sm:px-5 py-3.5 font-sans-body uppercase tracking-wider">Caller</th>
                {/* Duration: hidden on mobile */}
                <th className="hidden sm:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Duration</th>
                {/* Recording: hidden on mobile */}
                <th className="hidden md:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Recording</th>
                {/* Summary: hidden on mobile */}
                <th className="hidden lg:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">AI Summary</th>
                {/* Score: always */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Score</th>
                {/* Classification: always */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Result</th>
                {/* Sentiment: hidden on mobile/tablet */}
                <th className="hidden lg:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Sentiment</th>
                {/* Date: hidden on mobile */}
                <th className="hidden sm:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {mockCalls.map(call => (
                <tr
                  key={call.id}
                  className="border-b border-slate-50 dark:border-[#166534]/50 table-row-hover cursor-pointer"
                  onClick={() => setSelected(call)}
                >
                  <td className="px-4 sm:px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">{call.caller}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">{call.phone}</div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm font-sans-body">
                      <Clock className="w-3 h-3" />{call.duration}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <button
                      onClick={e => e.stopPropagation()}
                      className="w-7 h-7 rounded-full bg-[#f0fdf4] dark:bg-[#15803d]/20 border border-[#bbf7d0] dark:border-[#15803d]/30 flex items-center justify-center text-[#15803d] dark:text-green-400 hover:bg-[#dcfce7] dark:hover:bg-[#15803d]/30 transition-all">
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4" style={{ maxWidth: 240 }}>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 font-sans-body">{call.summary}</p>
                  </td>
                  <td className="px-4 py-4">
                    <ScoreRing score={call.score} size={40} />
                  </td>
                  <td className="px-4 py-4">
                    <ClassificationPill cls={call.classification} />
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4">
                    <SentimentPill sentiment={call.sentiment} />
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap font-sans-body">
                    {call.date}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(call); }}
                      className="text-[#15803d] dark:text-green-400 text-xs hover:underline whitespace-nowrap font-semibold font-sans-body"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ── */}
      <AnimatePresence>
        {selected && <CallDetailModal call={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
