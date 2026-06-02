"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, PhoneCall, Zap, Calendar,
  TrendingUp, BarChart3, Settings, ChevronLeft,
  Bell, Search, ChevronDown
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
  { icon: Users,           label: "Leads",       href: "/dashboard/leads" },
  { icon: PhoneCall,       label: "Calls",        href: "/dashboard/calls" },
  { icon: Zap,             label: "Follow-Up",    href: "/dashboard/follow-up" },
  { icon: Calendar,        label: "Scheduling",   href: "/dashboard/scheduling" },
  { icon: TrendingUp,      label: "Marketing",    href: "/dashboard/marketing" },
  { icon: BarChart3,       label: "Reports",      href: "/dashboard/reports" },
  { icon: Settings,        label: "Settings",     href: "/dashboard/settings" },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`fixed top-0 left-0 h-full flex flex-col bg-[#0f1624] border-r border-[#1e2d45] z-40 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-[#1e2d45] px-4 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-white text-xs">LC</span>
            </div>
            <span className="font-display font-semibold text-[#eef2ff] tracking-tight">Law Cube</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <span className="font-display font-bold text-white text-xs">LC</span>
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle}
            className="w-7 h-7 rounded-lg hover:bg-[#141d2e] flex items-center justify-center text-[#4a5c78] hover:text-[#8899b4] transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-lg transition-all duration-150 group relative ${
                collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"
              } ${active
                  ? "bg-[#3b82f6]/15 text-[#60a5fa]"
                  : "text-[#8899b4] hover:bg-[#141d2e] hover:text-[#eef2ff]"
              }`}>
              <item.icon className={`shrink-0 ${collapsed ? "w-5 h-5" : "w-4.5 h-4.5"}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#141d2e] border border-[#1e2d45] rounded-lg text-[#eef2ff] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`border-t border-[#1e2d45] p-3 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30">
            <span className="text-[#60a5fa] text-xs font-bold">JM</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1 py-1 rounded-lg hover:bg-[#141d2e] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center border border-[#3b82f6]/30 shrink-0">
              <span className="text-[#60a5fa] text-xs font-bold">JM</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#eef2ff] text-xs font-semibold truncate">James Mitchell</div>
              <div className="text-[#4a5c78] text-[10px] truncate">Mitchell & Associates</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#4a5c78] shrink-0" />
          </div>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#141d2e] border border-[#1e2d45] flex items-center justify-center text-[#4a5c78] hover:text-[#8899b4] transition-all">
          <ChevronLeft className="w-3 h-3 rotate-180" />
        </button>
      )}
    </aside>
  );
}

function Topbar() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(n => n.href === pathname);

  return (
    <header className="h-16 border-b border-[#1e2d45] bg-[#090d18]/80 backdrop-blur-md flex items-center px-6 gap-4">
      <div className="flex-1">
        <h1 className="font-display font-semibold text-[#eef2ff] text-base">{current?.label ?? "Dashboard"}</h1>
        <p className="text-[#4a5c78] text-xs">Mitchell & Associates</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-[#0f1624] border border-[#1e2d45] rounded-xl px-3.5 py-2 w-56">
        <Search className="w-3.5 h-3.5 text-[#4a5c78]" />
        <input placeholder="Search leads, calls..." className="bg-transparent text-[#8899b4] text-sm placeholder:text-[#4a5c78] outline-none flex-1 w-full" />
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 rounded-xl bg-[#0f1624] border border-[#1e2d45] hover:border-[#2a3f5f] flex items-center justify-center text-[#4a5c78] hover:text-[#8899b4] transition-all">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3b82f6] rounded-full border border-[#090d18]" />
      </button>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/20 border border-[#3b82f6]/30 flex items-center justify-center cursor-pointer">
        <span className="text-[#60a5fa] text-xs font-bold">JM</span>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d18] flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
