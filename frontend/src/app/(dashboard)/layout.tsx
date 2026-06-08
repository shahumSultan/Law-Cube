"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, PhoneCall, Zap, Calendar,
  TrendingUp, BarChart3, Settings, ChevronLeft,
  Bell, Search, ChevronRight, Menu, X, LogOut, CheckCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthGuard } from "@/components/auth-guard";
import { useAuthStore } from "@/lib/auth-store";
import { notificationsApi, type NotificationRecord } from "@/lib/api";

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
        "flex items-center gap-3 rounded-md transition-all duration-150 group relative font-sans-body",
        mobile ? "px-3 py-2.5" : collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2",
        active
          ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
          : "text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-800 dark:hover:text-zinc-300",
      ].join(" ")}
    >
      <item.icon className={[
        "w-[17px] h-[17px] shrink-0 transition-colors",
        active ? "text-[#22c55e]" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400",
      ].join(" ")} />
      {showLabel && (
        <span className="text-[13px] font-medium tracking-[0.005em]">{item.label}</span>
      )}
      {active && showLabel && (
        <div className="ml-auto w-1 h-3.5 rounded-full bg-[#22c55e]" />
      )}
      {!mobile && collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 dark:border-zinc-700 rounded-md text-zinc-200 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-sans-body shadow-lg">
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
      style={{ borderTop: "1px solid var(--border)" }}
    >
      {collapsed ? (
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800 transition-colors group"
        >
          <span className="text-zinc-700 dark:text-zinc-300 text-xs font-bold font-sans-body group-hover:hidden">{initials}</span>
          <LogOut className="w-3.5 h-3.5 text-red-500 hidden group-hover:block" />
        </button>
      ) : (
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-default">
          <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-600">
            <span className="text-zinc-100 dark:text-zinc-200 text-[10px] font-bold font-sans-body">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-zinc-800 dark:text-zinc-200 text-xs font-semibold truncate font-sans-body">
              {user ? `${user.first_name} ${user.last_name}` : "Loading…"}
            </div>
            <div className="text-zinc-400 text-[10px] truncate font-sans-body capitalize">
              {user?.role?.replace(/_/g, " ") ?? ""}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all shrink-0"
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          "fixed top-0 left-0 h-full flex flex-col bg-white dark:bg-[#09090b] z-40 transition-all duration-300",
          "w-[272px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-[60px] lg:translate-x-0" : "lg:w-[220px] lg:translate-x-0",
        ].join(" ")}
        style={{ borderRight: "1px solid var(--border)" }}
      >
        {/* Logo row */}
        <div
          className={[
            "flex items-center h-[58px] shrink-0 px-4",
            collapsed ? "lg:justify-center" : "justify-between",
          ].join(" ")}
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src="/logo.png" alt="Law Cube" width={26} height={26} className="rounded-md shrink-0" />
            <span className={`font-display font-semibold text-zinc-900 dark:text-zinc-100 text-[17px] tracking-tight truncate ${collapsed ? "lg:hidden" : ""}`}>
              Law Cube
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="lg:hidden w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section label */}
        <div className={`px-4 pt-4 pb-1.5 ${collapsed ? "lg:hidden" : ""}`}>
          <span className="text-zinc-400 dark:text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.12em] font-sans-body">
            Navigation
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-1 px-2 flex flex-col gap-px overflow-y-auto">
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
        <div className="px-2 pb-2" style={{ borderTop: "1px solid var(--border)" }}>
          {!collapsed && (
            <div className="px-1 pt-3 pb-1.5">
              <span className="text-zinc-400 dark:text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.12em] font-sans-body">
                General
              </span>
            </div>
          )}
          {collapsed && <div className="pt-2" />}
          <NavLink
            item={{ icon: Settings, label: "Settings", href: "/dashboard/settings" }}
            collapsed={collapsed}
            mobile={mobileOpen}
            onClick={onMobileClose}
          />
        </div>

        {/* User */}
        <SidebarUser collapsed={collapsed} />
      </aside>

      {/* Desktop collapse toggle */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden lg:flex fixed z-50 top-[70px] -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shadow-sm hover:shadow-md transition-all"
        style={{
          left: collapsed ? "60px" : "220px",
          transition: "left 300ms cubic-bezier(0.4,0,0.2,1), box-shadow 150ms",
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
    <p className="text-zinc-400 dark:text-zinc-600 text-xs font-sans-body hidden sm:block capitalize">
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
        className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center ring-1 ring-zinc-200 dark:ring-zinc-600 hover:ring-zinc-300 dark:hover:ring-zinc-500 transition-all"
      >
        <span className="text-zinc-100 text-xs font-bold font-sans-body">{initials}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold font-sans-body truncate">
                {user ? `${user.first_name} ${user.last_name}` : ""}
              </div>
              <div className="text-zinc-400 text-xs mt-0.5 font-sans-body capitalize truncate">
                {user?.role?.replace(/_/g, " ") ?? ""}
              </div>
            </div>
            <div className="py-1">
              <button
                onClick={() => { router.push("/dashboard/settings"); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2.5 font-sans-body"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2.5 font-sans-body"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ["notif-count"],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000,
  });

  const { data: listData } = useQuery({
    queryKey: ["notif-list"],
    queryFn: () => notificationsApi.list({ page_size: 10 }),
    enabled: open,
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-count"] });
      qc.invalidateQueries({ queryKey: ["notif-list"] });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notif-count"] });
      qc.invalidateQueries({ queryKey: ["notif-list"] });
    },
  });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const unread = countData?.count ?? 0;
  const notifications: NotificationRecord[] = listData?.items ?? [];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        className="relative w-8 h-8 rounded flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#22c55e] rounded-full border-2 border-white dark:border-[#09090b]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                Notifications {unread > 0 && <span className="ml-1 text-[#22c55e]">({unread})</span>}
              </span>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors font-sans-body"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800">
              {notifications.length === 0 && (
                <p className="text-center text-zinc-400 dark:text-zinc-600 text-sm font-sans-body py-8">
                  No notifications yet
                </p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) markRead.mutate(n.id); }}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    n.read
                      ? "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      : "bg-[#22c55e]/5 hover:bg-[#22c55e]/10"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] mt-1.5 shrink-0" />}
                    {n.read && <span className="w-1.5 h-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-900 dark:text-zinc-100 text-xs font-semibold font-sans-body leading-snug">{n.title}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-sans-body mt-0.5 leading-snug">{n.body}</p>
                      <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-sans-body mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
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
      className="h-[58px] bg-white dark:bg-[#09090b] flex items-center px-4 gap-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden w-8 h-8 rounded flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-xl leading-tight tracking-tight">{label}</h1>
        <OrgName />
      </div>

      <div className="hidden md:flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 w-52 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-colors">
        <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        <input
          placeholder="Search…"
          className="bg-transparent text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 outline-none flex-1 w-full font-sans-body"
        />
      </div>

      <ThemeToggle />

      <NotificationBell />

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
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <div
          className={[
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            collapsed ? "lg:ml-[60px]" : "lg:ml-[220px]",
          ].join(" ")}
        >
          <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
