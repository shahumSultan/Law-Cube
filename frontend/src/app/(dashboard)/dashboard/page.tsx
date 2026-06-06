"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FloatingPaths } from "@/components/ui/background-paths";
import { dashboardApi } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, PhoneCall, Calendar,
  UserCheck, ArrowRight, Lightbulb, AlertTriangle, Star,
  MoreHorizontal,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

/* ─── Custom tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-sans-body">{label}</p>
      <p className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">{payload[0].value}</p>
    </div>
  );
}

/* ─── KPI Skeleton ─── */
function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="w-14 h-5 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
      <div className="w-20 h-8 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mb-2" />
      <div className="w-24 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, trend }: { label: string; value: number; trend: number }) {
  const configs: Record<string, { icon: React.ReactNode; accentColor: string; borderTop: string; iconBg: string; hero?: boolean }> = {
    "Total Leads":       { icon: <Users className="w-4 h-4" />,     accentColor: "#22c55e", borderTop: "#22c55e", iconBg: "#dcfce7", hero: true },
    "Qualified Leads":   { icon: <PhoneCall className="w-4 h-4" />, accentColor: "#15803d", borderTop: "#15803d", iconBg: "#f0fdf4" },
    "Consultations":     { icon: <Calendar className="w-4 h-4" />,  accentColor: "#D97706", borderTop: "#D97706", iconBg: "#FFFBEB" },
    "Retained Clients":  { icon: <UserCheck className="w-4 h-4" />, accentColor: "#059669", borderTop: "#059669", iconBg: "#ECFDF5" },
  };
  const cfg = configs[label] ?? configs["Total Leads"];
  const positive = trend >= 0;

  if (cfg.hero) {
    return (
      <div className="bg-[#14532d] rounded-2xl p-5 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none dark">
          <FloatingPaths position={0.3} />
        </div>
        <div className="relative flex items-start justify-between mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#22c55e]/20">
            <Users className="w-4 h-4 text-[#22c55e]" />
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-sans-body ${
            positive ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30"
                     : "bg-red-500/20 text-red-300 border border-red-500/30"
          }`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        </div>
        <div className="relative font-display font-bold text-3xl text-white mb-1">{value.toLocaleString()}</div>
        <div className="relative text-green-200/70 text-sm font-sans-body">{label}</div>
        <div className="relative text-green-200/40 text-xs mt-0.5 font-sans-body">vs. last 30 days</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0d2a18] border border-slate-200 dark:border-[#166534] rounded-2xl p-5 hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: cfg.borderTop }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconBg, color: cfg.accentColor }}>
          {cfg.icon}
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-sans-body ${
          positive ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                   : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
        }`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100 mb-1">{value.toLocaleString()}</div>
      <div className="text-slate-600 dark:text-slate-400 text-sm font-sans-body">{label}</div>
      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body">vs. last 30 days</div>
    </div>
  );
}

/* ─── Source colors ─── */
const SOURCE_COLORS: Record<string, string> = {
  callrail: "#15803d",
  web_form: "#22c55e",
  manual:   "#D97706",
  calendly: "#6D28D9",
  facebook: "#DC2626",
  google:   "#059669",
};

/* ─── Static AI insights (real engine in M10) ─── */
const STATIC_INSIGHTS = [
  { title: "Google Ads outperforming", body: "Cost-per-lead from Google Ads is 42% lower than Meta. Consider reallocating budget.", color: "green", action: "View attribution" },
  { title: "3 leads need follow-up", body: "Leads in 'contacted' status for over 3 days without a scheduled consultation.", color: "gold", action: "View leads" },
  { title: "Missed call spike detected", body: "12% increase in missed calls today vs. 7-day average. Check team availability.", color: "red", action: "View calls" },
];

function InsightCard({ insight }: { insight: typeof STATIC_INSIGHTS[0] }) {
  const configs = {
    green: { bg: "#F0FDF4", border: "#BBF7D0", icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />, iconBg: "#DCFCE7" },
    gold:  { bg: "#FFFBEB", border: "#FDE68A", icon: <Star className="w-3.5 h-3.5 text-amber-600" />,          iconBg: "#FEF3C7" },
    red:   { bg: "#FEF2F2", border: "#FECACA", icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,   iconBg: "#FEE2E2" },
  };
  const c = configs[insight.color as keyof typeof configs];
  return (
    <div className="p-4 rounded-xl border transition-all hover:shadow-sm" style={{ background: c.bg, borderColor: c.border }}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: c.iconBg }}>
          {c.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-semibold text-slate-900 text-sm mb-1">{insight.title}</h4>
          <p className="text-slate-600 text-xs leading-relaxed font-sans-body">{insight.body}</p>
          <button className="flex items-center gap-1 text-[#15803d] text-xs font-semibold mt-2 hover:text-[#166534] transition-colors font-sans-body">
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
  return <span className={`pill pill-${slug}`}>{status.replace(/_/g, " ")}</span>;
}

