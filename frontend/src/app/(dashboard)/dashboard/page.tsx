"use client";

import { motion } from "framer-motion";
import { FloatingPaths } from "@/components/ui/background-paths";
import { kpiData, leadsOverTime, leadsBySource, funnelData, aiInsights, mockLeads } from "@/lib/mock-data";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, PhoneCall, Calendar,
  UserCheck, ArrowRight, Lightbulb, AlertTriangle, Star,
  MoreHorizontal
} from "lucide-react";

/* ─── Custom tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-sans-body">{label}</p>
      <p className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">{payload[0].value} leads</p>
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, trend }: { label: string; value: number; trend: number }) {
  const configs: Record<string, { icon: React.ReactNode; accentColor: string; borderTop: string; iconBg: string }> = {
    "Total Leads":       { icon: <Users className="w-4 h-4" />,     accentColor: "#1E3A8A", borderTop: "#1E3A8A", iconBg: "#EFF6FF" },
    "Qualified Leads":   { icon: <PhoneCall className="w-4 h-4" />, accentColor: "#1D4ED8", borderTop: "#1D4ED8", iconBg: "#EFF6FF" },
    "Consultations":     { icon: <Calendar className="w-4 h-4" />,  accentColor: "#D97706", borderTop: "#D97706", iconBg: "#FFFBEB" },
    "Retained Clients":  { icon: <UserCheck className="w-4 h-4" />, accentColor: "#059669", borderTop: "#059669", iconBg: "#ECFDF5" },
  };
  const cfg = configs[label] ?? configs["Total Leads"];
  const positive = trend >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: cfg.borderTop }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconBg, color: cfg.accentColor }}>
          {cfg.icon}
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-sans-body ${
          positive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      </div>

      <div className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100 mb-1">{value.toLocaleString()}</div>
      <div className="text-slate-600 dark:text-slate-400 text-sm font-sans-body">{label}</div>
      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body">vs. last month</div>
    </div>
  );
}

/* ─── Conversion Funnel ─── */
function FunnelChart() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Conversion Funnel</h3>
        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col gap-3.5">
        {funnelData.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-600 dark:text-slate-400 text-xs font-sans-body font-medium">{item.stage}</span>
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.value.toLocaleString()}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs w-8 text-right font-sans-body">{item.pct}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
    green: { bg: "#F0FDF4", border: "#BBF7D0", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />, iconBg: "#DCFCE7" },
    gold:  { bg: "#FFFBEB", border: "#FDE68A", icon: <Star className="w-3.5 h-3.5 text-amber-600" />,          iconBg: "#FEF3C7" },
    red:   { bg: "#FEF2F2", border: "#FECACA", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,   iconBg: "#FEE2E2" },
  };
  const c = configs[insight.color as keyof typeof configs];

  return (
    <div className="p-4 rounded-xl border transition-all hover:shadow-sm"
      style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: c.iconBg }}>
          {c.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">{insight.title}</h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-sans-body">{insight.body}</p>
          <button className="flex items-center gap-1 text-[#1E3A8A] text-xs font-semibold mt-2 hover:text-[#1D4ED8] transition-colors font-sans-body">
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
  const { color, bg, border } = score >= 75
    ? { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" }
    : score >= 50
    ? { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" }
    : { color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" };

  return (
    <span className="inline-flex items-center gap-1 font-sans-body font-bold text-xs px-2 py-0.5 rounded-md"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {score}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5 max-w-[1400px]"
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-sans-body">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Last updated: 3:00 AM</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </motion.div>

      {/* KPIs — staggered entrance */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Object.entries(kpiData).map(([, v], i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <KpiCard label={v.label} value={v.value} trend={v.trend} />
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-5">
        {/* Left: charts + table */}
        <div className="xl:col-span-2 flex flex-col gap-5">

          {/* Leads over time */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Leads Over Time</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body mt-0.5">Last 30 days</p>
              </div>
              <div className="flex gap-2">
                {["7d", "30d", "90d"].map((p, i) => (
                  <button key={p} className={`text-xs px-2.5 py-1 rounded-md font-sans-body font-medium transition-colors ${i === 1 ? "bg-[#EFF6FF] text-[#1E3A8A] border border-[#BFDBFE]" : "text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={leadsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="leads" stroke="#1E3A8A" strokeWidth={2} fill="url(#navyGrad)" dot={false}
                  activeDot={{ r: 4, fill: "#1E3A8A", stroke: "#FFFFFF", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Source bar + funnel */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Leads by Source</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={leadsBySource} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="source" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg">
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-sans-body">{label}</p>
                        <p className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">{payload[0].value} leads</p>
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

          {/* Recent leads */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 dark:border-slate-700/50">
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Recent Leads</h3>
              <a href="/dashboard/leads" className="text-[#1E3A8A] text-xs hover:text-[#1D4ED8] font-semibold font-sans-body flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 dark:border-slate-700/50">
                    {["Name", "Source", "Score", "Status", "Assigned", "Date"].map(h => (
                      <th key={h} className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-5 py-3 font-sans-body uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockLeads.slice(0, 5).map(lead => (
                    <tr key={lead.id} className="border-b border-slate-50 table-row-hover">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">{lead.firstName} {lead.lastName}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">{lead.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-sm font-sans-body">{lead.source}</td>
                      <td className="px-5 py-3.5"><ScoreBadge score={lead.score} /></td>
                      <td className="px-5 py-3.5"><StatusPill status={lead.status} /></td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-sm font-sans-body">{lead.assigned}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs font-sans-body">{lead.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: AI insights + today's activity */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >

          {/* AI Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center">
                  <Lightbulb className="w-3.5 h-3.5 text-[#5B21B6]" />
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">AI Insights</h3>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Today</span>
            </div>
            <div className="flex flex-col gap-3">
              {aiInsights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
            </div>
          </div>

          {/* Today's activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg mb-4">Today&apos;s Activity</h3>
            <div className="flex flex-col gap-0 divide-y divide-slate-50">
              {[
                { label: "Calls received",  value: 23, color: "#1E3A8A", bg: "#EFF6FF" },
                { label: "Calls missed",    value: 4,  color: "#DC2626", bg: "#FEF2F2" },
                { label: "New leads",       value: 18, color: "#059669", bg: "#ECFDF5" },
                { label: "Follow-ups sent", value: 11, color: "#D97706", bg: "#FFFBEB" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <span className="text-slate-600 dark:text-slate-400 text-sm font-sans-body">{s.label}</span>
                  <span className="inline-flex items-center justify-center font-display font-bold text-base w-9 h-7 rounded-lg"
                    style={{ color: s.color, background: s.bg }}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick attribution */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0A1628] rounded-2xl p-5 relative overflow-hidden"
          >
            {/* Subtle paths in the dark attribution card */}
            <div className="absolute inset-0 opacity-10 dark pointer-events-none">
              <FloatingPaths position={0.5} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#D97706]" />
              <h3 className="font-display font-semibold text-white text-base">Top Performing Channel</h3>
            </div>
            <div className="mb-3">
              <div className="text-[#D97706] text-xs font-semibold font-sans-body uppercase tracking-wider mb-1">Google Ads</div>
              <div className="font-display font-bold text-3xl text-white mb-1">$247</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs font-sans-body">cost per retained client</div>
            </div>
            <div className="h-px bg-[#162640] my-3" />
            <div className="flex justify-between text-xs font-sans-body">
              <div>
                <div className="text-slate-600 dark:text-slate-400">Calls</div>
                <div className="text-white font-semibold mt-0.5">847</div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400">Qualified</div>
                <div className="text-white font-semibold mt-0.5">312</div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400">Retained</div>
                <div className="text-[#D97706] font-semibold mt-0.5">89</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
