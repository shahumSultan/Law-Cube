"use client";

import { useState } from "react";
import { mockLeads } from "@/lib/mock-data";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown } from "lucide-react";

const STATUSES = ["All", "New", "Contacted", "Consultation Scheduled", "Consultation Completed", "Retained", "Lost", "Spam"];
const SOURCES  = ["All Sources", "CallRail", "Web Form", "Manual", "Calendly"];

function StatusPill({ status }: { status: string }) {
  const slug = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`pill pill-${slug}`}>{status}</span>;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-[#141d2e] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="font-display font-bold text-xs" style={{ color }}>{score}</span>
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All Sources");

  const filtered = mockLeads.filter(lead => {
    const matchSearch = `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchSource = sourceFilter === "All Sources" || lead.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#eef2ff] tracking-tight">Leads</h2>
          <p className="text-[#4a5c78] text-sm mt-0.5">{mockLeads.length} total leads · {mockLeads.filter(l => l.status === "Retained").length} retained</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#3b82f6]/20">
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#141d2e] border border-[#1e2d45] rounded-xl px-3.5 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#4a5c78] shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="bg-transparent text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none flex-1" />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#141d2e] border border-[#1e2d45] rounded-xl px-3.5 py-2.5 text-[#8899b4] text-sm outline-none hover:border-[#2a3f5f] transition-colors cursor-pointer">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Source filter */}
        <select
          value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="bg-[#141d2e] border border-[#1e2d45] rounded-xl px-3.5 py-2.5 text-[#8899b4] text-sm outline-none hover:border-[#2a3f5f] transition-colors cursor-pointer">
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <button className="flex items-center gap-2 bg-[#141d2e] border border-[#1e2d45] hover:border-[#2a3f5f] text-[#8899b4] hover:text-[#eef2ff] text-sm px-3.5 py-2.5 rounded-xl transition-all">
          <Filter className="w-3.5 h-3.5" /> More Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2d45]">
                <th className="w-10 px-4 py-3.5">
                  <input type="checkbox" className="rounded border-[#1e2d45] bg-[#141d2e] accent-[#3b82f6]" />
                </th>
                {[
                  { label: "Name",       sortable: true },
                  { label: "Phone",      sortable: false },
                  { label: "Source",     sortable: true },
                  { label: "Campaign",   sortable: false },
                  { label: "Score",      sortable: true },
                  { label: "Status",     sortable: true },
                  { label: "Assigned",   sortable: true },
                  { label: "Created",    sortable: true },
                  { label: "",           sortable: false },
                ].map((h, i) => (
                  <th key={i} className="text-left text-[#4a5c78] text-xs font-medium px-4 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      {h.label}
                      {h.sortable && <ArrowUpDown className="w-3 h-3 opacity-40 cursor-pointer hover:opacity-100" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-[#4a5c78] text-sm">
                    No leads match your filters.
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="border-b border-[#1e2d45]/60 table-row-hover cursor-pointer">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded border-[#1e2d45] bg-[#141d2e] accent-[#3b82f6]" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-[#eef2ff] text-sm">{lead.firstName} {lead.lastName}</div>
                    <div className="text-[#4a5c78] text-xs mt-0.5">{lead.email}</div>
                  </td>
                  <td className="px-4 py-4 text-[#8899b4] text-sm">{lead.phone}</td>
                  <td className="px-4 py-4">
                    <span className="text-[#8899b4] text-sm">{lead.source}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[#4a5c78] text-xs max-w-[140px] truncate block">{lead.campaign}</span>
                  </td>
                  <td className="px-4 py-4"><ScoreBadge score={lead.score} /></td>
                  <td className="px-4 py-4"><StatusPill status={lead.status} /></td>
                  <td className="px-4 py-4 text-[#8899b4] text-sm">{lead.assigned}</td>
                  <td className="px-4 py-4 text-[#4a5c78] text-xs whitespace-nowrap">{lead.created}</td>
                  <td className="px-4 py-4">
                    <button className="w-7 h-7 rounded-lg hover:bg-[#141d2e] flex items-center justify-center text-[#4a5c78] hover:text-[#8899b4] transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#1e2d45]">
          <span className="text-[#4a5c78] text-sm">Showing {filtered.length} of {mockLeads.length} leads</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-[#141d2e] border border-[#1e2d45] flex items-center justify-center text-[#4a5c78] hover:text-[#eef2ff] hover:border-[#2a3f5f] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map(n => (
              <button key={n} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${n === 1 ? "bg-[#3b82f6] text-white" : "bg-[#141d2e] border border-[#1e2d45] text-[#4a5c78] hover:text-[#eef2ff]"}`}>
                {n}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg bg-[#141d2e] border border-[#1e2d45] flex items-center justify-center text-[#4a5c78] hover:text-[#eef2ff] hover:border-[#2a3f5f] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
