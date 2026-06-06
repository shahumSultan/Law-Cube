"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown, X, Loader2, ChevronDown, Check } from "lucide-react";
import { leadsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { canDeleteLead, canSetFinalStatus } from "@/lib/types";
import type { Lead, LeadStatus } from "@/lib/types";
import { CreateLeadModal } from "@/components/create-lead-modal";

const STATUSES = ["All", "New", "Contacted", "Consultation Scheduled", "Consultation Completed", "Retained", "Lost", "Spam"];
const SOURCES  = ["All Sources", "CallRail", "Web Form", "Manual", "Calendly"];

const STATUS_API_MAP: Record<string, string> = {
  "New": "new", "Contacted": "contacted",
  "Consultation Scheduled": "consultation_scheduled",
  "Consultation Completed": "consultation_completed",
  "Retained": "retained", "Lost": "lost", "Spam": "spam",
};

const STATUS_SLUG: Record<string, string> = {
  new: "new", contacted: "contacted",
  consultation_scheduled: "scheduled",
  consultation_completed: "completed",
  retained: "retained", lost: "lost", spam: "spam",
};
const STATUS_LABEL: Record<string, string> = {
  new: "New", contacted: "Contacted",
  consultation_scheduled: "Consultation Scheduled",
  consultation_completed: "Consultation Completed",
  retained: "Retained", lost: "Lost", spam: "Spam",
};

function StatusPill({ status }: { status: string }) {
  const slug = STATUS_SLUG[status] ?? status.split("_").pop() ?? "new";
  const label = STATUS_LABEL[status] ?? status.replace(/_/g, " ");
  return <span className={`pill pill-${slug}`}>{label}</span>;
}

const LEAD_STATUSES: LeadStatus[] = [
  "new", "contacted", "consultation_scheduled", "consultation_completed",
  "retained", "lost", "spam",
];

function StatusSelect({
  value,
  onChange,
  loading,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setCoords({ top: rect.bottom + 6, left: rect.left });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const menu = open && createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
      className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-xl shadow-xl py-1.5 min-w-[220px]"
    >
      {LEAD_STATUSES.map(s => (
        <button
          key={s}
          onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false); }}
          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 ${
            s === value ? "bg-slate-50 dark:bg-zinc-900/60" : ""
          }`}
        >
          <StatusPill status={s} />
          {s === value && <Check className="w-3.5 h-3.5 text-[#15803d] dark:text-green-400 shrink-0" />}
        </button>
      ))}
    </div>,
    document.body
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <button
        ref={triggerRef}
        onClick={openMenu}
        disabled={loading}
        className="flex items-center gap-1.5 group hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : (
          <>
            <StatusPill status={value} />
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
          </>
        )}
      </button>
      {menu}
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-400 text-xs font-sans-body">—</span>;
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

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50 dark:border-[#166534]/50">
      {[1, 2, 3, 4, 5].map(i => (
        <td key={i} className="px-4 sm:px-5 py-4">
          <div className="h-4 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const role = user?.role ?? "intake_specialist";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", { status: statusFilter, source: sourceFilter, search, page }],
    queryFn: () => leadsApi.list({
      page,
      page_size: 25,
      status: statusFilter !== "All" ? STATUS_API_MAP[statusFilter] : undefined,
      source: sourceFilter !== "All Sources" ? sourceFilter.toLowerCase().replace(" ", "_") : undefined,
      search: search || undefined,
    }),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) => {
      setPendingLeadId(id);
      return leadsApi.update(id, { status });
    },
    onSettled: () => setPendingLeadId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const leads = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 25);
  const hasActiveFilters = statusFilter !== "All" || sourceFilter !== "All Sources";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">Leads</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-sans-body">
            {isLoading ? "Loading…" : `${total} total`}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-green-900/20 shrink-0 font-sans-body"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3.5 py-2.5 flex-1 focus-within:border-[#15803d] transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, phone…"
              className="bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none flex-1 font-sans-body" />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(f => !f)}
            className={`sm:hidden flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-medium transition-all font-sans-body ${
              hasActiveFilters ? "bg-[#15803d] border-[#15803d] text-white" : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-[#166534] text-slate-600 dark:text-slate-400"
            }`}>
            <Filter className="w-3.5 h-3.5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none hover:border-slate-300 dark:hover:border-zinc-600 transition-colors cursor-pointer font-sans-body">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none hover:border-slate-300 dark:hover:border-zinc-600 transition-colors cursor-pointer font-sans-body">
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {filtersOpen && (
          <div className="sm:hidden flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#166534]">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none font-sans-body">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none font-sans-body">
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#166534]">
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 sm:px-5 py-3.5 font-sans-body uppercase tracking-wider">
                  <span className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                </th>
                <th className="hidden md:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Phone</th>
                <th className="hidden sm:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Source</th>
                <th className="hidden xl:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Campaign</th>
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Score</th>
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Status</th>
                <th className="hidden lg:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Assigned</th>
                <th className="hidden md:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Created</th>
                <th className="w-10 px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : leads.length === 0
                ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm font-sans-body">
                      No leads match your filters.
                    </td>
                  </tr>
                )
                : leads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-50 dark:border-[#166534]/50 table-row-hover">
                    <td className="px-4 sm:px-5 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body">{lead.email}</div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body">{lead.phone}</td>
                    <td className="hidden sm:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body capitalize">{lead.source?.replace(/_/g, " ")}</td>
                    <td className="hidden xl:table-cell px-4 py-4">
                      <span className="text-slate-500 dark:text-slate-400 text-xs truncate block max-w-[140px]">{lead.campaign ?? "—"}</span>
                    </td>
                    <td className="px-4 py-4"><ScoreBadge score={lead.score} /></td>
                    <td className="px-4 py-4">
                      {canSetFinalStatus(role) ? (
                        <StatusSelect
                          value={lead.status as LeadStatus}
                          onChange={status => updateStatusMutation.mutate({ id: lead.id, status })}
                          loading={pendingLeadId === lead.id && updateStatusMutation.isPending}
                        />
                      ) : (
                        <StatusPill status={lead.status} />
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body">
                      {lead.assigned_user_id ?? "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap font-sans-body">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {canDeleteLead(role) && (
                        <button
                          onClick={() => {
                            if (confirm("Delete this lead? This cannot be undone.")) {
                              deleteMutation.mutate(lead.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                          title="Delete lead"
                        >
                          {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-[#166534]">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-sans-body order-2 sm:order-1">
            Showing {leads.length} of {total} leads
          </span>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold font-sans-body transition-all ${
                  n === page
                    ? "bg-[#15803d] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}>
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 transition-all disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create lead modal */}
      {createOpen && <CreateLeadModal onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
