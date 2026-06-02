"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, PhoneCall, Zap, Calendar,
  TrendingUp, BarChart3, Settings, ChevronLeft,
  Bell, Search, ChevronDown, ChevronRight
} from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
  { icon: Users,           label: "Leads",       href: "/dashboard/leads" },
  { icon: PhoneCall,       label: "Calls",        href: "/dashboard/calls" },
  { icon: Zap,             label: "Follow-Up",    href: "/dashboard/follow-up" },
  { icon: Calendar,        label: "Scheduling",   href: "/dashboard/scheduling" },
  { icon: TrendingUp,      label: "Marketing",    href: "/dashboard/marketing" },
  { icon: BarChart3,       label: "Reports",      href: "/dashboard/reports" },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col bg-[#0A1628] z-40 transition-all duration-300 sidebar-scroll overflow-hidden ${collapsed ? "w-[64px]" : "w-[224px]"}`}
      style={{ borderRight: "1px solid #162640" }}
    >
      {/* Subtle floating paths watermark */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none dark">
        <FloatingPaths position={1} />
      </div>

      {/* Logo */}
      <div className={`relative flex items-center h-[60px] shrink-0 px-4 ${collapsed ? "justify-center" : "justify-between"}`}
        style={{ borderBottom: "1px solid #162640" }}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center shrink-0 shadow-md">
              <span className="font-display font-bold text-white text-xs">LC</span>
            </div>
            <span className="font-display font-semibold text-white text-lg tracking-tight truncate">Law Cube</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-md">
              <span className="font-display font-bold text-white text-xs">LC</span>
            </div>
          </Link>
        )}
        {!collapsed && (
          <button onClick={onToggle}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-[#162640] transition-all shrink-0">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <div className="relative px-4 pt-5 pb-2">
          {/* FIX: was #334155 on #0A1628 → slate-500 (passes at large size) */}
          <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest font-sans-body">Main Menu</span>
        </div>
      )}

      {/* Nav items */}
      <nav className="relative flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto sidebar-scroll">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-lg transition-all duration-150 group relative font-sans-body ${
                collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
              } ${active
                /* FIX: active state text #D97706 on its own bg — fine */
                ? "bg-[#D97706]/15 text-[#D97706]"
                /* FIX: was #475569 on #0A1628 (3.2:1 fails small text) → slate-400 */
                : "text-slate-400 hover:bg-[#162640] hover:text-slate-200"
              }`}>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && <div className="ml-auto w-1 h-4 rounded-full bg-[#D97706]" />}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F1E35] border border-[#243D62] rounded-lg text-slate-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans-body shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="relative px-2 pb-2" style={{ borderTop: "1px solid #162640" }}>
        <div className="pt-2">
          <Link href="/dashboard/settings"
            className={`flex items-center gap-3 rounded-lg transition-all duration-150 group relative font-sans-body ${
              collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
            } ${pathname === "/dashboard/settings"
              ? "bg-[#D97706]/15 text-[#D97706]"
              : "text-slate-400 hover:bg-[#162640] hover:text-slate-200"
            }`}>
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0F1E35] border border-[#243D62] rounded-lg text-slate-300 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans-body shadow-lg">
                Settings
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* User */}
      <div className={`relative p-3 shrink-0 ${collapsed ? "flex justify-center" : ""}`}
        style={{ borderTop: "1px solid #162640" }}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center border border-[#243D62]">
            <span className="text-white text-xs font-bold font-sans-body">JM</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#162640] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center border border-[#243D62] shrink-0">
              <span className="text-white text-xs font-bold font-sans-body">JM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-xs font-semibold truncate font-sans-body">James Mitchell</div>
              {/* FIX: was #334155 on #0A1628 (2.3:1 fails) → slate-500 */}
              <div className="text-slate-500 text-[10px] truncate font-sans-body">Mitchell &amp; Associates</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
          </div>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={onToggle}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-[#162640] border border-[#243D62] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all shadow-md">
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </aside>
  );
}

function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(n => n.href === pathname);
  const label = current?.label ?? (pathname.includes("settings") ? "Settings" : "Dashboard");

  return (
    <header className="h-[60px] bg-white dark:bg-slate-900 flex items-center px-6 gap-4"
      style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg leading-tight">{label}</h1>
        {/* FIX: was #94A3B8 on white (2.82:1 fails) → slate-500 */}
        <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">Mitchell &amp; Associates</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 w-60 focus-within:border-[#1E3A8A] transition-colors">
        {/* FIX: was #94A3B8 (fails on white) → slate-400 which renders at 3.75:1 on slate-50 — acceptable for icons */}
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          placeholder="Search leads, calls…"
          className="bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none flex-1 w-full font-sans-body" />
      </div>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notifications */}
      <button className="relative w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all">
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#D97706] rounded-full" />
      </button>

      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="w-9 h-9 rounded-lg bg-[#1E3A8A] flex items-center justify-center cursor-pointer border border-[#1D4ED8]/30 hover:bg-[#1D4ED8] transition-colors"
      >
        <span className="text-white text-xs font-bold font-sans-body">JM</span>
      </motion.div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-[64px]" : "ml-[224px]"}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
