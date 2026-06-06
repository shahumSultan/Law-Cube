"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, User, Plus, Loader2, X, Copy, Check,
  Shield, Trash2,
} from "lucide-react";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { canInviteUser, canChangeRole, isFirmOwner } from "@/lib/types";
import type { Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  firm_owner: "Firm Owner",
  intake_manager: "Intake Manager",
  intake_specialist: "Intake Specialist",
  attorney: "Attorney",
};

const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
  super_admin:       { bg: "#F5F3FF", text: "#5B21B6", border: "#DDD6FE" },
  firm_owner:        { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  intake_manager:    { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
  intake_specialist: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  attorney:          { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" },
};

function RoleBadge({ role }: { role: Role }) {
  const c = ROLE_COLORS[role] ?? ROLE_COLORS.intake_specialist;
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full font-sans-body"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

/* ─── Invite Modal ─── */
function InviteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", role: "intake_specialist" });
  const [result, setResult] = useState<{ invite_url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => usersApi.invite(form),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(result!.invite_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!result ? onClose : undefined} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-[#166534] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#166534]">
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Invite Team Member</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-800 dark:text-emerald-300 text-sm font-semibold font-sans-body">Invitation created</p>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-sans-body">Share this link with {form.first_name}</p>
              </div>
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
                Invite Link
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-3.5 py-2.5">
                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono flex-1 truncate">{result.invite_url}</span>
                <button onClick={copyLink}
                  className="text-[#15803d] dark:text-green-400 hover:text-[#166534] transition-colors shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-1.5 font-sans-body">
                In production, this link will be emailed automatically.
              </p>
            </div>

            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-sans-body transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); mutate(); }} className="px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm font-sans-body bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                {(error as Error).message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[{ label: "First name", key: "first_name", placeholder: "Sarah" },
                { label: "Last name", key: "last_name", placeholder: "Thornton" }].map(f => (
                <div key={f.key}>
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <input type="text" required value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
                </div>
              ))}
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Work Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="sarah@lawfirm.com"
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] focus:border-[#15803d] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none font-sans-body">
                <option value="intake_specialist">Intake Specialist</option>
                <option value="intake_manager">Intake Manager</option>
                <option value="attorney">Attorney</option>
                <option value="firm_owner">Firm Owner</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#166534] text-slate-600 dark:text-slate-400 text-sm font-semibold font-sans-body hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold font-sans-body transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Invite"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ─── Settings page ─── */
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const role = currentUser?.role ?? "intake_specialist";

  const [tab, setTab] = useState<"profile" | "team">("team");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.list,
    enabled: tab === "team",
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, newRole }: { id: string; newRole: string }) => usersApi.updateRole(id, newRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const members = usersData?.items ?? [];

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-sans-body">Manage your firm profile and team</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-[#166534]">
        {[
          { key: "team" as const, label: "Team", icon: Users },
          { key: "profile" as const, label: "Profile", icon: User },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold font-sans-body border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#15803d] text-[#15803d] dark:text-green-400 dark:border-green-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Team tab */}
      {tab === "team" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Team Members</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canInviteUser(role) && (
              <button onClick={() => setInviteOpen(true)}
                className="flex items-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md font-sans-body">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Invite Member</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl overflow-hidden">
            {usersLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">No team members yet</p>
                {canInviteUser(role) && (
                  <button onClick={() => setInviteOpen(true)}
                    className="mt-3 text-[#15803d] dark:text-green-400 text-sm font-semibold hover:underline font-sans-body">
                    Invite your first team member
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-[#15803d] flex items-center justify-center border border-green-800/20 shrink-0">
                      <span className="text-white text-sm font-bold font-sans-body">
                        {member.first_name[0]}{member.last_name[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                          {member.first_name} {member.last_name}
                          {member.id === currentUser?.id && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal"> (you)</span>
                          )}
                        </span>
                        {!member.is_active && (
                          <span className="text-xs bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-sans-body">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body truncate">{member.email}</p>
                    </div>

                    <div className="shrink-0">
                      {canChangeRole(role) && member.id !== currentUser?.id ? (
                        <select
                          value={member.role}
                          onChange={e => roleChangeMutation.mutate({ id: member.id, newRole: e.target.value })}
                          className="bg-transparent border-0 outline-none text-xs font-semibold font-sans-body cursor-pointer"
                          style={{ color: ROLE_COLORS[member.role as Role]?.text ?? "#475569" }}
                        >
                          <option value="intake_specialist">Intake Specialist</option>
                          <option value="intake_manager">Intake Manager</option>
                          <option value="attorney">Attorney</option>
                          <option value="firm_owner">Firm Owner</option>
                        </select>
                      ) : (
                        <RoleBadge role={member.role as Role} />
                      )}
                    </div>

                    {isFirmOwner(role) && member.id !== currentUser?.id && member.is_active && (
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate ${member.first_name} ${member.last_name}? They will lose access immediately.`)) {
                            deactivateMutation.mutate(member.id);
                          }
                        }}
                        disabled={deactivateMutation.isPending}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center text-slate-300 dark:text-slate-600 hover:text-red-500 transition-all shrink-0"
                        title="Deactivate user"
                      >
                        {deactivateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-[#166534] rounded-xl">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans-body leading-relaxed">
              All user actions are audit-logged. Role changes take effect immediately. Deactivated users retain their data but cannot log in.
            </p>
          </div>
        </div>
      )}

      {/* Profile tab */}
      {tab === "profile" && currentUser && (
        <div className="flex flex-col gap-5">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-[#166534] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#15803d] flex items-center justify-center border-2 border-green-200 dark:border-green-900">
                <span className="text-white text-xl font-bold font-sans-body">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl">
                  {currentUser.first_name} {currentUser.last_name}
                </h3>
                <RoleBadge role={currentUser.role as Role} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "First name", value: currentUser.first_name },
                { label: "Last name", value: currentUser.last_name },
                { label: "Email address", value: currentUser.email },
                { label: "Role", value: ROLE_LABELS[currentUser.role as Role] ?? currentUser.role },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-[#166534] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm font-sans-body">
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs mt-4 font-sans-body">
              Profile editing will be available in a future update.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
