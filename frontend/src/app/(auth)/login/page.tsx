"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, PhoneCall, Brain, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090d18] flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex flex-col w-[520px] shrink-0 bg-[#0f1624] border-r border-[#1e2d45] p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#3b82f6]/8 to-transparent" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
              <span className="font-display font-bold text-white">LC</span>
            </div>
            <span className="font-display font-semibold text-[#eef2ff] text-xl tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <h2 className="font-display font-bold text-4xl text-[#eef2ff] leading-tight mb-4 tracking-tight">
              Every call. Every lead.<br />
              <span className="text-gradient-blue">Every client.</span>
            </h2>
            <p className="text-[#8899b4] text-base leading-relaxed mb-12">
              The intelligence layer your law firm needs to convert more leads and measure every marketing dollar.
            </p>

            <ul className="flex flex-col gap-5">
              {[
                { icon: PhoneCall, color: "#3b82f6", text: "AI-powered call analysis & lead scoring" },
                { icon: Brain,     color: "#8b5cf6", text: "Automated follow-up that recovers missed leads" },
                { icon: TrendingUp,color: "#10b981", text: "Connect marketing spend to retained clients" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                    <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <span className="text-[#8899b4] text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <div className="bg-[#141d2e] border border-[#1e2d45] rounded-2xl p-6 mt-8">
            <p className="text-[#8899b4] text-sm leading-relaxed italic mb-4">
              &ldquo;Law Cube showed us exactly which campaigns were driving retained clients. We 2×&apos;d our marketing ROI within 60 days.&rdquo;
            </p>
            <div>
              <div className="text-[#eef2ff] text-sm font-semibold font-display">James R. Mitchell</div>
              <div className="text-[#4a5c78] text-xs">Managing Partner, Mitchell & Associates</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">LC</span>
            </div>
            <span className="font-display font-semibold text-[#eef2ff] text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-[#eef2ff] mb-2 tracking-tight">Welcome back</h1>
          <p className="text-[#8899b4] text-sm mb-8">Sign in to your Law Cube dashboard</p>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            {[
              { label: "Continue with Google",    icon: "G", bg: "#fff",     text: "#1a1a1a" },
              { label: "Continue with Microsoft", icon: "M", bg: "#2563eb",  text: "#fff" },
            ].map((btn, i) => (
              <button key={i}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#1e2d45] bg-[#0f1624] hover:bg-[#141d2e] hover:border-[#2a3f5f] transition-all text-[#eef2ff] text-sm font-medium">
                <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                  style={{ background: btn.bg, color: btn.text }}>
                  {btn.icon}
                </div>
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#1e2d45]" />
            <span className="text-[#4a5c78] text-xs">or sign in with email</span>
            <div className="flex-1 h-px bg-[#1e2d45]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">Email address</label>
              <input type="email" required placeholder="you@lawfirm.com"
                className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#8899b4] text-xs font-medium">Password</label>
                <a href="#" className="text-[#60a5fa] text-xs hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required placeholder="••••••••"
                  className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5c78] hover:text-[#8899b4] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3b82f6]/20 mt-1">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[#4a5c78] text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#60a5fa] hover:underline font-medium">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
