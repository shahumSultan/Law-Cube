"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import { FloatingPaths } from "@/components/ui/background-paths";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  PhoneCall, Brain, TrendingUp, Zap, Link2, BarChart3,
  ArrowRight, Check, Star, Menu, X, ChevronRight,
  Shield, Sparkles, Clock, Target,
} from "lucide-react";

/* ─── Scroll progress bar ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div className="lc-progress" style={{ scaleX }} />;
}

/* ─── Scroll-reveal wrapper (fade + scale + translateY) ─── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
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

/* ─── Primary solid CTA button ─── */
function GradientButton({ href, children, className = "", dark = false }: { href: string; children: React.ReactNode; className?: string; dark?: boolean }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link href={href}
        className={`group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold font-sans-body transition-all duration-200 shadow-lg hover:shadow-xl ${
          dark
            ? "bg-white text-[#14532d] hover:bg-[#dcfce7]"
            : "bg-[#15803d] hover:bg-[#166534] text-white shadow-[#15803d]/30 hover:shadow-[#166534]/40"
        }`}>
        <span>{children}</span>
        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
      </Link>
    </motion.div>
  );
}

/* ─── Ghost outline button ─── */
function OutlineButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Link href={href}
        className="group flex items-center gap-2 px-6 py-4 rounded-2xl text-base font-medium font-sans-body border border-slate-200 dark:border-[#166534] text-slate-700 dark:text-slate-300 hover:border-[#22c55e] hover:text-[#15803d] dark:hover:text-[#4ade80] dark:hover:border-[#22c55e] bg-white/60 dark:bg-[#091a0f]/60 backdrop-blur-sm transition-all duration-200">
        <span>{children}</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </Link>
    </motion.div>
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
        ? "bg-white/95 dark:bg-[#091a0f]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Law Cube" width={32} height={32} className="rounded-lg shadow-md" />
          <span className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl tracking-tight">Law Cube</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[{ label: "Features", href: "#features" }, { label: "Integrations", href: "#integrations" }, { label: "Pricing", href: "#pricing" }].map(item => (
            <a key={item.label} href={item.href}
              className="nav-link-hover text-slate-600 dark:text-slate-400 hover:text-[#15803d] dark:hover:text-[#4ade80] text-sm font-medium transition-colors duration-200 font-sans-body">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login"
            className="nav-link-hover text-slate-600 dark:text-slate-400 hover:text-[#15803d] dark:hover:text-[#4ade80] text-sm font-medium px-4 py-2 transition-colors font-sans-body">
            Sign In
          </Link>
          <GradientButton href="/signup">Get Started Free</GradientButton>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button className="text-slate-600 dark:text-slate-400 w-9 h-9 flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-[#091a0f] border-t border-slate-100 dark:border-slate-700 px-6 py-4 flex flex-col gap-3 shadow-lg">
          {["Features", "Integrations", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
              className="text-slate-600 dark:text-slate-400 text-sm font-medium py-2 font-sans-body">{item}</a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 text-sm py-2 text-center font-medium font-sans-body">Sign In</Link>
            <Link href="/signup" className="bg-[#15803d] text-white text-sm font-semibold py-3 rounded-xl text-center font-sans-body">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden pt-20 pb-10">
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-[#22c55e]/30 bg-[#f0fdf4]/90 dark:bg-[#0d2a18]/80 backdrop-blur-sm rounded-full px-4 py-1.5 mb-10 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[#15803d] dark:text-[#4ade80] text-xs font-semibold tracking-widest uppercase font-sans-body">
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
            <OutlineButton href="/dashboard">View Live Demo</OutlineButton>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 font-sans-body">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["JM", "SK", "CD", "AR"].map((initials, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-[#15803d] border-2 border-white dark:border-[#030d06] flex items-center justify-center text-white text-[9px] font-bold">
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
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-[#030d06]/70 pointer-events-none z-10" />
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
            <div className="bg-[#F8FAFC] dark:bg-[#091a0f] p-4 flex gap-3" style={{ minHeight: 260 }}>
              <div className="w-36 bg-[#14532d] rounded-xl p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-5 h-5 rounded bg-[#166534] flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">LC</span>
                  </div>
                  <span className="text-green-100 text-[10px] font-semibold font-sans-body">Law Cube</span>
                </div>
                {["Dashboard", "Leads", "Calls", "Follow-Up", "Marketing"].map((item, i) => (
                  <div key={i} className={`px-2 py-1.5 rounded-md text-[9px] font-sans-body font-medium ${i === 0 ? "bg-[#22c55e]/15 text-[#22c55e]" : "text-green-200/50"}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", value: "1,284", trend: "+18%", color: "#15803d" },
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
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `rgba(21,128,61,${0.25 + h / 250})` }} />
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
    <section className="bg-[#14532d] py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <FloatingPaths position={0.3} />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <Reveal className="text-center mb-12">
          <p className="text-green-200/60 text-xs font-semibold uppercase tracking-widest font-sans-body">
            Trusted by 200+ law firms · Based on aggregated customer data after 90 days
          </p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {[
            { value: 68, suffix: "%", label: "Lead-to-consultation lift" },
            { value: 2847, suffix: "+", label: "Calls scored this month" },
            { value: 94, suffix: "%", label: "AI classification accuracy" },
            { value: 2, suffix: "×", label: "Marketing ROI improvement" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.08}
              className={`text-center px-8 py-4 ${i < 3 ? "border-r border-[#166534]" : ""} ${i >= 2 ? "lg:border-r-0" : ""}`}>
              <div className="font-display font-bold text-[#22c55e] mb-2" style={{ fontSize: "3.25rem", lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-green-200/70 text-sm leading-snug max-w-[160px] mx-auto font-sans-body">{s.label}</div>
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
    <section id="integrations" className="py-10 bg-slate-50/80 dark:bg-[#091a0f]/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
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
  { icon: PhoneCall, bg: "#f0fdf4", darkBg: "rgba(21,128,61,0.15)", iconColor: "#15803d", title: "Call Intelligence", desc: "Every inbound call is automatically transcribed, summarized, and scored by AI. Know the quality of every lead before your team reviews it." },
  { icon: Brain, bg: "#F5F3FF", darkBg: "rgba(91,33,182,0.15)", iconColor: "#5B21B6", title: "AI Lead Scoring", desc: "Leads scored 0–100 based on injury severity, case type, representation status, and jurisdiction match. Focus on your best opportunities." },
  { icon: Zap, bg: "#FFFBEB", darkBg: "rgba(180,83,9,0.15)", iconColor: "#B45309", title: "Follow-Up Automation", desc: "Missed a call? An automated SMS fires within 90 seconds. No consultation scheduled? A nurture sequence launches automatically." },
  { icon: TrendingUp, bg: "#F0FDF4", darkBg: "rgba(21,128,61,0.15)", iconColor: "#15803D", title: "Marketing Attribution", desc: "Connect Google Ads, Meta, and CallRail data to retained clients. See true cost-per-client for every campaign and keyword." },
  { icon: Link2, bg: "#dcfce7", darkBg: "rgba(21,128,61,0.15)", iconColor: "#166534", title: "Practice Management Sync", desc: "Bidirectional sync with Clio, NEOS, and MyCase. Retain a client in Law Cube and it appears in your practice management system instantly." },
  { icon: BarChart3, bg: "#FFFBEB", darkBg: "rgba(217,119,6,0.15)", iconColor: "#D97706", title: "AI Insights Engine", desc: "Nightly analysis surfaces recommendations — which campaigns to scale, which intake reps need coaching, where leads are slipping." },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-white/85 dark:bg-[#030d06]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <Reveal className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5 mb-6 font-sans-body">
            <Sparkles className="w-3.5 h-3.5 text-[#15803d] dark:text-green-400" />
            <span className="text-[#15803d] dark:text-green-400 text-xs font-semibold uppercase tracking-wider">Platform Features</span>
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
            <Reveal key={i} delay={i * 0.06}
              className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
              {i === 0 ? (
                /* Hero feature card — dark green */
                <div className="lc-feature-card bg-[#14532d] border border-[#166534] rounded-2xl p-7 h-full relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <FloatingPaths position={0.5} />
                  </div>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-[#166534] border border-[#22c55e]/20 flex items-center justify-center mb-5">
                      <f.icon className="w-5 h-5 text-[#22c55e]" />
                    </div>
                    <h3 className="font-display font-semibold text-white text-xl mb-2.5">{f.title}</h3>
                    <p className="text-green-200/70 text-sm leading-relaxed font-sans-body">{f.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-[#22c55e] text-xs font-semibold font-sans-body uppercase tracking-wider">
                      <span>Learn more</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lc-feature-card bg-white dark:bg-[#0d2a18] border border-slate-200 dark:border-[#166534] rounded-2xl p-7 h-full overflow-hidden">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                    <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 text-xl mb-2.5">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans-body">{f.desc}</p>
                </div>
              )}
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
    { n: "01", icon: PhoneCall, color: "#15803d", bg: "#f0fdf4", title: "Calls come in", desc: "CallRail captures every inbound call with tracking numbers, UTM data, and recordings. Everything flows into Law Cube automatically — zero manual entry." },
    { n: "02", icon: Brain, color: "#5B21B6", bg: "#F5F3FF", title: "AI analyzes instantly", desc: "Within 4 minutes, our AI transcribes the call, generates a summary, scores the lead 0–100, classifies the outcome, and detects sentiment." },
    { n: "03", icon: Target, color: "#D97706", bg: "#FFFBEB", title: "Your team closes", desc: "Intake specialists see scored, prioritized leads. Automated follow-ups fire for missed calls. The right leads reach the right attorneys at the right time." },
  ];

  return (
    <section className="py-28 px-6 bg-slate-50/80 dark:bg-[#091a0f]/90 backdrop-blur-sm">
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
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(33.33%+2rem)] right-[calc(33.33%+2rem)] h-px"
            style={{ background: "linear-gradient(90deg, #22c55e30, #22c55e60, #22c55e30)" }} />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="lc-feature-card bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm h-full relative overflow-hidden">
                {/* Decorative step number watermark */}
                <div className="absolute top-4 right-5 font-display font-bold text-[5rem] leading-none select-none pointer-events-none"
                  style={{ color: "rgba(34,197,94,0.06)" }}>
                  {s.n}
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <span className="font-display font-bold text-sm text-[#22c55e] tracking-widest uppercase">{s.n}</span>
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
    <section className="py-28 px-6 bg-white/85 dark:bg-[#030d06]/90 backdrop-blur-sm">
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
              <div className="lc-card-hover flex flex-col bg-slate-50 dark:bg-[#0d2a18] border border-slate-200 dark:border-[#166534] rounded-2xl p-8 h-full border-t-2 border-t-[#22c55e]">
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
                  <div className="w-9 h-9 rounded-full bg-[#15803d] flex items-center justify-center shrink-0">
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
    <section id="pricing" className="py-28 px-6 bg-slate-50/80 dark:bg-[#091a0f]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <h2 className="font-display font-bold text-5xl md:text-6xl text-slate-900 dark:text-slate-100 mb-5 leading-tight">Simple, transparent pricing</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-sans-body">14-day free trial. No credit card required. Cancel anytime.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className={`lc-card-hover relative rounded-2xl p-8 flex flex-col gap-6 h-full ${
                p.highlight
                  ? "bg-[#14532d] border-2 border-[#22c55e]/40 shadow-2xl shadow-green-900/30"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#22c55e] text-white text-xs font-bold px-4 py-1.5 rounded-full font-sans-body tracking-widest uppercase shadow-lg shadow-green-500/20">Most Popular</span>
                  </div>
                )}
                <div>
                  <h3 className={`font-display font-bold text-2xl mb-1 ${p.highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{p.name}</h3>
                  <p className={`text-sm font-sans-body ${p.highlight ? "text-green-200/60" : "text-slate-600 dark:text-slate-400"}`}>{p.desc}</p>
                </div>
                <div>
                  {p.price
                    ? <div className="flex items-end gap-1">
                        <span className={`font-display font-bold text-5xl ${p.highlight ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>${p.price}</span>
                        <span className={`text-sm mb-2 font-sans-body ${p.highlight ? "text-green-200/50" : "text-slate-500"}`}>/month</span>
                      </div>
                    : <div className="font-display font-bold text-4xl text-slate-900 dark:text-slate-100">Custom</div>
                  }
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-sans-body">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#22c55e]" : "text-[#15803d] dark:text-emerald-500"}`} />
                      <span className={p.highlight ? "text-green-100/80" : "text-slate-600 dark:text-slate-400"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.highlight
                  ? <GradientButton href={p.price ? "/signup" : "#"} dark>{p.cta}</GradientButton>
                  : <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                      <Link href={p.price ? "/signup" : "#"} className="block w-full text-center py-3.5 rounded-xl text-sm font-semibold font-sans-body bg-[#15803d] hover:bg-[#166534] text-white transition-colors shadow-lg shadow-green-900/20">{p.cta}</Link>
                    </motion.div>
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
    <section className="py-28 px-6 bg-white/85 dark:bg-[#030d06]/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden bg-[#14532d] p-16 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-[#22c55e]/30 bg-[#22c55e]/10 rounded-full px-4 py-1.5 mb-8 font-sans-body">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[#22c55e] text-xs font-semibold tracking-widest uppercase">Start Today</span>
              </div>
              <h2 className="font-display font-bold text-5xl md:text-6xl text-white mb-6 leading-tight">
                Ready to know which calls become clients?
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-sans-body">
                Join 200+ law firms using Law Cube to turn marketing spend into measurable retained revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton href="/signup" dark>Start 14-Day Free Trial</GradientButton>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="border border-[#22c55e]/30 hover:border-[#22c55e]/60 text-green-200 hover:text-white font-medium text-base px-8 py-4 rounded-2xl transition-colors font-sans-body">
                  Talk to Sales
                </motion.button>
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
    <footer className="bg-[#091a0f] border-t border-[#166534] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <Image src="/logo.png" alt="Law Cube" width={28} height={28} className="rounded-lg" />
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
        <div className="border-t border-[#166534] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
    <main className="min-h-screen bg-white dark:bg-[#030d06] relative">
      <ScrollProgress />

      {/* Fixed full-page background — stays in place as user scrolls */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10">
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
      </div>
    </main>
  );
}
