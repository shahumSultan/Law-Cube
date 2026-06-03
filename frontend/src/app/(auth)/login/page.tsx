"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, PhoneCall, TrendingUp, Shield, Star } from "lucide-react";
import { FloatingPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 900);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel — dark navy with floating paths ── */}
      <div className="hidden lg:flex flex-col w-[520px] shrink-0 bg-[#0A1628] relative overflow-hidden"
        style={{ borderRight: "1px solid #162640" }}>
        {/* FloatingPaths as background — dark context so paths render white */}
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
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center shadow-lg">
              <span className="font-display font-bold text-white">LC</span>
            </div>
            <span className="font-display font-semibold text-white text-xl tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <h2 className="font-display font-bold text-white leading-tight mb-5" style={{ fontSize: "2.75rem" }}>
              Every call.<br />Every lead.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Every client.</span>
            </h2>
            <p className="text-[#64748B] text-base leading-relaxed mb-10 font-sans-body">
              The AI-powered intelligence layer your firm needs to convert more leads and measure every marketing dollar.
            </p>

            <ul className="flex flex-col gap-4 mb-12">
              {[
                { icon: PhoneCall, color: "#1E3A8A", bg: "#162640", text: "AI call transcription and lead scoring in under 4 minutes" },
                { icon: TrendingUp, color: "#D97706", bg: "#1A1500", text: "True cost-per-client attribution by campaign and keyword" },
                { icon: Shield, color: "#059669", bg: "#0A1E18", text: "SOC2 Type II compliant · HIPAA ready for legal data" },
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.bg, border: `1px solid ${item.color}20` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <span className="text-[#94A3B8] text-sm leading-relaxed font-sans-body pt-1.5">{item.text}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="bg-[#0F1E35] rounded-2xl p-6"
            style={{ border: "1px solid #162640" }}
          >
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />)}
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed italic mb-4 font-display text-base">
              &ldquo;Law Cube showed us exactly which campaigns were driving retained clients. We 2&times;&apos;d our marketing ROI within 60 days.&rdquo;
            </p>
            <div>
              <div className="text-slate-200 text-sm font-semibold font-sans-body">James R. Mitchell</div>
              <div className="text-slate-500 text-xs font-sans-body">Managing Partner · Mitchell &amp; Associates</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right form panel — white ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative overflow-hidden">
        {/* Subtle paths in form panel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <FloatingPaths position={0.3} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-[400px]"
        >
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow">
              <span className="font-display font-bold text-white text-sm">LC</span>
            </div>
            <span className="font-display font-semibold text-[#0F172A] text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-4xl text-[#0F172A] mb-1.5">Welcome back</h1>
          <p className="text-[#64748B] text-sm mb-8 font-sans-body">Sign in to your Law Cube dashboard</p>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5 mb-6">
            {[
              { label: "Continue with Google", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { label: "Continue with Microsoft", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg> },
            ].map((btn, i) => (
              <button key={i} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-[#0F172A] text-sm font-medium font-sans-body shadow-sm">
                {btn.icon}{btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[#94A3B8] text-xs font-sans-body">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[#475569] text-xs font-semibold mb-1.5 block font-sans-body uppercase tracking-wider">Email address</label>
              <input type="email" required placeholder="you@lawfirm.com"
                className="w-full bg-white border border-slate-200 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#CBD5E1] outline-none transition-colors shadow-sm font-sans-body" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#475569] text-xs font-semibold font-sans-body uppercase tracking-wider">Password</label>
                <a href="#" className="text-[#1E3A8A] text-xs hover:text-[#1D4ED8] font-semibold font-sans-body transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-[#1E3A8A] rounded-xl px-4 py-3 text-[#0F172A] text-sm placeholder:text-[#CBD5E1] outline-none transition-colors pr-11 shadow-sm font-sans-body" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Gradient-border submit — BackgroundPaths style */}
            <div className="inline-block w-full group relative bg-gradient-to-b from-black/10 to-white/10 p-px rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mt-1">
              <Button
                type="submit"
                disabled={loading}
                variant="ghost"
                className="w-full rounded-[1.15rem] py-6 text-base font-semibold backdrop-blur-md
                  bg-[#1E3A8A]/95 hover:bg-[#1D4ED8] text-white transition-all duration-300
                  group-hover:-translate-y-0.5 border border-white/10 hover:shadow-md font-sans-body"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span className="opacity-90 group-hover:opacity-100">Sign In</span><span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300"><ArrowRight className="w-4 h-4 inline" /></span></>
                }
              </Button>
            </div>
          </form>

          <p className="text-center text-[#64748B] text-sm mt-6 font-sans-body">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#1E3A8A] hover:text-[#1D4ED8] font-semibold transition-colors">Start free trial</Link>
          </p>
          <p className="text-center text-[#CBD5E1] text-xs mt-8 font-sans-body">Protected by SOC2 Type II · 256-bit encryption</p>
        </motion.div>
      </div>
    </div>
  );
}
