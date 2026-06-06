"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, PhoneCall, TrendingUp, Shield, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

const INPUT_CLS = "w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 rounded-lg px-3.5 py-3 text-zinc-900 dark:text-zinc-100 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-colors font-sans-body";

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
      // error set in store
    }
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    clearError();
    try {
      await loginWithGoogle(accessToken);
      router.push("/dashboard");
    } catch {
      // error set in store
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark editorial */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-zinc-950 relative overflow-hidden"
        style={{ borderRight: "1px solid #27272a" }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        {/* Green radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22c55e]/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col h-full p-12">

          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <Image src="/logo.png" alt="Law Cube" width={30} height={30} className="rounded-md" />
            <span className="font-display font-semibold text-zinc-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <h2 className="font-display font-bold text-zinc-100 leading-tight mb-5" style={{ fontSize: "2.5rem" }}>
              Every call.<br />Every lead.<br />
              <span className="text-[#22c55e]">Every client.</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-sans-body">
              The AI-powered intelligence layer your firm needs to convert more leads and measure every marketing dollar.
            </p>

            <ul className="flex flex-col gap-5 mb-12">
              {[
                { icon: PhoneCall, text: "AI call transcription and lead scoring in under 4 minutes" },
                { icon: TrendingUp, text: "True cost-per-client attribution by campaign and keyword" },
                { icon: Shield, text: "SOC2 Type II compliant · HIPAA ready for legal data" },
              ].map((item, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <span className="text-zinc-500 text-sm leading-relaxed font-sans-body pt-1">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4 font-sans-body">
              &ldquo;Law Cube showed us exactly which campaigns were driving retained clients. We 2&times;&#39;d our marketing ROI within 60 days.&rdquo;
            </p>
            <div>
              <div className="text-zinc-200 text-sm font-semibold font-sans-body">James R. Mitchell</div>
              <div className="text-zinc-600 text-xs font-sans-body">Managing Partner · Mitchell &amp; Associates</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-zinc-950">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[380px]">

          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <Image src="/logo.png" alt="Law Cube" width={28} height={28} className="rounded-md" />
            <span className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h1>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-8 font-sans-body">Sign in to your Law Cube dashboard</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400 text-sm font-sans-body">{error}</p>
            </div>
          )}

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => useAuthStore.setState({ error: "Google sign-in failed" })}
              disabled={isLoading}
            />
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-sans-body">or continue with email</span>
            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@lawfirm.com" className={INPUT_CLS} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold font-sans-body uppercase tracking-wider">Password</label>
                <a href="#" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs font-sans-body transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={INPUT_CLS + " pr-11"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors duration-150 font-sans-body disabled:opacity-60 mt-1">
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <span className="flex items-center justify-center gap-2">Sign in <ArrowRight className="w-4 h-4" /></span>
              }
            </Button>
          </form>

          <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mt-6 font-sans-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-semibold transition-colors">Start free trial</Link>
          </p>
          <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mt-6 font-sans-body flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            Protected by SOC2 Type II · 256-bit encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
}
