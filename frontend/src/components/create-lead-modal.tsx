"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import type { LeadCreate } from "@/lib/types";

const SOURCES = ["manual", "callrail", "web_form", "calendly", "facebook", "google"];

export function CreateLeadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<LeadCreate>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    source: "manual",
    campaign: "",
  });
  const [error, setError] = useState("");

  const set = (key: keyof LeadCreate) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const { mutate, isPending } = useMutation({
    mutationFn: (body: LeadCreate) => leadsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required");
      return;
    }
    mutate({
      ...form,
      phone: form.phone || undefined,
      email: form.email || undefined,
      campaign: form.campaign || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg">Add New Lead</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm font-sans-body bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "First name *", key: "first_name" as const, placeholder: "James" },
              { label: "Last name *", key: "last_name" as const, placeholder: "Mitchell" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                <input type="text" value={form[f.key] ?? ""} onChange={set(f.key)} placeholder={f.placeholder}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Phone</label>
            <input type="tel" value={form.phone ?? ""} onChange={set("phone")} placeholder="(555) 123-4567"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Email</label>
            <input type="email" value={form.email ?? ""} onChange={set("email")} placeholder="client@email.com"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Source</label>
              <select value={form.source} onChange={set("source")}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm outline-none font-sans-body capitalize">
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Campaign</label>
              <input type="text" value={form.campaign ?? ""} onChange={set("campaign")} placeholder="Google Ads"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors font-sans-body" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold font-sans-body hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white text-sm font-semibold font-sans-body transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
