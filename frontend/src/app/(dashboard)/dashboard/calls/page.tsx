"use client";

import { useState } from "react";
import { mockCalls } from "@/lib/mock-data";
import { Play, X, ExternalLink, PhoneCall, Clock, TrendingUp, Brain, Mic } from "lucide-react";

type Call = typeof mockCalls[0];

function ClassificationPill({ cls }: { cls: string }) {
  const map: Record<string, string> = {
    qualified:    "pill-qualified",
    unqualified:  "pill-unqualified",
    spam:         "pill-spam",
    vendor:       "pill-vendor",
    "wrong-number": "pill-wrong-number",
    existing:     "pill-existing",
  };
  return <span className={`pill ${map[cls] ?? "pill-spam"}`}>{cls.replace("-", " ")}</span>;
}

function SentimentPill({ sentiment }: { sentiment: string }) {
  return <span className={`pill pill-${sentiment}`}>{sentiment}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="absolute -rotate-90" width="48" height="48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#141d2e" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="font-display font-bold text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

function CallDetailModal({ call, onClose }: { call: Call; onClose: () => void }) {
  const scoreBreakdown = [
    { label: "Injury Severity",       value: Math.round(call.score * 0.35), max: 35 },
    { label: "Case Potential",        value: Math.round(call.score * 0.25), max: 25 },
    { label: "Representation Status", value: Math.round(call.score * 0.20), max: 20 },
    { label: "Jurisdiction Match",    value: Math.round(call.score * 0.12), max: 12 },
    { label: "Accident Type",         value: Math.round(call.score * 0.08), max: 8  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl h-full bg-[#0f1624] border-l border-[#1e2d45] flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45] shrink-0">
          <div>
            <h3 className="font-display font-semibold text-[#eef2ff] text-base">{call.caller}</h3>
            <p className="text-[#4a5c78] text-xs mt-0.5">{call.phone} · {call.date}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#141d2e] flex items-center justify-center text-[#4a5c78] hover:text-[#eef2ff] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Score + meta */}
          <div className="px-6 py-5 border-b border-[#1e2d45] grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={call.score} />
              <span className="text-[#4a5c78] text-xs">Lead Score</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <ClassificationPill cls={call.classification} />
              <span className="text-[#4a5c78] text-xs">Classification</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 justify-center">
              <SentimentPill sentiment={call.sentiment} />
              <span className="text-[#4a5c78] text-xs">Sentiment ({Math.round(call.sentimentScore * 100)}%)</span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="px-6 py-5 border-b border-[#1e2d45]">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#a78bfa]" />
              <h4 className="font-display font-semibold text-[#eef2ff] text-sm">AI Summary</h4>
            </div>
            <p className="text-[#8899b4] text-sm leading-relaxed bg-[#141d2e] rounded-xl p-4 border border-[#1e2d45]">
              {call.summary}
            </p>
          </div>

          {/* Score breakdown */}
          <div className="px-6 py-5 border-b border-[#1e2d45]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#60a5fa]" />
              <h4 className="font-display font-semibold text-[#eef2ff] text-sm">Score Breakdown</h4>
            </div>
            <div className="flex flex-col gap-3">
              {scoreBreakdown.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8899b4] text-xs">{item.label}</span>
                    <span className="text-[#eef2ff] text-xs font-medium">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-1.5 bg-[#141d2e] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#3b82f6]" style={{ width: `${(item.value / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-4 h-4 text-[#60a5fa]" />
              <h4 className="font-display font-semibold text-[#eef2ff] text-sm">Transcript</h4>
            </div>
            <div className="bg-[#141d2e] border border-[#1e2d45] rounded-xl p-4 text-[#8899b4] text-xs leading-relaxed font-mono whitespace-pre-line max-h-64 overflow-y-auto">
              {call.transcript}
            </div>
          </div>
        </div>

        {/* Footer */}
        {call.leadId && (
          <div className="px-6 py-4 border-t border-[#1e2d45] shrink-0">
            <a href={`/dashboard/leads`}
              className="flex items-center justify-center gap-2 w-full bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/25 text-[#60a5fa] text-sm font-medium py-2.5 rounded-xl transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
              View Lead Record
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallsPage() {
  const [selected, setSelected] = useState<Call | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#eef2ff] tracking-tight">Calls</h2>
          <p className="text-[#4a5c78] text-sm mt-0.5">{mockCalls.length} calls today · {mockCalls.filter(c => c.classification === "qualified").length} qualified</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Calls",    value: mockCalls.length,                                            icon: PhoneCall, color: "#3b82f6" },
          { label: "Qualified",      value: mockCalls.filter(c => c.classification === "qualified").length, icon: TrendingUp, color: "#10b981" },
          { label: "Spam / Other",   value: mockCalls.filter(c => c.classification === "spam").length,   icon: X,         color: "#ef4444" },
          { label: "Avg Duration",   value: "3:14",                                                      icon: Clock,     color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}25`, color: s.color }}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-display font-bold text-xl text-[#eef2ff]">{s.value}</div>
              <div className="text-[#8899b4] text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d45]">
                {["Caller", "Duration", "Recording", "AI Summary", "Score", "Classification", "Sentiment", "Date", ""].map((h, i) => (
                  <th key={i} className="text-left text-[#4a5c78] text-xs font-medium px-5 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCalls.map(call => (
                <tr key={call.id} className="border-b border-[#1e2d45]/60 table-row-hover cursor-pointer" onClick={() => setSelected(call)}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-[#eef2ff] text-sm">{call.caller}</div>
                    <div className="text-[#4a5c78] text-xs">{call.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[#8899b4] text-sm">
                      <Clock className="w-3 h-3" />{call.duration}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={e => { e.stopPropagation(); }}
                      className="w-7 h-7 rounded-full bg-[#3b82f6]/15 border border-[#3b82f6]/25 flex items-center justify-center text-[#60a5fa] hover:bg-[#3b82f6]/25 transition-all">
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </td>
                  <td className="px-5 py-4 max-w-[240px]">
                    <p className="text-[#8899b4] text-xs leading-relaxed line-clamp-2">{call.summary}</p>
                  </td>
                  <td className="px-5 py-4">
                    <ScoreRing score={call.score} />
                  </td>
                  <td className="px-5 py-4">
                    <ClassificationPill cls={call.classification} />
                  </td>
                  <td className="px-5 py-4">
                    <SentimentPill sentiment={call.sentiment} />
                  </td>
                  <td className="px-5 py-4 text-[#4a5c78] text-xs whitespace-nowrap">{call.date}</td>
                  <td className="px-5 py-4">
                    <button onClick={e => { e.stopPropagation(); setSelected(call); }}
                      className="text-[#60a5fa] text-xs hover:underline whitespace-nowrap">
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail slide-over */}
      {selected && <CallDetailModal call={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
