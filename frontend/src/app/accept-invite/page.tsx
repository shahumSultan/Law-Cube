"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, AlertCircle, Check } from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) { setError("Missing invite token"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      await usersApi.acceptInvite(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px]">

        <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <Image src="/logo.png" alt="Law Cube" width={36} height={36} className="rounded-xl shadow" />
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl tracking-tight">Law Cube</span>
        </Link>

        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-slate-100 mb-2">Account activated</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-slate-100 mb-1.5 text-center">Accept your invitation</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-sans-body text-center">Set a password to activate your Law Cube account</p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-red-700 dark:text-red-400 text-sm font-sans-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 focus:border-zinc-400 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors pr-11 shadow-sm font-sans-body" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Confirm password</label>
                <input type={showPw ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 focus:border-zinc-400 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors shadow-sm font-sans-body" />
              </div>

              <div className="inline-block w-full group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mt-1">
                <Button type="submit" disabled={loading} variant="ghost"
                  className="w-full rounded-[1.15rem] py-6 text-base font-semibold backdrop-blur-md
                    bg-[#16a34a] hover:bg-[#15803d] text-white transition-all duration-300
                    group-hover:-translate-y-0.5 border border-white/10 hover:shadow-md font-sans-body disabled:opacity-60">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span className="opacity-90 group-hover:opacity-100">Activate Account</span><span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300"><ArrowRight className="w-4 h-4 inline" /></span></>
                  }
                </Button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950" />}>
      <AcceptInviteForm />
    </Suspense>
  );
}
