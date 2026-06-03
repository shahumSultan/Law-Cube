"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { FloatingPaths } from "@/components/ui/background-paths";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  PhoneCall, Brain, TrendingUp, Zap, Link2, BarChart3,
  ArrowRight, Check, Star, Menu, X, ChevronRight,
  Shield, Sparkles, Clock, Target,
} from "lucide-react";

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Counter ─── */
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 50; const step = target / steps; let cur = 0;
        const t = setInterval(() => { cur += step; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, 1400 / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Letter-animated title ─── */
function AnimatedTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.3em] last:mr-0">
          {word.split("").map((letter, li) => (
            <motion.span key={`${wi}-${li}`}
              initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: wi * 0.08 + li * 0.028, type: "spring", stiffness: 160, damping: 26 }}
              className="inline-block">
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

/* ─── Gradient-border CTA button ─── */
function GradientButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-block group relative bg-gradient-to-b from-black/10 to-white/10 dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <Link href={href}>
        <Button variant="ghost"
          className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md
            bg-white/95 hover:bg-white/100 dark:bg-slate-900/95 dark:hover:bg-slate-900
            text-black dark:text-white transition-all duration-300
            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
            hover:shadow-md font-sans-body">
          <span className="opacity-90 group-hover:opacity-100 transition-opacity">{children}</span>
          <span className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">→</span>
        </Button>
      </Link>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] flex items-center justify-center shadow-md">
            <span className="font-display font-bold text-white text-sm">LC</span>
          </div>
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl tracking-tight">Law Cube</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[{ label: "Features", href: "#features" }, { label: "Integrations", href: "#integrations" }, { label: "Pricing", href: "#pricing" }].map(item => (
            <a key={item.label} href={item.href}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium transition-colors duration-200 font-sans-body">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium px-4 py-2 transition-colors font-sans-body">
            Sign In
          </Link>
          <GradientButton href="/signup">Get Started</GradientButton>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button className="text-slate-600 dark:text-slate-400 w-9 h-9 flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col gap-3 shadow-lg">
          {["Features", "Integrations", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
              className="text-slate-600 dark:text-slate-400 text-sm font-medium py-2 font-sans-body">{item}</a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 text-sm py-2 text-center font-medium font-sans-body">Sign In</Link>
            <Link href="/signup" className="bg-[#1E3A8A] text-white text-sm font-semibold py-3 rounded-xl text-center font-sans-body">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950 pt-20 pb-10">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-10 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold tracking-widest uppercase font-sans-body">
              AI-Powered Legal Intake Platform
            </span>
          </motion.div>

          <AnimatedTitle
            text="Turn Every Call Into a Client"
            className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter leading-[1.0] font-display text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80"
          />

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-sans-body">
            Connect every marketing dollar to retained clients. AI-powered call intelligence,
            lead scoring, and attribution — all in one platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <GradientButton href="/signup">Start Free Trial</GradientButton>
            <Link href="/dashboard"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium text-base px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-sans-body">
              View Live Demo <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 font-sans-body">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["JM", "SK", "CD", "AR"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-[#1E3A8A] border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-[9px] font-bold">
                    {initials}
                  </div>
                ))}
              </div>
              {/* FIX: was #94A3B8 on white → fails. Now slate-500 */}
              <span className="text-slate-500 dark:text-slate-400 text-sm">200+ law firms</span>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />)}
              <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">4.9 / 5 rating</span>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              SOC2 · HIPAA Ready
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 sm:mt-20 w-full max-w-6xl mx-auto hidden sm:block">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-slate-950/60 pointer-events-none z-10" />
            <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                <div className="flex-1 mx-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-400 text-xs px-3 py-1 text-center font-sans-body shadow-sm">
                  app.lawcube.io/dashboard
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] dark:bg-slate-900 p-4 flex gap-3" style={{ minHeight: 260 }}>
              <div className="w-36 bg-[#0A1628] rounded-xl p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded bg-[#1E3A8A] flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">LC</span>
                  </div>
                  <span className="text-slate-300 text-[10px] font-semibold font-sans-body">Law Cube</span>
                </div>
                {["Dashboard", "Leads", "Calls", "Follow-Up", "Marketing"].map((item, i) => (
                  <div key={i} className={`px-2 py-1.5 rounded-md text-[9px] font-sans-body font-medium ${i === 0 ? "bg-[#D97706]/15 text-[#D97706]" : "text-slate-500"}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", value: "1,284", trend: "+18%", color: "#1E3A8A" },
                    { label: "Qualified", value: "847", trend: "+12%", color: "#059669" },
                    { label: "Consultations", value: "412", trend: "+9%", color: "#D97706" },
                    { label: "Retained", value: "203", trend: "+23%", color: "#6D28D9" },
                  ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="text-slate-500 dark:text-slate-400 text-[8px] font-sans-body mb-1">{card.label}</div>
                      <div className="font-display font-bold text-base text-slate-900 dark:text-slate-100">{card.value}</div>
                      <div className="text-[8px] font-sans-body font-semibold mt-0.5" style={{ color: card.color }}>{card.trend} ↑</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-[8px] font-sans-body mb-2">Leads Over Time</div>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `rgba(30,58,138,${0.25 + h / 250})` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-slate-500 dark:text-slate-400 text-[8px] font-sans-body mb-2">AI Insights</div>
                    {[
                      { color: "#059669", text: "Google Ads outperforming" },
                      { color: "#D97706", text: "3 leads need follow-up" },
                      { color: "#DC2626", text: "Missed calls spike" },
                    ].map((ins, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-0.5 shrink-0" style={{ background: ins.color }} />
                        <span className="text-[7px] font-sans-body text-slate-500 dark:text-slate-400 leading-tight">{ins.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Stats strip ─── */
function StatsStrip() {
  return (
    <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700 py-14 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-12">
          {/* FIX: was #94A3B8 on white → slate-500 */}
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest font-sans-body">
            Trusted by 200+ law firms · Based on aggregated customer data after 90 days
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
          {[
            { value: 68, suffix: "%", label: "Average lift in lead-to-consultation conversion", color: "#059669" },
            { value: 2847, suffix: "+", label: "Calls analyzed and scored this month", color: "#1E3A8A" },
            { value: 94, suffix: "%", label: "Accuracy on AI lead classification", color: "#D97706" },
            { value: 2, suffix: "×", label: "Average marketing ROI improvement in year one", color: "#6D28D9" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1} className="text-center px-8">
              <div className="font-display font-bold mb-2" style={{ fontSize: "3.5rem", lineHeight: 1, color: s.color }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-sm leading-snug max-w-[180px] mx-auto font-sans-body">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Integrations bar ─── */
function IntegrationsBar() {
  return (
    <section id="integrations" className="py-10 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          {/* FIX: was #94A3B8 on slate-50 → slate-500 */}
          <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6 font-sans-body">
            Integrates with the tools your firm already uses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {["CallRail", "Clio", "Calendly", "Google Ads", "Meta Ads", "NEOS", "MyCase", "Filevine"].map(name => (
              /* FIX: was #CBD5E1 on light bg (1.8:1) → slate-400 */
              <span key={name} className="font-sans-body font-semibold text-slate-400 dark:text-slate-500 text-sm tracking-wide hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-default select-none">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const FEATURES = [
  { icon: PhoneCall, bg: "#EFF6FF", darkBg: "rgba(30,58,138,0.15)", iconColor: "#1E3A8A", title: "Call Intelligence", desc: "Every inbound call is automatically transcribed, summarized, and scored by AI. Know the quality of every lead before your team reviews it." },
  { icon: Brain, bg: "#F5F3FF", darkBg: "rgba(91,33,182,0.15)", iconColor: "#5B21B6", title: "AI Lead Scoring", desc: "Leads scored 0–100 based on injury severity, case type, representation status, and jurisdiction match. Focus on your best opportunities." },
  { icon: Zap, bg: "#FFFBEB", darkBg: "rgba(180,83,9,0.15)", iconColor: "#B45309", title: "Follow-Up Automation", desc: "Missed a call? An automated SMS fires within 90 seconds. No consultation scheduled? A nurture sequence launches automatically." },
  { icon: TrendingUp, bg: "#F0FDF4", darkBg: "rgba(21,128,61,0.15)", iconColor: "#15803D", title: "Marketing Attribution", desc: "Connect Google Ads, Meta, and CallRail data to retained clients. See true cost-per-client for every campaign and keyword." },
  { icon: Link2, bg: "#EFF6FF", darkBg: "rgba(29,78,216,0.15)", iconColor: "#1D4ED8", title: "Practice Management Sync", desc: "Bidirectional sync with Clio, NEOS, and MyCase. Retain a client in Law Cube and it appears in your practice management system instantly." },
  { icon: BarChart3, bg: "#FFFBEB", darkBg: "rgba(217,119,6,0.15)", iconColor: "#D97706", title: "AI Insights Engine", desc: "Nightly analysis surfaces recommendations — which campaigns to scale, which intake reps need coaching, where leads are slipping." },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <Reveal className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-6 font-sans-body">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
            <span className="text-[#1E3A8A] dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">Platform Features</span>
          </div>
          <h2 className="font-display font-bold text-5xl md:text-6xl text-slate-900 dark:text-slate-100 leading-tight mb-5">
            Everything your firm needs to convert more clients
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-sans-body">
            One platform replaces five disconnected tools — and connects the dots your team never could manually.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-7 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-300 h-full">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                  <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl mb-2.5">{f.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans-body">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorks() {
  const steps = [
    { n: "01", icon: PhoneCall, color: "#1E3A8A", bg: "#EFF6FF", title: "Calls come in", desc: "CallRail captures every inbound call with tracking numbers, UTM data, and recordings. Everything flows into Law Cube automatically — zero manual entry." },
    { n: "02", icon: Brain, color: "#5B21B6", bg: "#F5F3FF", title: "AI analyzes instantly", desc: "Within 4 minutes, our AI transcribes the call, generates a summary, scores the lead 0–100, classifies the outcome, and detects sentiment." },
    { n: "03", icon: Target, color: "#D97706", bg: "#FFFBEB", title: "Your team closes", desc: "Intake specialists see scored, prioritized leads. Automated follow-ups fire for missed calls. The right leads reach the right attorneys at the right time." },
  ];

  return (
    <section className="py-28 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-slate-900 dark:text-slate-100 mb-5 leading-tight">
            From first ring to retained client
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-lg mx-auto font-sans-body">
            Fully automated, fully visible. No more guessing what happened to that call.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-14 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-blue-800/20 via-amber-600/30 to-amber-600/20" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <span className="font-display font-bold text-4xl text-slate-200 dark:text-slate-700">{s.n}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-2xl mb-3">{s.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans-body">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { quote: "We were flying blind on marketing spend. Law Cube showed us our Google Ads was generating 3× more retained clients than Meta at half the cost. We reallocated within a week.", name: "James R. Mitchell", title: "Managing Partner", firm: "Mitchell & Associates", stars: 5, metric: "3× more clients from Google Ads" },
  { quote: "The AI call summaries alone saved our intake team 15 hours a week. Every call is scored before anyone even picks up the lead. It's like having a senior intake manager reviewing everything.", name: "Sarah K. Thornton", title: "Intake Director", firm: "Thornton Law Group", stars: 5, metric: "15 hrs/week saved on call review" },
  { quote: "We went from a 22% lead-to-consultation rate to 38% in just 60 days. The automated follow-up sequences capture the leads we used to lose to voicemail.", name: "Carlos M. Delgado", title: "Founder", firm: "Delgado Personal Injury", stars: 5, metric: "22% → 38% conversion in 60 days" },
];

function Testimonials() {
  return (
    <section className="py-28 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="flex justify-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 fill-[#D97706] text-[#D97706]" />)}
          </div>
          <h2 className="font-display font-bold text-5xl md:text-6xl text-slate-900 dark:text-slate-100 mb-5 leading-tight">
            Trusted by firms that take growth seriously
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-300 h-full">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />)}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 text-xs font-semibold font-sans-body mb-5 self-start">
                  <TrendingUp className="w-3 h-3" /> {t.metric}
                </div>
                <blockquote className="font-display text-lg text-slate-700 dark:text-slate-300 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                  <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold font-sans-body">{t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm font-sans-body">{t.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs font-sans-body">{t.title} · {t.firm}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
const PLANS = [
  { name: "Starter", price: 299, highlight: false, cta: "Start Free Trial", desc: "For solo practitioners and small firms getting started.", features: ["Up to 200 leads/month", "CallRail integration", "AI call summaries + scoring", "SMS follow-up automation", "Lead management CRM", "1 user"] },
  { name: "Growth", price: 699, highlight: true, cta: "Start Free Trial", desc: "For growing firms ready to scale intake and attribution.", features: ["Up to 1,000 leads/month", "All Starter features", "Clio + Calendly integration", "Full marketing attribution", "5 users", "AI Insights Engine", "Priority support"] },
  { name: "Enterprise", price: null, highlight: false, cta: "Contact Sales", desc: "For large firms and multi-location practices.", features: ["Unlimited leads", "All Growth features", "NEOS + MyCase + Filevine", "Custom integrations + API", "Unlimited users", "Dedicated success manager", "SSO + SOC2 compliance"] },
];

function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-slate-900 dark:text-slate-100 mb-5 leading-tight">Simple, transparent pricing</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-sans-body">14-day free trial. No credit card required. Cancel anytime.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className={`relative rounded-2xl p-8 flex flex-col gap-6 transition-all h-full ${
                p.highlight
                  ? "bg-[#0A1628] border-2 border-[#D97706]/50 shadow-xl shadow-blue-900/20"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#D97706] text-white text-xs font-bold px-4 py-1.5 rounded-full font-sans-body tracking-wide">Most Popular</span>
                  </div>
                )}
                <div>
                  <h3 className={`font-display font-bold text-2xl mb-1 ${p.highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{p.name}</h3>
                  <p className={`text-sm font-sans-body ${p.highlight ? "text-slate-400" : "text-slate-600 dark:text-slate-400"}`}>{p.desc}</p>
                </div>
                <div>
                  {p.price
                    ? <div className="flex items-end gap-1"><span className={`font-display font-bold text-5xl ${p.highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>${p.price}</span><span className={`text-sm mb-2 font-sans-body ${p.highlight ? "text-slate-500" : "text-slate-500 dark:text-slate-500"}`}>/month</span></div>
                    : <div className="font-display font-bold text-4xl text-slate-900 dark:text-slate-100">Custom</div>
                  }
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-sans-body">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#D97706]" : "text-emerald-600 dark:text-emerald-500"}`} />
                      <span className={p.highlight ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.highlight
                  ? <GradientButton href={p.price ? "/signup" : "#"}>{p.cta}</GradientButton>
                  : <Link href={p.price ? "/signup" : "#"} className="w-full text-center py-3.5 rounded-xl text-sm font-semibold font-sans-body transition-all bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white">{p.cta}</Link>
                }
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500 dark:text-slate-400 text-sm font-sans-body">
          {[{ icon: Shield, text: "SOC2 Type II" }, { icon: Clock, text: "14-day free trial" }, { icon: Check, text: "No credit card required" }, { icon: Target, text: "Cancel anytime" }].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <item.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              {item.text}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-28 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden bg-[#0A1628] p-16 text-center">
            <div className="absolute inset-0 opacity-30">
              <FloatingPaths position={1} />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[#D97706]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-[#D97706]/30 bg-[#D97706]/10 rounded-full px-4 py-1.5 mb-8 font-sans-body">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                <span className="text-[#F59E0B] text-xs font-semibold tracking-widest uppercase">Start Today</span>
              </div>
              <h2 className="font-display font-bold text-5xl md:text-6xl text-white mb-6 leading-tight">
                Ready to know which calls become clients?
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-sans-body">
                Join 200+ law firms using Law Cube to turn marketing spend into measurable retained revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton href="/signup">Start 14-Day Free Trial</GradientButton>
                <button className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-base px-8 py-4 rounded-xl transition-all font-sans-body">
                  Talk to Sales
                </button>
              </div>
              {/* FIX: was #475569 on dark bg → slate-400 */}
              <p className="text-slate-500 text-sm mt-6 font-sans-body">14-day free trial · No credit card required · Cancel anytime</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[#0A1628] border-t border-[#162640] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
                <span className="font-display font-bold text-white text-xs">LC</span>
              </div>
              <span className="font-display font-semibold text-white tracking-tight text-lg">Law Cube</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-sans-body">
              AI-powered intake, lead conversion, and marketing intelligence for law firms that take growth seriously.
            </p>
            <div className="flex items-center gap-2 mt-5 text-slate-500 text-xs font-sans-body">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> SOC2 Type II · HIPAA Ready
            </div>
          </div>
          {[
            { heading: "Product", links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"] },
            { heading: "Integrations", links: ["CallRail", "Clio", "Calendly", "Google Ads", "Meta Ads"] },
            { heading: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
          ].map(col => (
            <div key={col.heading}>
              {/* FIX: heading was #CBD5E1 which is fine on dark, keeping */}
              <h4 className="font-sans-body font-semibold text-slate-300 text-sm mb-4 uppercase tracking-wider">{col.heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {/* FIX: was #475569 on #0A1628 → slate-500 (passes) */}
                {col.links.map(l => <li key={l}><a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors font-sans-body">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#162640] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* FIX: was #334155 on dark bg → slate-500 */}
          <p className="text-slate-500 text-xs font-sans-body">© 2025 Enigma Cube LLC. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map(l => <a key={l} href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors font-sans-body">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <Hero />
      <StatsStrip />
      <IntegrationsBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
