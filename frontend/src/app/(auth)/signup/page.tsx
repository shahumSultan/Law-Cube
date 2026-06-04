"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, Shield, AlertCircle } from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function SignupPage() {
  const router = useRouter();
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({
    first_name: "", last_name: "", firm_name: "", email: "", password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      const tokens = await authApi.register(form);
      useAuthStore.setState({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
      const me = await authApi.me();
      useAuthStore.setState({ user: me, isLoading: false });
      router.push("/dashboard");
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    clearError();
    setLocalError("");
    try {
      await loginWithGoogle(accessToken, form.firm_name || undefined);
      router.push("/dashboard");
    } catch {
      // error is set in store
    }
  };

  const displayError = localError || error;
  const loading = submitting || isLoading;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-[#0A1628] relative overflow-hidden"
        style={{ borderRight: "1px solid #162640" }}>
        <div className="absolute inset-0 opacity-20 dark">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-[#059669]/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col h-full p-12">

          <Link href="/" className="flex items-center gap-3 mb-14">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center shadow-lg">
              <span className="font-display font-bold text-white">LC</span>
            </div>
            <span className="font-display font-semibold text-white text-xl tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-800/40 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 text-xs font-semibold font-sans-body">14-day free trial · No credit card</span>
            </motion.div>

            <h2 className="font-display font-bold text-white leading-tight mb-5" style={{ fontSize: "2.5rem" }}>
              Start converting<br />more leads<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">in minutes.</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 font-sans-body">
              Connect CallRail, configure your intake flow, and let AI do the heavy lifting. No setup fees, no contracts.
            </p>

            <ul className="flex flex-col gap-4 mb-12">
              {[
                "Free 14-day trial — no credit card required",
                "Connect CallRail in under 5 minutes",
                "AI call summaries live on day one",
                "Cancel anytime, export your data",
              ].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 text-slate-400 text-sm font-sans-body">
                  <div className="w-5 h-5 rounded-full bg-[#059669]/15 border border-[#059669]/25 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#059669]" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-[#0F1E35] rounded-2xl p-5" style={{ border: "1px solid #162640" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["JM", "ST", "CD", "AR"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-[#1E3A8A] border-2 border-[#0F1E35] flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold font-sans-body">{initials}</span>
                  </div>
                ))}
              </div>
              <span className="text-slate-500 text-xs font-sans-body">Joined this month</span>
            </div>
            <p className="text-slate-500 text-xs font-sans-body">
              Join <span className="text-slate-200 font-semibold">200+ law firms</span> already using Law Cube to grow their practice.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <FloatingPaths position={0.3} />
        </div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[400px]">

          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow">
              <span className="font-display font-bold text-white text-sm">LC</span>
            </div>
            <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-slate-900 dark:text-slate-100 mb-1.5">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-sans-body">Start your 14-day free trial today</p>

          {displayError && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm font-sans-body">{displayError}</p>
            </div>
          )}

          {/* Google — only rendered when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => setLocalError("Google sign-in failed")}
              disabled={loading}
            />
          )}

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-slate-400 dark:text-slate-500 text-xs font-sans-body">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "First name", key: "first_name" as const, placeholder: "James" },
                { label: "Last name", key: "last_name" as const, placeholder: "Mitchell" }].map(f => (
                <div key={f.key}>
                  <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <input type="text" required value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors shadow-sm font-sans-body" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Firm name</label>
              <input type="text" required value={form.firm_name} onChange={set("firm_name")} placeholder="Mitchell & Associates"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors shadow-sm font-sans-body" />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Work email</label>
              <input type="email" required value={form.email} onChange={set("email")} placeholder="james@mitchelllaw.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors shadow-sm font-sans-body" />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors pr-11 shadow-sm font-sans-body" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="inline-block w-full group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mt-1">
              <Button type="submit" disabled={loading} variant="ghost"
                className="w-full rounded-[1.15rem] py-6 text-base font-semibold backdrop-blur-md
                  bg-[#1E3A8A]/95 hover:bg-[#1D4ED8] text-white transition-all duration-300
                  group-hover:-translate-y-0.5 border border-white/10 hover:shadow-md font-sans-body disabled:opacity-60">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span className="opacity-90 group-hover:opacity-100">Create Account</span><span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300"><ArrowRight className="w-4 h-4 inline" /></span></>
                }
              </Button>
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs text-center font-sans-body">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[#1E3A8A] dark:text-blue-400 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-[#1E3A8A] dark:text-blue-400 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6 font-sans-body">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1E3A8A] dark:text-blue-400 hover:underline font-semibold transition-colors">Sign in</Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-8 text-slate-400 dark:text-slate-500 text-xs font-sans-body">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            SOC2 Type II · 256-bit encryption · HIPAA ready
          </div>
        </motion.div>
      </div>
    </div>
  );
}
