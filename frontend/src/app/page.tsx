"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PhoneCall, Brain, TrendingUp, Zap, Link2, BarChart3,
  ArrowRight, Check, ChevronDown, Star, Menu, X,
  Play, Sparkles
} from "lucide-react";

/* ─── Animated counter ─── */
function Counter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const steps = 60;
        const step = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 1800 / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-[#1e2d45]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">LC</span>
          </div>
          <span className="font-display font-semibold text-[#eef2ff] text-lg tracking-tight">Law Cube</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Integrations", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-[#8899b4] hover:text-[#eef2ff] text-sm transition-colors duration-200 font-medium">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-[#8899b4] hover:text-[#eef2ff] text-sm transition-colors font-medium px-4 py-2">
            Sign In
          </Link>
          <Link href="/signup"
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1.5">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button className="md:hidden text-[#8899b4]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-[#1e2d45] px-6 py-4 flex flex-col gap-4">
          {["Features", "Integrations", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)}
              className="text-[#8899b4] text-sm font-medium py-1">{item}</a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1e2d45]">
            <Link href="/login" className="text-[#8899b4] text-sm py-2 text-center">Sign In</Link>
            <Link href="/signup" className="bg-[#3b82f6] text-white text-sm font-semibold py-2.5 rounded-lg text-center">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ─── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090d18]/50 to-[#090d18]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#3b82f6]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-[#f59e0b]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/25 rounded-full px-4 py-1.5 mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
          <span className="text-[#60a5fa] text-xs font-medium tracking-wide uppercase">AI-Powered Legal Intake</span>
        </div>

        <h1 className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-[1.0] tracking-tight mb-6 animate-fade-up delay-100">
          <span className="text-gradient-hero">Turn Calls</span>
          <br />
          <span className="text-[#eef2ff]">Into Clients.</span>
        </h1>

        <p className="text-[#8899b4] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
          Law Cube connects every marketing dollar to retained clients — automatically. Know exactly which campaigns generate revenue, and which waste your budget.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up delay-300">
          <Link href="/signup"
            className="group flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#3b82f6]/20 hover:shadow-[#3b82f6]/35">
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 text-[#8899b4] hover:text-[#eef2ff] font-medium text-base px-6 py-3.5 rounded-xl border border-[#1e2d45] hover:border-[#2a3f5f] transition-all duration-200">
            <Play className="w-4 h-4 fill-current" />
            Watch Demo
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up delay-400">
          {[
            { value: 2847, suffix: "+", label: "Leads captured" },
            { value: 68,   suffix: "%", label: "Avg conversion lift" },
            { value: 312,  prefix: "$", label: "Avg cost-per-client" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-bold text-3xl text-[#eef2ff] mb-1">
                <Counter target={s.value} suffix={s.suffix ?? ""} prefix={s.prefix ?? ""} />
              </div>
              <div className="text-[#4a5c78] text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="relative z-10 mt-20 w-full max-w-6xl mx-auto animate-fade-up delay-500">
        <div className="relative rounded-2xl overflow-hidden border border-[#1e2d45] shadow-2xl shadow-black/50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#090d18]/60 pointer-events-none z-10" />
          <div className="bg-[#0f1624] p-1.5 rounded-2xl">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1e2d45]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/60" />
              <div className="flex-1 mx-4 bg-[#141d2e] rounded text-[#4a5c78] text-xs px-3 py-1 text-center">
                app.lawcube.io/dashboard
              </div>
            </div>
            <div className="p-4 grid grid-cols-4 gap-3">
              {[
                { label: "Total Leads",    value: "1,284", trend: "+18.2%", color: "#3b82f6" },
                { label: "Qualified",      value: "847",   trend: "+12.4%", color: "#60a5fa" },
                { label: "Consultations",  value: "412",   trend: "+9.1%",  color: "#f59e0b" },
                { label: "Retained",       value: "203",   trend: "+22.8%", color: "#10b981" },
              ].map((card, i) => (
                <div key={i} className="bg-[#141d2e] rounded-lg p-3 border border-[#1e2d45]">
                  <div className="text-[#4a5c78] text-xs mb-1.5">{card.label}</div>
                  <div className="font-display font-bold text-xl text-[#eef2ff] mb-1">{card.value}</div>
                  <div className="text-[#10b981] text-xs font-medium">{card.trend} ↑</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-[#4a5c78]" />
      </div>
    </section>
  );
}

/* ─── Integrations bar ─── */
function IntegrationsBar() {
  const integrations = ["CallRail", "Clio", "Calendly", "Google Ads", "Meta Ads", "NEOS", "MyCase"];
  return (
    <section className="py-12 border-y border-[#1e2d45] bg-[#0f1624]/50" id="integrations">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-[#4a5c78] text-xs font-medium uppercase tracking-widest mb-8">
          Integrates with the tools your firm already uses
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {integrations.map(name => (
            <span key={name}
              className="font-display font-semibold text-[#2a3f5f] hover:text-[#4a5c78] transition-colors text-sm tracking-wide cursor-default">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
const FEATURES = [
  { icon: PhoneCall, color: "#3b82f6", glow: "rgba(59,130,246,0.1)",  title: "Call Intelligence",       desc: "Every inbound call is automatically transcribed, summarized, and scored by AI. Know the quality of every lead before your team reviews it." },
  { icon: Brain,     color: "#8b5cf6", glow: "rgba(139,92,246,0.1)",  title: "AI Lead Scoring",         desc: "Leads scored 0–100 based on injury severity, case type, representation status, and jurisdiction match. Focus on your best opportunities." },
  { icon: Zap,       color: "#f59e0b", glow: "rgba(245,158,11,0.1)",  title: "Follow-Up Automation",    desc: "Missed a call? An automated SMS fires within seconds. No consultation scheduled? A nurture sequence launches automatically." },
  { icon: TrendingUp,color: "#10b981", glow: "rgba(16,185,129,0.1)",  title: "Marketing Attribution",   desc: "Connect Google Ads, Meta, and CallRail data to actual retained clients. See true cost-per-client for every campaign and keyword." },
  { icon: Link2,     color: "#60a5fa", glow: "rgba(96,165,250,0.1)",  title: "Clio Sync",               desc: "Bidirectional sync with Clio, NEOS, and MyCase. Retain a client in Law Cube and it appears in your practice management system instantly." },
  { icon: BarChart3, color: "#f59e0b", glow: "rgba(245,158,11,0.1)",  title: "AI Insights Engine",      desc: "Nightly analysis surfaces actionable recommendations — which campaigns to scale, which intake reps to coach, where leads are slipping." },
];

function Features() {
  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full px-4 py-1.5 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span className="text-[#60a5fa] text-xs font-medium uppercase tracking-wide">Platform Features</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#eef2ff] mb-5 tracking-tight">
            Everything your firm needs to<br />
            <span className="text-gradient-blue">convert more clients</span>
          </h2>
          <p className="text-[#8899b4] text-lg max-w-xl mx-auto">
            One platform replaces five disconnected tools — and connects the dots your team never could manually.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i}
              className="group relative bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-7 hover:border-[#2a3f5f] transition-all duration-300 cursor-default overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(circle at 20% 20%, ${f.glow}, transparent 60%)` }} />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.glow, border: `1px solid ${f.color}22` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-display font-semibold text-[#eef2ff] text-lg mb-2.5">{f.title}</h3>
                <p className="text-[#8899b4] text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorks() {
  const steps = [
    { n: "01", title: "Calls come in",    color: "#3b82f6", desc: "CallRail captures every inbound call with tracking numbers, UTM data, and recordings automatically imported into Law Cube." },
    { n: "02", title: "AI analyzes",      color: "#8b5cf6", desc: "Within seconds, our AI transcribes the call, generates a summary, scores the lead 0–100, classifies the outcome, and stores results." },
    { n: "03", title: "Your team acts",   color: "#10b981", desc: "Intake specialists see scored, prioritized leads. Automated follow-ups fire for missed calls. The right leads reach the right attorneys." },
  ];

  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#eef2ff] mb-5 tracking-tight">How Law Cube works</h2>
          <p className="text-[#8899b4] text-lg max-w-lg mx-auto">From first ring to retained client — fully automated, fully visible.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[33%] right-[33%] h-px bg-gradient-to-r from-[#3b82f6]/50 via-[#8b5cf6]/50 to-[#10b981]/50" />
          {steps.map((s, i) => (
            <div key={i} className="relative bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                <span className="font-display font-bold text-lg" style={{ color: s.color }}>{s.n}</span>
              </div>
              <h3 className="font-display font-semibold text-[#eef2ff] text-xl mb-3">{s.title}</h3>
              <p className="text-[#8899b4] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Metrics ─── */
function Metrics() {
  const stats = [
    { value: 68, suffix: "%", label: "Average lift in lead conversion" },
    { value: 4,  suffix: "min", label: "Average AI analysis time per call" },
    { value: 94, suffix: "%", label: "Accuracy on lead classification" },
    { value: 2,  suffix: "×", label: "Average ROI in year one" },
  ];
  return (
    <section className="py-28 px-6 bg-[#0f1624]/50 border-y border-[#1e2d45]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#eef2ff] mb-4 tracking-tight">Results firms actually see</h2>
          <p className="text-[#8899b4] text-lg">Based on aggregated data from Law Cube customers after 90 days.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-8 rounded-2xl bg-[#141d2e] border border-[#1e2d45]">
              <div className="font-display font-bold text-5xl text-[#eef2ff] mb-3">
                <Counter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[#8899b4] text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  { quote: "We were flying blind on marketing spend. Law Cube showed us our Google Ads was generating 3× more retained clients than Meta at half the cost. We reallocated within a week.", name: "James R. Mitchell", title: "Managing Partner, Mitchell & Associates", stars: 5 },
  { quote: "The AI call summaries alone saved our intake team 15 hours a week. Every call is scored and summarized before anyone even picks up the lead. It's like having a senior intake manager reviewing everything.", name: "Sarah K. Thornton", title: "Intake Director, Thornton Law Group", stars: 5 },
  { quote: "We went from 22% lead-to-consultation rate to 38% in 60 days. The automated follow-up sequences capture the leads we used to lose to voicemail.", name: "Carlos M. Delgado", title: "Founder, Delgado Personal Injury", stars: 5 },
];

function Testimonials() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#eef2ff] mb-5 tracking-tight">
            Trusted by law firms<br /><span className="text-gradient-gold">that take growth seriously</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-[#0f1624] border border-[#1e2d45] rounded-2xl p-8 flex flex-col gap-6 hover:border-[#2a3f5f] transition-colors">
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, j) => <Star key={j} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />)}
              </div>
              <p className="text-[#8899b4] text-sm leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <div className="font-display font-semibold text-[#eef2ff] text-sm">{t.name}</div>
                <div className="text-[#4a5c78] text-xs mt-0.5">{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
const PLANS = [
  { name: "Starter",    price: 299, highlight: false, cta: "Start Free Trial", desc: "For solo and small practices just getting started.", features: ["Up to 200 leads/month", "CallRail integration", "AI call summaries", "Lead scoring", "SMS follow-up", "1 user"] },
  { name: "Growth",     price: 699, highlight: true,  cta: "Start Free Trial", desc: "For growing firms ready to scale intake and marketing.", features: ["Up to 1,000 leads/month", "All Starter features", "Clio + Calendly integration", "Marketing attribution", "5 users", "AI insights engine", "Priority support"] },
  { name: "Enterprise", price: null,highlight: false, cta: "Contact Sales",    desc: "For large firms and multi-location practices.", features: ["Unlimited leads", "All Growth features", "NEOS + MyCase + Filevine", "Custom integrations", "Unlimited users", "Dedicated success manager", "SSO + SOC2 ready"] },
];

function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[#eef2ff] mb-5 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-[#8899b4] text-lg">14-day free trial. No credit card required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((p, i) => (
            <div key={i} className={`relative rounded-2xl p-8 flex flex-col gap-6 transition-all ${p.highlight ? "bg-[#3b82f6]/10 border-2 border-[#3b82f6]/50 shadow-lg shadow-[#3b82f6]/10" : "bg-[#0f1624] border border-[#1e2d45]"}`}>
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#3b82f6] text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div>
                <h3 className="font-display font-bold text-[#eef2ff] text-xl mb-1">{p.name}</h3>
                <p className="text-[#8899b4] text-sm">{p.desc}</p>
              </div>
              <div>
                {p.price
                  ? <div className="flex items-end gap-1"><span className="font-display font-bold text-4xl text-[#eef2ff]">${p.price}</span><span className="text-[#8899b4] text-sm mb-1">/month</span></div>
                  : <div className="font-display font-bold text-3xl text-[#eef2ff]">Custom</div>
                }
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-[#8899b4] text-sm">
                    <Check className="w-4 h-4 text-[#10b981] mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={p.price ? "/signup" : "#"} className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-all ${p.highlight ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-md shadow-[#3b82f6]/25" : "bg-[#141d2e] hover:bg-[#1a2540] text-[#eef2ff] border border-[#1e2d45]"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#6366f1] p-16 text-center">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-5 tracking-tight">
              Ready to know which calls<br />become clients?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Join forward-thinking law firms using Law Cube to turn marketing spend into measurable revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white hover:bg-blue-50 text-[#1d4ed8] font-semibold text-base px-8 py-3.5 rounded-xl transition-all inline-flex items-center justify-center gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="border border-white/30 hover:border-white/60 text-white font-medium text-base px-8 py-3.5 rounded-xl transition-all">
                Talk to Sales
              </button>
            </div>
            <p className="text-blue-200/70 text-sm mt-6">14-day free trial · No credit card required · Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-[#1e2d45] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center">
                <span className="font-display font-bold text-white text-xs">LC</span>
              </div>
              <span className="font-display font-semibold text-[#eef2ff] tracking-tight">Law Cube</span>
            </div>
            <p className="text-[#4a5c78] text-sm leading-relaxed max-w-xs">
              AI-powered intake, lead conversion, and marketing intelligence for law firms.
            </p>
          </div>
          {[
            { heading: "Product",      links: ["Features", "Integrations", "Pricing", "Changelog"] },
            { heading: "Integrations", links: ["CallRail", "Clio", "Calendly", "Google Ads"] },
            { heading: "Company",      links: ["About", "Blog", "Careers", "Contact"] },
          ].map(col => (
            <div key={col.heading}>
              <h4 className="font-display font-semibold text-[#eef2ff] text-sm mb-4">{col.heading}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(l => <li key={l}><a href="#" className="text-[#4a5c78] hover:text-[#8899b4] text-sm transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[#1e2d45] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#4a5c78] text-xs">© 2024 Enigma Cube LLC. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Security"].map(l => <a key={l} href="#" className="text-[#4a5c78] hover:text-[#8899b4] text-xs transition-colors">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#090d18]">
      <Navbar />
      <Hero />
      <IntegrationsBar />
      <Features />
      <HowItWorks />
      <Metrics />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
