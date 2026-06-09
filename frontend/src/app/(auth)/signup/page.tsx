"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const INPUT_CLS = "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 rounded-lg px-3.5 py-3 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-colors font-sans-body";

export default function SignupPage() {
  const router = useRouter();
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [form, setForm] = useState({ first_name: "", last_name: "", firm_name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    if (form.password.length < 8) { setLocalError("Password must be at least 8 characters"); return; }
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
      // error in store
    }
  };

  const displayError = localError || error;
  const loading = submitting || isLoading;

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark editorial */}
      <div className="hidden lg:flex flex-col w-[440px] shrink-0 bg-zinc-950 relative overflow-hidden"
        style={{ borderRight: "1px solid #27272a" }}>

        <div className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#22c55e]/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col h-full p-12">

          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <Image src="/logo.png" alt="Law Cube" width={30} height={30} className="rounded-md" />
            <span className="font-display font-semibold text-zinc-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <div className="inline-flex items-center gap-2 border border-zinc-800 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-zinc-500 text-xs font-semibold font-sans-body">7-day free trial · No credit card</span>
            </div>

            <h2 className="font-display font-bold text-zinc-100 leading-tight mb-5" style={{ fontSize: "2.5rem" }}>
              Start converting<br />more leads<br />
              <span className="text-[#22c55e]">in minutes.</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-sans-body">
              Connect CallRail, configure your intake flow, and let AI do the heavy lifting. No setup fees, no contracts.
            </p>

            <ul className="flex flex-col gap-4 mb-12">
              {[
                "Free 7-day trial — no credit card required",
                "Connect CallRail in under 5 minutes",
                "AI call summaries live on day one",
                "Cancel anytime, export your data",
              ].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 text-zinc-500 text-sm font-sans-body">
                  <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#22c55e]" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["JM", "ST", "CD", "AR"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center">
                    <span className="text-zinc-200 text-[9px] font-bold font-sans-body">{initials}</span>
                  </div>
                ))}
              </div>
              <span className="text-zinc-600 text-xs font-sans-body">Joined this month</span>
            </div>
            <p className="text-zinc-600 text-xs font-sans-body">
              Join <span className="text-zinc-300 font-semibold">200+ law firms</span> already using Law Cube to grow their practice.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]">

          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <Image src="/logo.png" alt="Law Cube" width={28} height={28} className="rounded-md" />
            <span className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Create your account</h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-8 font-sans-body">Start your 7-day free trial today</p>

          {displayError && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm font-sans-body">{displayError}</p>
            </div>
          )}

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => setLocalError("Google sign-in failed")}
              disabled={loading}
            />
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-sans-body">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "First name", key: "first_name" as const, placeholder: "James" },
                { label: "Last name", key: "last_name" as const, placeholder: "Mitchell" }].map(f => (
                <div key={f.key}>
                  <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">{f.label}</label>
                  <input type="text" required value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} className={INPUT_CLS} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Firm name</label>
              <input type="text" required value={form.firm_name} onChange={set("firm_name")} placeholder="Mitchell & Associates" className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Work email</label>
              <input type="email" required value={form.email} onChange={set("email")} placeholder="james@mitchelllaw.com" className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                  className={INPUT_CLS + " pr-11"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors duration-150 font-sans-body disabled:opacity-60 mt-1">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="flex items-center justify-center gap-2">Create account <ArrowRight className="w-4 h-4" /></span>
              }
            </Button>

            <p className="text-zinc-400 dark:text-zinc-600 text-xs text-center font-sans-body">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-zinc-500 dark:text-zinc-400 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mt-6 font-sans-body">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold transition-colors">Sign in</Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-6 text-zinc-400 dark:text-zinc-600 text-xs font-sans-body">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            SOC2 Type II · 256-bit encryption · HIPAA ready
          </div>
        </motion.div>
      </div>
    </div>
  );
}