/* ─── Score badge ─── */
function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return <span className="text-slate-400 text-xs">—</span>;
  const { color, bg, border } = score >= 75
    ? { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" }
    : score >= 50
    ? { color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" }
    : { color: "#991B1B", bg: "#FEF2F2", border: "#FECACA" };
  return (
    <span className="inline-flex items-center font-sans-body font-bold text-xs px-2 py-0.5 rounded-md"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      {score}
    </span>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
    refetchInterval: 60_000,
  });

  const kpis = data?.kpis;
  const leadsOverTime = (data?.leads_over_time ?? []).map(p => ({ date: p.date, leads: p.value }));
  const leadsBySource = (data?.leads_by_source ?? []).map(p => ({ source: p.source, leads: p.count, color: SOURCE_COLORS[p.source] ?? "#94A3B8" }));
  const funnel = data?.funnel ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

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
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl">
            {greeting()}{user ? `, ${user.first_name}` : ""}.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body hidden sm:block">Live · refreshes every 60s</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          : kpis
          ? [
              { label: "Total Leads",       value: kpis.total_leads.value,       trend: kpis.total_leads.trend_pct },
              { label: "Qualified Leads",   value: kpis.qualified_leads.value,   trend: kpis.qualified_leads.trend_pct },
              { label: "Consultations",     value: kpis.consultations.value,     trend: kpis.consultations.trend_pct },
              { label: "Retained Clients",  value: kpis.retained_clients.value,  trend: kpis.retained_clients.trend_pct },
            ].map((v, i) => (
              <motion.div key={v.label}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <KpiCard label={v.label} value={v.value} trend={v.trend} />
              </motion.div>
            ))
          : null
        }
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: charts */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Leads over time */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Leads Over Time</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body mt-0.5">Last 30 days</p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-[180px] bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : leadsOverTime.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm font-sans-body">
                No leads yet — create your first lead to see data here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={leadsOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="leads" stroke="#15803d" strokeWidth={2} fill="url(#forestGrad)" dot={false}
                    activeDot={{ r: 4, fill: "#22c55e", stroke: "#FFFFFF", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Source bar + funnel */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg mb-5">Leads by Source</h3>
              {isLoading ? (
                <div className="h-[150px] bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : leadsBySource.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center text-slate-400 text-sm font-sans-body">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={leadsBySource} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="source" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "Inter" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                      {leadsBySource.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Funnel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Conversion Funnel</h3>
                <button className="text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {funnel.map((item, i) => {
                    const colors = ["#15803d", "#22c55e", "#D97706", "#6D28D9"];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-slate-600 dark:text-slate-400 text-xs font-sans-body font-medium">{item.stage}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-sm">{item.value.toLocaleString()}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-xs w-8 text-right font-sans-body">{item.pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.pct}%`, background: colors[i % colors.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent leads — link to full page */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Recent Leads</h3>
              <a href="/dashboard/leads" className="text-[#15803d] dark:text-green-400 text-xs hover:underline font-semibold font-sans-body flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <p className="px-5 py-8 text-slate-400 dark:text-slate-500 text-sm font-sans-body text-center">
              Create leads to see them here, or{" "}
              <a href="/dashboard/leads" className="text-[#15803d] dark:text-green-400 hover:underline">view the full leads page</a>.
            </p>
          </div>
        </div>

        {/* Right: AI insights + activity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
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
              <span className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Preview</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body mb-4">Full AI Insights Engine ships in M10. These are illustrative examples.</p>
            <div className="flex flex-col gap-3">
              {STATIC_INSIGHTS.map((ins, i) => <InsightCard key={i} insight={ins} />)}
            </div>
          </div>

          {/* Top channel attribution card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#14532d] rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 dark pointer-events-none">
              <FloatingPaths position={0.5} />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#22c55e]" />
                <h3 className="font-display font-semibold text-white text-base">Attribution Summary</h3>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
                </div>
              ) : leadsBySource.length > 0 ? (
                <>
                  <div className="mb-3">
                    <div className="text-[#22c55e] text-xs font-semibold font-sans-body uppercase tracking-wider mb-1">
                      Top Source
                    </div>
                    <div className="font-display font-bold text-3xl text-white mb-1 capitalize">
                      {leadsBySource[0]?.source?.replace(/_/g, " ")}
                    </div>
                    <div className="text-slate-500 text-xs font-sans-body">
                      {leadsBySource[0]?.leads} leads this month
                    </div>
                  </div>
                  <div className="h-px bg-[#166534] my-3" />
                  <div className="flex justify-between text-xs font-sans-body">
                    {leadsBySource.slice(0, 3).map((s, i) => (
                      <div key={i}>
                        <div className="text-slate-500 capitalize">{s.source.replace(/_/g, " ")}</div>
                        <div className="text-white font-semibold mt-0.5">{s.leads}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-sm font-sans-body">Create leads to see attribution data here.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
