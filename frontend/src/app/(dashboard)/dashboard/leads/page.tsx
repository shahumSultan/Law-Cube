"use client";

import { useState } from "react";
import { mockLeads } from "@/lib/mock-data";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown, X } from "lucide-react";

const STATUSES = ["All", "New", "Contacted", "Consultation Scheduled", "Consultation Completed", "Retained", "Lost", "Spam"];
const SOURCES  = ["All Sources", "CallRail", "Web Form", "Manual", "Calendly"];

function StatusPill({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`pill pill-${slug}`}>{status}</span>;
}

function ScoreBadge({ score }: { score: number }) {
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

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = mockLeads.filter(lead => {
    const matchSearch = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
      .toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchSource = sourceFilter === "All Sources" || lead.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const hasActiveFilters = statusFilter !== "All" || sourceFilter !== "All Sources";

  return (
    <div className="flex flex-col gap-5 max-w-[1400px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">
            Leads
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-sans-body">
            {mockLeads.length} total &middot; {mockLeads.filter(l => l.status === "Retained").length} retained
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-900/20 shrink-0 font-sans-body">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Lead</span>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4">

        {/* Search + mobile filter toggle row */}
        <div className="flex gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 flex-1 focus-within:border-[#1E3A8A] transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none flex-1 font-sans-body"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile: filter toggle button */}
          <button
            onClick={() => setFiltersOpen(f => !f)}
            className={`sm:hidden flex items-center gap-2 border rounded-xl px-3 py-2.5 text-sm font-medium transition-all font-sans-body ${
              hasActiveFilters
                ? "bg-[#1E3A8A] border-[#1E3A8A] text-white"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {hasActiveFilters && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
          </button>

          {/* Desktop: filters inline */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer font-sans-body"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer font-sans-body"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile expanded filters */}
        {filtersOpen && (
          <div className="sm:hidden flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none font-sans-body"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-700 dark:text-slate-300 text-sm outline-none font-sans-body"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => { setStatusFilter("All"); setSourceFilter("All Sources"); }}
                className="text-[#1E3A8A] text-sm font-medium text-left font-sans-body hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                {/* Name: always visible */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 sm:px-5 py-3.5 font-sans-body uppercase tracking-wider">
                  <span className="flex items-center gap-1">Name <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                </th>
                {/* Phone: hidden on mobile */}
                <th className="hidden md:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Phone</th>
                {/* Source: hidden on mobile */}
                <th className="hidden sm:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">
                  <span className="flex items-center gap-1">Source <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                </th>
                {/* Campaign: hidden on tablet */}
                <th className="hidden xl:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Campaign</th>
                {/* Score: always visible */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">
                  <span className="flex items-center gap-1">Score <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                </th>
                {/* Status: always visible */}
                <th className="text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">
                  <span className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3 opacity-40" /></span>
                </th>
                {/* Assigned: hidden on mobile/tablet */}
                <th className="hidden lg:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Assigned</th>
                {/* Date: hidden on mobile */}
                <th className="hidden md:table-cell text-left text-slate-500 dark:text-slate-400 text-xs font-semibold px-4 py-3.5 font-sans-body uppercase tracking-wider">Created</th>
                <th className="w-10 px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 dark:text-slate-500 text-sm font-sans-body">
                    No leads match your filters.
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="border-b border-slate-50 dark:border-slate-700/50 table-row-hover">
                  <td className="px-4 sm:px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-sans-body">{lead.email}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body">
                    {lead.phone}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body">
                    {lead.source}
                  </td>
                  <td className="hidden xl:table-cell px-4 py-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs truncate block max-w-[140px]">
                      {lead.campaign}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ScoreBadge score={lead.score} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={lead.status} />
                  </td>
                  <td className="hidden lg:table-cell px-4 py-4 text-slate-600 dark:text-slate-400 text-sm font-sans-body">
                    {lead.assigned}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap font-sans-body">
                    {lead.created}
                  </td>
                  <td className="px-4 py-4">
                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-sans-body order-2 sm:order-1">
            Showing {filtered.length} of {mockLeads.length} leads
          </span>
          <div className="flex items-center gap-1.5 order-1 sm:order-2">
            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map(n => (
              <button key={n}
                className={`w-8 h-8 rounded-lg text-sm font-semibold font-sans-body transition-all ${
                  n === 1
                    ? "bg-[#1E3A8A] text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}>
                {n}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
