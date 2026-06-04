"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, PhoneCall, TrendingUp, Shield, Star, AlertCircle } from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      // error is set in store
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    clearError();
    try {
      await loginWithGoogle(accessToken);
      router.push("/dashboard");
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col w-[520px] shrink-0 bg-[#0A1628] relative overflow-hidden"
        style={{ borderRight: "1px solid #162640" }}>
        <div className="absolute inset-0 opacity-20 dark">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-[#D97706]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#1E3A8A]/12 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col h-full p-12"
        >
          <Link href="/" className="flex items-center gap-3 mb-14">
            <Image src="/logo.png" alt="Law Cube" width={36} height={36} className="rounded-xl shadow-lg" />
            <span className="font-display font-semibold text-white text-xl tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <h2 className="font-display font-bold text-white leading-tight mb-5" style={{ fontSize: "2.75rem" }}>
              Every call.<br />Every lead.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Every client.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed mb-10 font-sans-body">
              The AI-powered intelligence layer your firm needs to convert more leads and measure every marketing dollar.
            </p>

            <ul className="flex flex-col gap-4 mb-12">
              {[
                { icon: PhoneCall, color: "#1E3A8A", bg: "#162640", text: "AI call transcription and lead scoring in under 4 minutes" },
                { icon: TrendingUp, color: "#D97706", bg: "#1A1500", text: "True cost-per-client attribution by campaign and keyword" },
                { icon: Shield, color: "#059669", bg: "#0A1E18", text: "SOC2 Type II compliant · HIPAA ready for legal data" },
              ].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-slate-400 text-sm leading-relaxed font-sans-body pt-1.5">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-[#0F1E35] rounded-2xl p-6" style={{ border: "1px solid #162640" }}>
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />)}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed italic mb-4 font-display text-base">
              &ldquo;Law Cube showed us exactly which campaigns were driving retained clients. We 2&times;&apos;d our marketing ROI within 60 days.&rdquo;
            </p>
            <div>
              <div className="text-slate-200 text-sm font-semibold font-sans-body">James R. Mitchell</div>
              <div className="text-slate-500 text-xs font-sans-body">Managing Partner · Mitchell &amp; Associates</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-slate-950 relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[400px]">

          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <Image src="/logo.png" alt="Law Cube" width={32} height={32} className="rounded-lg shadow" />
            <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-slate-900 dark:text-slate-100 mb-1.5">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-sans-body">Sign in to your Law Cube dashboard</p>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm font-sans-body">{error}</p>
            </div>
          )}

          {/* Google OAuth — only rendered when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => useAuthStore.setState({ error: "Google sign-in failed" })}
              disabled={isLoading}
            />
          )}

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-slate-400 dark:text-slate-500 text-xs font-sans-body">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">
                Email address
              </label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@lawfirm.com"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors shadow-sm font-sans-body"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 dark:text-slate-400 text-xs font-semibold font-sans-body uppercase tracking-wider">Password</label>
                <a href="#" className="text-[#1E3A8A] dark:text-blue-400 text-xs hover:underline font-semibold font-sans-body transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-colors pr-11 shadow-sm font-sans-body"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="inline-block w-full group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mt-1">
              <Button type="submit" disabled={isLoading} variant="ghost"
                className="w-full rounded-[1.15rem] py-6 text-base font-semibold backdrop-blur-md
                  bg-[#1E3A8A]/95 hover:bg-[#1D4ED8] text-white transition-all duration-300
                  group-hover:-translate-y-0.5 border border-white/10 hover:shadow-md font-sans-body disabled:opacity-60">
                {isLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span className="opacity-90 group-hover:opacity-100">Sign In</span><span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300"><ArrowRight className="w-4 h-4 inline" /></span></>
                }
              </Button>
            </div>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-6 font-sans-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#1E3A8A] dark:text-blue-400 hover:underline font-semibold transition-colors">Start free trial</Link>
          </p>
          <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-8 font-sans-body">Protected by SOC2 Type II · 256-bit encryption</p>
        </motion.div>
      </div>
    </div>
  );
}
