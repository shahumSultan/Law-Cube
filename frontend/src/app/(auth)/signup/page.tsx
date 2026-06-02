"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090d18] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-[#0f1624] border-r border-[#1e2d45] p-12 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#3b82f6]/30">
              <span className="font-display font-bold text-white">LC</span>
            </div>
            <span className="font-display font-semibold text-[#eef2ff] text-xl tracking-tight">Law Cube</span>
          </Link>

          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              <span className="text-[#10b981] text-xs font-medium">14-day free trial</span>
            </div>

            <h2 className="font-display font-bold text-3xl text-[#eef2ff] leading-tight mb-4 tracking-tight">
              Start converting more<br />leads in minutes.
            </h2>
            <p className="text-[#8899b4] text-sm leading-relaxed mb-10">
              Connect CallRail, configure your intake flow, and let AI do the heavy lifting. No setup fees, no contracts.
            </p>

            <ul className="flex flex-col gap-4">
              {[
                "Free 14-day trial — no credit card required",
                "Connect CallRail in under 5 minutes",
                "AI call summaries live on day one",
                "Cancel anytime, keep your data",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8899b4] text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/15 border border-[#10b981]/25 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#10b981]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 p-5 bg-[#141d2e] border border-[#1e2d45] rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["JM", "ST", "CD"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-[#3b82f6]/20 border-2 border-[#0f1624] flex items-center justify-center">
                    <span className="text-[#60a5fa] text-[9px] font-bold">{initials}</span>
                  </div>
                ))}
              </div>
              <span className="text-[#8899b4] text-xs">Joined this month</span>
            </div>
            <p className="text-[#4a5c78] text-xs">Join 200+ law firms already using Law Cube to grow their practice.</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">LC</span>
            </div>
            <span className="font-display font-semibold text-[#eef2ff] text-lg tracking-tight">Law Cube</span>
          </Link>

          <h1 className="font-display font-bold text-3xl text-[#eef2ff] mb-2 tracking-tight">Create your account</h1>
          <p className="text-[#8899b4] text-sm mb-8">Start your 14-day free trial today</p>

          <div className="flex flex-col gap-3 mb-6">
            {[
              { label: "Continue with Google",    icon: "G", bg: "#fff", text: "#1a1a1a" },
              { label: "Continue with Microsoft", icon: "M", bg: "#2563eb", text: "#fff" },
            ].map((btn, i) => (
              <button key={i}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-[#1e2d45] bg-[#0f1624] hover:bg-[#141d2e] hover:border-[#2a3f5f] transition-all text-[#eef2ff] text-sm font-medium">
                <div className="w-5 h-5 rounded flex items-center justify-center font-bold text-xs"
                  style={{ background: btn.bg, color: btn.text }}>{btn.icon}</div>
                {btn.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#1e2d45]" />
            <span className="text-[#4a5c78] text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-[#1e2d45]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">First name</label>
                <input type="text" required placeholder="James"
                  className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">Last name</label>
                <input type="text" required placeholder="Mitchell"
                  className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">Firm name</label>
              <input type="text" required placeholder="Mitchell & Associates"
                className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">Work email</label>
              <input type="email" required placeholder="james@mitchelllaw.com"
                className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[#8899b4] text-xs font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required placeholder="Min. 8 characters"
                  className="w-full bg-[#0f1624] border border-[#1e2d45] focus:border-[#3b82f6] rounded-xl px-4 py-3 text-[#eef2ff] text-sm placeholder:text-[#4a5c78] outline-none transition-colors pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5c78] hover:text-[#8899b4] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3b82f6]/20 mt-1">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>

            <p className="text-[#4a5c78] text-xs text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-[#60a5fa] hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-[#60a5fa] hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-[#4a5c78] text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#60a5fa] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
