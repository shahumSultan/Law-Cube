"use client";

import { kpiData, leadsOverTime, leadsBySource, funnelData, aiInsights, mockLeads } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Users, PhoneCall, Calendar, UserCheck, ArrowRight, Lightbulb, AlertTriangle, Star } from "lucide-react";

/* ─── KPI Card ─── */
function KpiCard({ label, value, trend }: { label: string; value: number; trend: number }) {
  const icons: Record<string, React.ReactNode> = {
    "Total Leads":        <Users className="w-4 h-4" />,
    "Qualified Leads":   <PhoneCall className="w-4 h-4" />,
    "Consultations":     <Calendar className="w-4 h-4" />,
    "Retained Clients":  <UserCheck className="w-4 h-4" />,
  };
  const colors: Record<string, string> = {
    "Total Leads":        "#3b82f6",
    "Qualified Leads":   "#60a5fa",
    "Consultations":     "#f59e0b",
    "Retained Clients":  "#10b981",
  };
  const color = colors[label] ?? "#3b82f6";
  const positive = trend >= 0;

  return (
    <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6 hover:border-[#2a3f5f] transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
          {icons[label]}
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${positive ? "bg-[#10b981]/10 text-[#10b981]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="font-display font-bold text-3xl text-[#eef2ff] mb-1">{value.toLocaleString()}</div>
      <div className="text-[#8899b4] text-sm">{label}</div>
      <div className="text-[#4a5c78] text-xs mt-1">vs. last month</div>
    </div>
  );
}

/* ─── Funnel ─── */
function FunnelChart() {
  return (
    <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6">
      <h3 className="font-display font-semibold text-[#eef2ff] text-base mb-6">Conversion Funnel</h3>
      <div className="flex flex-col gap-3">
        {funnelData.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[#8899b4] text-xs">{item.stage}</span>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-[#eef2ff] text-sm">{item.value.toLocaleString()}</span>
                <span className="text-[#4a5c78] text-xs w-8 text-right">{item.pct}%</span>
              </div>
            </div>
            <div className="h-2 bg-[#141d2e] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${item.pct}%`, background: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AI Insight card ─── */
function InsightCard({ insight }: { insight: typeof aiInsights[0] }) {
  const configs = {
    green: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: <TrendingUp className="w-4 h-4 text-[#10b981]" /> },
    gold:  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: <Star className="w-4 h-4 text-[#f59e0b]" /> },
    red:   { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  icon: <AlertTriangle className="w-4 h-4 text-[#ef4444]" /> },
  };
  const c = configs[insight.color as keyof typeof configs];

  return (
    <div className="p-4 rounded-xl border transition-colors hover:border-[#2a3f5f]"
      style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{c.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-[#eef2ff] text-sm mb-1">{insight.title}</h4>
          <p className="text-[#8899b4] text-xs leading-relaxed">{insight.body}</p>
          <button className="flex items-center gap-1 text-[#60a5fa] text-xs font-medium mt-2 hover:underline">
            {insight.action} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Status pill ─── */
function StatusPill({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`pill pill-${slug}`}>{status}</span>;
}

/* ─── Score badge ─── */
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <span className="inline-flex items-center gap-1 font-display font-bold text-xs px-2 py-0.5 rounded-lg"
      style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
      {score}
    </span>
  );
}

/* ─── Custom chart tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141d2e] border border-[#2a3f5f] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[#8899b4] text-xs mb-1">{label}</p>
      <p className="font-display font-bold text-[#eef2ff] text-sm">{payload[0].value} leads</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(kpiData).map(([, v]) => (
          <KpiCard key={v.label} label={v.label} value={v.value} trend={v.trend} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Left column: charts */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Leads over time */}
          <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-[#eef2ff] text-base">Leads Over Time</h3>
              <span className="text-[#4a5c78] text-xs">Last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leadsOverTime} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#4a5c78", fontSize: 11 }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fill: "#4a5c78", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" dot={false} activeDot={{ r: 4, fill: "#3b82f6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: source bar + funnel */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6">
              <h3 className="font-display font-semibold text-[#eef2ff] text-base mb-6">Leads by Source</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={leadsBySource} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="source" tick={{ fill: "#4a5c78", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#4a5c78", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-[#141d2e] border border-[#2a3f5f] rounded-xl px-3 py-2">
                        <p className="text-[#8899b4] text-xs mb-1">{label}</p>
                        <p className="font-display font-bold text-[#eef2ff] text-sm">{payload[0].value} leads</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                    {leadsBySource.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <FunnelChart />
          </div>

          {/* Recent leads table */}
          <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d45]">
              <h3 className="font-display font-semibold text-[#eef2ff] text-base">Recent Leads</h3>
              <a href="/dashboard/leads" className="text-[#60a5fa] text-xs hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d45]">
                    {["Name", "Source", "Score", "Status", "Assigned", "Date"].map(h => (
                      <th key={h} className="text-left text-[#4a5c78] text-xs font-medium px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockLeads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="border-b border-[#1e2d45]/60 table-row-hover cursor-pointer">
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-[#eef2ff] text-sm">{lead.firstName} {lead.lastName}</div>
                        <div className="text-[#4a5c78] text-xs">{lead.email}</div>
                      </td>
                      <td className="px-6 py-3.5 text-[#8899b4] text-sm">{lead.source}</td>
                      <td className="px-6 py-3.5"><ScoreBadge score={lead.score} /></td>
                      <td className="px-6 py-3.5"><StatusPill status={lead.status} /></td>
                      <td className="px-6 py-3.5 text-[#8899b4] text-sm">{lead.assigned}</td>
                      <td className="px-6 py-3.5 text-[#4a5c78] text-xs">{lead.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: AI insights */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/25 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-[#a78bfa]" />
              </div>
              <h3 className="font-display font-semibold text-[#eef2ff] text-base">AI Insights</h3>
            </div>
            <p className="text-[#4a5c78] text-xs mb-5">Updated · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} at 3:00 AM</p>
            <div className="flex flex-col gap-3">
              {aiInsights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-6">
            <h3 className="font-display font-semibold text-[#eef2ff] text-base mb-4">Today&apos;s Activity</h3>
            <div className="flex flex-col gap-4">
              {[
                { label: "Calls received", value: 23, color: "#3b82f6" },
                { label: "Calls missed",   value: 4,  color: "#ef4444" },
                { label: "New leads",      value: 18, color: "#10b981" },
                { label: "Follow-ups sent",value: 11, color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[#8899b4] text-sm">{s.label}</span>
                  <span className="font-display font-bold text-base" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
