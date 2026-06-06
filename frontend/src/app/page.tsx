"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  PhoneCall, Brain, TrendingUp, Zap, Link2, BarChart3,
  ArrowRight, Check, Star, Menu, X, ChevronRight,
  Shield, Clock, Target,
} from "lucide-react";

/* ─── Scroll progress ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div className="lc-progress" style={{ scaleX }} />;
}

/* ─── Scroll reveal ─── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const steps = 50;
        const step = target / steps;
        let cur = 0;
        const t = setInterval(() => {
          cur += step;
          if (cur >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 1200 / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Letter-animated headline ─── */
function AnimatedTitle({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block mr-[0.25em] last:mr-0">
          {word.split("").map((letter, li) => (
            <motion.span key={`${wi}-${li}`}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: wi * 0.07 + li * 0.025, type: "spring", stiffness: 180, damping: 28 }}
              className="inline-block">
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

/* ─── Primary CTA button ─── */
function PrimaryButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={`inline-block ${className}`}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}>
      <Link href={href}
        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold font-sans-body transition-colors duration-150 shadow-md shadow-green-900/20">
        {children}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
      </Link>
    </motion.div>
  );
}

/* ─── Ghost button ─── */
function GhostButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={`inline-block ${className}`}
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}>
      <Link href={href}
        className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-medium font-sans-body text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 transition-all duration-150">
        {children}
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
      </Link>
    </motion.div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Law Cube" width={28} height={28} className="rounded-md" />
          <span className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-lg tracking-tight">Law Cube</span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          {[{ label: "Features", href: "#features" }, { label: "Integrations", href: "#integrations" }, { label: "Pricing", href: "#pricing" }].map(item => (
            <a key={item.label} href={item.href}
              className="nav-link-hover text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-sm font-medium transition-colors duration-150 font-sans-body">
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login"
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-sm font-medium px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150 font-sans-body">
            Sign in
          </Link>
          <Link href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold font-sans-body transition-colors duration-150">
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 px-6 py-5 flex flex-col gap-1">
            {["Features", "Integrations", "Pricing"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                className="text-zinc-600 dark:text-zinc-400 text-sm font-medium py-2.5 font-sans-body hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">{item}</a>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
              <Link href="/login" className="text-zinc-600 dark:text-zinc-400 text-sm py-2 text-center font-medium font-sans-body">Sign in</Link>
              <Link href="/signup" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold py-3 rounded-md text-center font-sans-body">Get started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-white dark:bg-[#09090b]">
      {/* Subtle radial glow — green accent, very muted */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#22c55e]/5 dark:bg-[#22c55e]/[0.07] rounded-full blur-[120px]" />
      </div>

      {/* Fine grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.15]"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-full px-4 py-1.5 mb-10 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          <span className="text-zinc-500 dark:text-zinc-400 text-xs font-medium tracking-wide font-sans-body">
            AI-Powered Legal Intake Platform
          </span>
        </motion.div>

        <AnimatedTitle
          text="Turn every call into a client"
          className="font-display font-bold text-[3.25rem] sm:text-[4.5rem] md:text-[5.5rem] leading-[1.0] tracking-tight text-zinc-900 dark:text-white mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-sans-body">
          Connect every marketing dollar to retained clients. AI call intelligence, lead scoring, and attribution — built for law firms.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <PrimaryButton href="/signup">Start free trial</PrimaryButton>
          <GhostButton href="/dashboard">View live demo</GhostButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-sm text-zinc-400 font-sans-body">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["JM", "SK", "CD", "AR"].map((initials, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 dark:bg-zinc-700 border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                  <span className="text-zinc-100 text-[8px] font-bold">{initials}</span>
                </div>
              ))}
            </div>
            <span>200+ law firms</span>
          </div>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            <span className="ml-1">4.9 / 5 rating</span>
          </div>
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            SOC2 · HIPAA Ready
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-5xl mx-auto hidden sm:block">
          <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-900/10 dark:shadow-black/50">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70 dark:to-[#09090b]/80 pointer-events-none z-10" />
            {/* Browser chrome */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="flex-1 mx-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-400 text-xs px-3 py-1 text-center font-sans-body">
                  app.lawcube.io/dashboard
                </div>
              </div>
            </div>
            {/* App chrome */}
            <div className="bg-zinc-50 dark:bg-[#09090b] p-3 flex gap-3" style={{ minHeight: 240 }}>
              {/* Sidebar */}
              <div className="w-32 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5 flex flex-col gap-0.5 shrink-0">
                <div className="flex items-center gap-1.5 mb-3 px-1.5">
                  <div className="w-4 h-4 rounded bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center">
                    <span className="text-white text-[6px] font-bold">LC</span>
                  </div>
                  <span className="text-zinc-700 dark:text-zinc-300 text-[9px] font-semibold font-sans-body">Law Cube</span>
                </div>
                {["Dashboard", "Leads", "Calls", "Follow-Up", "Marketing"].map((item, i) => (
                  <div key={i} className={`px-2 py-1.5 rounded text-[8px] font-sans-body font-medium flex items-center gap-1.5 ${
                    i === 0
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-400 dark:text-zinc-600"
                  }`}>
                    {i === 0 && <div className="w-0.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />}
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col gap-2.5">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", value: "1,284", trend: "+18%", color: "#22c55e" },
                    { label: "Qualified", value: "847", trend: "+12%", color: "#22c55e" },
                    { label: "Consultations", value: "412", trend: "+9%", color: "#D97706" },
                    { label: "Retained", value: "203", trend: "+23%", color: "#22c55e" },
                  ].map((card, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5">
                      <div className="text-zinc-400 text-[7px] font-sans-body mb-1">{card.label}</div>
                      <div className="font-display font-bold text-sm text-zinc-900 dark:text-zinc-100">{card.value}</div>
                      <div className="text-[7px] font-sans-body font-semibold mt-0.5" style={{ color: card.color }}>{card.trend} ↑</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <div className="col-span-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5">
                    <div className="text-zinc-400 text-[7px] font-sans-body mb-2">Leads Over Time</div>
                    <div className="flex items-end gap-0.5 h-14">
                      {[40, 55, 45, 70, 55, 80, 65, 85, 60, 90, 72, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-zinc-100 dark:bg-zinc-800" style={{ height: `${h}%` }}>
                          <div className="w-full rounded-sm" style={{ height: `${h * 0.6}%`, background: "#22c55e", opacity: 0.7 + h / 500 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5">
                    <div className="text-zinc-400 text-[7px] font-sans-body mb-2">AI Insights</div>
                    {[
                      { dot: "#22c55e", text: "Google Ads outperforming" },
                      { dot: "#D97706", text: "3 leads need follow-up" },
                      { dot: "#EF4444", text: "Missed calls spike" },
                    ].map((ins, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-0.5 shrink-0" style={{ background: ins.dot }} />
                        <span className="text-[7px] font-sans-body text-zinc-400 dark:text-zinc-500 leading-tight">{ins.text}</span>
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
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-10">
          <p className="text-zinc-400 dark:text-zinc-600 text-xs font-semibold uppercase tracking-[0.12em] font-sans-body">
            Trusted by 200+ law firms · Based on aggregated data after 90 days
          </p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800">
          {[
            { value: 68, suffix: "%", label: "Lead-to-consultation lift" },
            { value: 2847, suffix: "+", label: "Calls scored this month" },
            { value: 94, suffix: "%", label: "AI classification accuracy" },
            { value: 2,  suffix: "×", label: "Marketing ROI improvement" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.08} className="text-center px-6 py-4">
              <div className="font-display font-bold text-[#22c55e] mb-1.5" style={{ fontSize: "3rem", lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-zinc-400 dark:text-zinc-500 text-sm max-w-[140px] mx-auto font-sans-body leading-snug">{s.label}</div>
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
    <section id="integrations" className="py-10 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal>
          <p className="text-center text-zinc-400 dark:text-zinc-600 text-xs font-semibold uppercase tracking-[0.12em] mb-6 font-sans-body">
            Integrates with the tools your firm already uses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3">
            {["CallRail", "Clio", "Calendly", "Google Ads", "Meta Ads", "NEOS", "MyCase", "Filevine"].map(name => (
              <span key={name} className="font-sans-body font-semibold text-zinc-400 dark:text-zinc-600 text-sm tracking-wide hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-default select-none">
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
  { icon: PhoneCall, iconColor: "#22c55e", iconBg: "rgba(34,197,94,0.08)", title: "Call Intelligence", desc: "Every inbound call is automatically transcribed, summarized, and scored by AI. Know the quality of every lead before your team reviews it." },
  { icon: Brain, iconColor: "#8b5cf6", iconBg: "rgba(139,92,246,0.08)", title: "AI Lead Scoring", desc: "Leads scored 0–100 based on injury severity, case type, representation status, and jurisdiction match. Focus on your best opportunities." },
  { icon: Zap, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.08)", title: "Follow-Up Automation", desc: "Missed a call? An automated SMS fires within 90 seconds. No consultation scheduled? A nurture sequence launches automatically." },
  { icon: TrendingUp, iconColor: "#22c55e", iconBg: "rgba(34,197,94,0.08)", title: "Marketing Attribution", desc: "Connect Google Ads, Meta, and CallRail data to retained clients. See true cost-per-client for every campaign and keyword." },
  { icon: Link2, iconColor: "#3b82f6", iconBg: "rgba(59,130,246,0.08)", title: "Practice Management Sync", desc: "Bidirectional sync with Clio, NEOS, and MyCase. Retain a client in Law Cube and it appears in your practice management system instantly." },
  { icon: BarChart3, iconColor: "#f59e0b", iconBg: "rgba(245,158,11,0.08)", title: "AI Insights Engine", desc: "Nightly analysis surfaces recommendations — which campaigns to scale, which intake reps need coaching, where leads are slipping." },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-white dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <Reveal className="max-w-2xl mb-16">
          <span className="inline-block text-[#22c55e] text-xs font-semibold uppercase tracking-[0.14em] font-sans-body mb-4">Platform</span>
          <h2 className="font-display font-bold text-[2.75rem] md:text-[3.5rem] text-zinc-900 dark:text-zinc-100 leading-tight mb-4">
            Everything your firm needs to convert more clients
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed font-sans-body">
            One platform replaces five disconnected tools — and connects the dots your team never could manually.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="lc-feature-card bg-white dark:bg-zinc-950 p-7 h-full group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: f.iconBg }}>
                  <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
                </div>
                <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-xl mb-2.5">{f.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-sans-body">{f.desc}</p>
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
    { n: "01", icon: PhoneCall, color: "#22c55e", title: "Calls come in", desc: "CallRail captures every inbound call with tracking numbers, UTM data, and recordings. Everything flows into Law Cube automatically — zero manual entry." },
    { n: "02", icon: Brain, color: "#8b5cf6", title: "AI analyzes instantly", desc: "Within 4 minutes, our AI transcribes the call, generates a summary, scores the lead 0–100, classifies the outcome, and detects sentiment." },
    { n: "03", icon: Target, color: "#f59e0b", title: "Your team closes", desc: "Intake specialists see scored, prioritized leads. Automated follow-ups fire for missed calls. The right leads reach the right attorneys at the right time." },
  ];

  return (
    <section className="py-28 px-6 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-block text-[#22c55e] text-xs font-semibold uppercase tracking-[0.14em] font-sans-body mb-4">How it works</span>
          <h2 className="font-display font-bold text-[2.75rem] md:text-[3.5rem] text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
            From first ring to retained client
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md mx-auto font-sans-body">
            Fully automated. Fully visible. No more guessing what happened to that call.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-zinc-200 dark:bg-zinc-800" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="lc-card-hover bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-7 h-full relative overflow-hidden group">
                <div className="absolute -top-1 right-5 font-display font-bold text-[4rem] leading-none select-none pointer-events-none text-zinc-100 dark:text-zinc-800">
                  {s.n}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-5 bg-zinc-50 dark:bg-zinc-900 group-hover:border-[#22c55e]/30 transition-colors">
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div className="text-[#22c55e] text-xs font-semibold font-sans-body uppercase tracking-[0.12em] mb-2">{s.n}</div>
                  <h3 className="font-display font-semibold text-zinc-900 dark:text-zinc-100 text-2xl mb-3">{s.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-sans-body">{s.desc}</p>
                </div>
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
  { quote: "The AI call summaries alone saved our intake team 15 hours a week. Every call is scored before anyone even picks up the lead. It's like having a senior intake manager reviewing everything.", name: "Sarah K. Thornton", title: "Intake Director", firm: "Thornton Law Group", stars: 5, metric: "15 hrs/week saved on reviews" },
  { quote: "We went from a 22% lead-to-consultation rate to 38% in just 60 days. The automated follow-up sequences capture leads we used to lose to voicemail.", name: "Carlos M. Delgado", title: "Founder", firm: "Delgado Personal Injury", stars: 5, metric: "22% → 38% conversion in 60 days" },
];

function Testimonials() {
  return (
    <section className="py-28 px-6 bg-white dark:bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <div className="flex justify-center gap-1 mb-5">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>
          <h2 className="font-display font-bold text-[2.75rem] md:text-[3.5rem] text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
            Trusted by firms that take<br />growth seriously
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="lc-card-hover flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-7 h-full hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <div className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full px-3 py-1 text-xs font-semibold font-sans-body mb-5 self-start">
                  <TrendingUp className="w-3 h-3 text-[#22c55e]" />
                  {t.metric}
                </div>
                <blockquote className="text-zinc-600 dark:text-zinc-300 text-[15px] leading-relaxed flex-1 mb-6 font-sans-body">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-5">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                    <span className="text-zinc-100 text-[10px] font-bold font-sans-body">{t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm font-sans-body">{t.name}</div>
                    <div className="text-zinc-400 text-xs font-sans-body">{t.title} · {t.firm}</div>
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
  { name: "Starter", price: 299, highlight: false, cta: "Start free trial", ctaHref: "/signup", desc: "For solo practitioners and small firms.", features: ["Up to 200 leads/month", "CallRail integration", "AI call summaries + scoring", "SMS follow-up automation", "Lead management CRM", "1 user"] },
  { name: "Growth", price: 699, highlight: true, cta: "Start free trial", ctaHref: "/signup", desc: "For growing firms ready to scale intake.", features: ["Up to 1,000 leads/month", "All Starter features", "Clio + Calendly integration", "Full marketing attribution", "5 users", "AI Insights Engine", "Priority support"] },
  { name: "Enterprise", price: null, highlight: false, cta: "Contact sales", ctaHref: "#", desc: "For large firms and multi-location practices.", features: ["Unlimited leads", "All Growth features", "NEOS + MyCase + Filevine", "Custom integrations + API", "Unlimited users", "Dedicated success manager", "SSO + SOC2 compliance"] },
];

function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="inline-block text-[#22c55e] text-xs font-semibold uppercase tracking-[0.14em] font-sans-body mb-4">Pricing</span>
          <h2 className="font-display font-bold text-[2.75rem] md:text-[3.5rem] text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">Simple, transparent pricing</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-sans-body">14-day free trial. No credit card required. Cancel anytime.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className={`lc-card-hover relative rounded-xl p-7 flex flex-col gap-6 h-full ${
                p.highlight
                  ? "bg-zinc-900 dark:bg-zinc-950 border-2 border-[#22c55e]/40 shadow-xl"
                  : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-[#22c55e] text-white text-[10px] font-bold px-3 py-1 rounded-full font-sans-body tracking-wide uppercase">Most Popular</span>
                  </div>
                )}
                <div>
                  <h3 className={`font-display font-bold text-2xl mb-1 ${p.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>{p.name}</h3>
                  <p className={`text-sm font-sans-body ${p.highlight ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"}`}>{p.desc}</p>
                </div>
                <div>
                  {p.price
                    ? <div className="flex items-end gap-1">
                        <span className={`font-display font-bold text-5xl leading-none ${p.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>${p.price}</span>
                        <span className={`text-sm mb-1.5 font-sans-body ${p.highlight ? "text-zinc-500" : "text-zinc-400"}`}>/mo</span>
                      </div>
                    : <div className={`font-display font-bold text-4xl ${p.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>Custom</div>
                  }
                </div>
                <ul className="flex flex-col gap-2.5 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm font-sans-body">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#22c55e]" : "text-[#22c55e]"}`} />
                      <span className={p.highlight ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={p.ctaHref}
                  className={`block w-full text-center py-3 rounded-lg text-sm font-semibold font-sans-body transition-colors duration-150 ${
                    p.highlight
                      ? "bg-[#22c55e] hover:bg-[#16a34a] text-white"
                      : "bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900"
                  }`}>
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-10 flex flex-wrap items-center justify-center gap-7 text-zinc-400 dark:text-zinc-600 text-sm font-sans-body">
          {[{ icon: Shield, text: "SOC2 Type II" }, { icon: Clock, text: "14-day free trial" }, { icon: Check, text: "No credit card" }, { icon: Target, text: "Cancel anytime" }].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <item.icon className="w-3.5 h-3.5" />
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
    <section className="py-28 px-6 bg-white dark:bg-[#09090b]">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 p-14 sm:p-20 text-center noise-overlay">
            {/* Green radial glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-40 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 border border-zinc-700 rounded-full px-4 py-1.5 mb-8 font-sans-body">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-zinc-400 text-xs font-medium">Start today</span>
              </div>
              <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-5 leading-tight">
                Ready to know which calls<br />become clients?
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto font-sans-body">
                Join 200+ law firms using Law Cube to turn marketing spend into measurable retained revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <PrimaryButton href="/signup">Start 14-day free trial</PrimaryButton>
                <GhostButton href="#">Talk to sales</GhostButton>
              </div>
              <p className="text-zinc-600 text-sm mt-6 font-sans-body">14-day free trial · No credit card required · Cancel anytime</p>
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
    <footer className="bg-zinc-950 border-t border-zinc-800 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Law Cube" width={24} height={24} className="rounded-md" />
              <span className="font-display font-semibold text-zinc-100 tracking-tight text-[17px]">Law Cube</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-sans-body">
              AI-powered intake, lead conversion, and marketing intelligence for law firms that take growth seriously.
            </p>
            <div className="flex items-center gap-2 mt-4 text-zinc-600 text-xs font-sans-body">
              <Shield className="w-3.5 h-3.5 text-[#22c55e]" /> SOC2 Type II · HIPAA Ready
            </div>
          </div>
          {[
            { heading: "Product", links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"] },
            { heading: "Integrations", links: ["CallRail", "Clio", "Calendly", "Google Ads", "Meta Ads"] },
            { heading: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
          ].map(col => (
            <div key={col.heading}>
              <h4 className="font-sans-body font-semibold text-zinc-400 text-xs mb-4 uppercase tracking-[0.1em]">{col.heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => <li key={l}><a href="#" className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors font-sans-body">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs font-sans-body">© 2025 Enigma Cube LLC. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map(l => <a key={l} href="#" className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors font-sans-body">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#09090b]">
      <ScrollProgress />
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
