"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, PhoneCall, Zap, Calendar,
  TrendingUp, BarChart3, Settings, ChevronLeft,
  Bell, Search, ChevronRight, Menu, X, LogOut,
} from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthGuard } from "@/components/auth-guard";
import { useAuthStore } from "@/lib/auth-store";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
  { icon: Users,           label: "Leads",       href: "/dashboard/leads" },
  { icon: PhoneCall,       label: "Calls",        href: "/dashboard/calls" },
  { icon: Zap,             label: "Follow-Up",    href: "/dashboard/follow-up" },
  { icon: Calendar,        label: "Scheduling",   href: "/dashboard/scheduling" },
  { icon: TrendingUp,      label: "Marketing",    href: "/dashboard/marketing" },
  { icon: BarChart3,       label: "Reports",      href: "/dashboard/reports" },
];

function NavLink({
  item,
  collapsed,
  mobile = false,
  onClick,
}: {
  item: typeof NAV_ITEMS[0];
  collapsed: boolean;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;
  const showLabel = mobile || !collapsed;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-lg transition-all duration-150 group relative font-sans-body",
        mobile ? "px-3 py-3" : collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5",
        active
          ? "bg-[#22c55e]/15 text-[#22c55e]"
          : "text-green-100/60 hover:bg-[#166534] hover:text-green-50",
      ].join(" ")}
    >
      <item.icon className="w-[18px] h-[18px] shrink-0" />
      {showLabel && <span className="text-sm font-medium">{item.label}</span>}
      {active && showLabel && <div className="ml-auto w-1 h-4 rounded-full bg-[#22c55e]" />}
      {!mobile && collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0d2a18] border border-[#166534] rounded-lg text-green-100 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans-body shadow-lg">
          {item.label}
        </div>
      )}
    </Link>
  );
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <div
      className={`relative p-3 shrink-0 ${collapsed ? "lg:flex lg:justify-center" : ""}`}
      style={{ borderTop: "1px solid #166534" }}
    >
      {collapsed ? (
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-8 h-8 rounded-full bg-[#15803d] flex items-center justify-center border border-[#166534] hover:bg-red-800 hover:border-red-700 transition-colors group"
        >
          <span className="text-white text-xs font-bold font-sans-body group-hover:hidden">{initials}</span>
          <LogOut className="w-3.5 h-3.5 text-white hidden group-hover:block" />
        </button>
      ) : (
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#166534] transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#15803d] flex items-center justify-center border border-[#166534] shrink-0">
            <span className="text-white text-xs font-bold font-sans-body">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-200 text-xs font-semibold truncate font-sans-body">
              {user ? `${user.first_name} ${user.last_name}` : "Loading…"}
            </div>
            <div className="text-slate-500 text-[10px] truncate font-sans-body capitalize">
              {user?.role?.replace(/_/g, " ") ?? ""}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-all shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel — overflow-hidden removed so toggle button isn't clipped */}
      <aside
        className={[
          "fixed top-0 left-0 h-full flex flex-col bg-[#14532d] z-40 transition-all duration-300 sidebar-scroll",
          "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[64px] lg:translate-x-0" : "lg:w-[224px] lg:translate-x-0",
        ].join(" ")}
        style={{ borderRight: "1px solid #166534" }}
      >
        {/* Watermark — overflow-hidden lives here instead of on aside */}
        <div className="absolute inset-0 overflow-hidden opacity-[0.07] pointer-events-none dark">
          <FloatingPaths position={1} />
        </div>

        {/* Logo row */}
        <div
          className={[
            "relative flex items-center h-[60px] shrink-0 px-4",
            collapsed ? "lg:justify-center" : "justify-between",
          ].join(" ")}
          style={{ borderBottom: "1px solid #166534" }}
        >
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src="/logo.png" alt="Law Cube" width={28} height={28} className="rounded-lg shrink-0 shadow-md" />
            <span className={`font-display font-semibold text-white text-lg tracking-tight truncate ${collapsed ? "lg:hidden" : ""}`}>
              Law Cube
            </span>
          </Link>
          {/* Mobile close only — desktop toggle is rendered outside aside */}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#166534] transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section label */}
        <div className={`relative px-4 pt-5 pb-2 ${collapsed ? "lg:hidden" : ""}`}>
          <span className="text-green-200/40 text-[10px] font-semibold uppercase tracking-[0.15em] font-sans-body">
            Menu
          </span>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto sidebar-scroll">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              mobile={mobileOpen}
              onClick={onMobileClose}
            />
          ))}
        </nav>

        {/* Settings */}
        <div className="relative px-2 pb-2" style={{ borderTop: "1px solid #166534" }}>
          {!collapsed && (
            <div className="px-1 pt-3 pb-1">
              <span className="text-green-200/40 text-[10px] font-semibold uppercase tracking-[0.15em] font-sans-body">
                General
              </span>
            </div>
          )}
          <div className="pt-1">
            <NavLink
              item={{ icon: Settings, label: "Settings", href: "/dashboard/settings" }}
              collapsed={collapsed}
              mobile={mobileOpen}
              onClick={onMobileClose}
            />
          </div>
        </div>

        {/* User */}
        <SidebarUser collapsed={collapsed} />
      </aside>

      {/* Desktop collapse/expand toggle — sibling of aside, never clipped */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex fixed z-50 top-[72px] -translate-x-1/2 w-6 h-6 rounded-full bg-[#166534] border border-[#15803d] items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#15803d] shadow-md"
        style={{
          left: collapsed ? "64px" : "224px",
          transition: "left 300ms cubic-bezier(0.4,0,0.2,1), background-color 150ms, color 150ms",
        }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </>
  );
}

function OrgName() {
  const user = useAuthStore(s => s.user);
  if (!user) return null;
  return (
    <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body hidden sm:block capitalize">
      {user.role.replace(/_/g, " ")}
    </p>
  );
}

function TopbarUserMenu() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.replace("/login");
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="User menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-lg bg-[#15803d] flex items-center justify-center border border-[#22c55e]/30 hover:bg-[#166534] transition-colors"
      >
        <span className="text-white text-xs font-bold font-sans-body">{initials}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
              <div className="text-slate-900 dark:text-slate-100 text-sm font-semibold font-sans-body truncate">
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body capitalize truncate">
                {user?.role?.replace(/_/g, " ") ?? ""}
              </div>
            </div>
            <div className="py-1">
              <button
                onClick={() => { router.push("/dashboard/settings"); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 font-sans-body"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-3 font-sans-body"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Topbar({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(n => n.href === pathname);
  const label = current?.label ?? (pathname.includes("settings") ? "Settings" : "Dashboard");

  return (
    <header
      className="h-[60px] bg-white dark:bg-slate-900 flex items-center px-4 gap-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-slate-900 dark:text-slate-100 text-xl sm:text-2xl leading-tight tracking-tight">{label}</h1>
        <OrgName />
      </div>

      <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2 w-56 focus-within:border-[#15803d] transition-colors">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          placeholder="Search leads, calls…"
          className="bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none flex-1 w-full font-sans-body"
        />
      </div>

      <ThemeToggle />

      <button className="relative w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all shrink-0">
        <Bell className="w-4 h-4" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
      </button>

      <TopbarUserMenu />
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030d06] flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={[
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            collapsed ? "lg:ml-[64px]" : "lg:ml-[224px]",
          ].join(" ")}
        >
          <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
