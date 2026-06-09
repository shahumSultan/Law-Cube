"use client";

import Link from "next/link";
import { CheckCircle, Zap, ArrowRight, Mail } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const PLANS = [
  {
    name: "Starter",
    price: "$299",
    desc: "For solo practitioners and small firms.",
    features: [
      "Up to 200 leads/month",
      "CallRail integration",
      "AI call summaries + scoring",
      "SMS follow-up automation",
      "Lead management CRM",
      "1 user",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$699",
    desc: "For growing firms ready to scale intake.",
    features: [
      "Up to 1,000 leads/month",
      "All Starter features",
      "Clio + Calendly integration",
      "Full marketing attribution",
      "5 users",
      "AI Insights Engine",
      "Priority support",
    ],
    highlight: true,
  },
];

export default function UpgradePage() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold font-sans-body px-3 py-1.5 rounded-full mb-5">
            <Zap className="w-3.5 h-3.5" />
            Your free trial has ended
          </div>
          <h1 className="font-display font-bold text-zinc-900 dark:text-zinc-100 text-4xl tracking-tight mb-3">
            Choose your plan
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-sans-body text-lg">
            Upgrade to keep your leads, data, and integrations intact.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={[
                "rounded-xl border p-6 flex flex-col",
                plan.highlight
                  ? "border-[#22c55e] bg-[#14532d] text-white shadow-lg shadow-green-900/20"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900",
              ].join(" ")}
            >
              {plan.highlight && (
                <div className="text-[#22c55e] text-xs font-bold font-sans-body uppercase tracking-widest mb-3">
                  Most popular
                </div>
              )}
              <div className={`font-display font-bold text-2xl mb-1 ${plan.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}>
                {plan.name}
              </div>
              <div className={`text-3xl font-display font-bold mb-1 ${plan.highlight ? "text-[#22c55e]" : "text-zinc-900 dark:text-zinc-100"}`}>
                {plan.price}<span className="text-sm font-normal opacity-60">/mo</span>
              </div>
              <p className={`text-sm font-sans-body mb-5 ${plan.highlight ? "text-green-200" : "text-zinc-500 dark:text-zinc-400"}`}>
                {plan.desc}
              </p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-[#22c55e]" : "text-[#22c55e]"}`} />
                    <span className={`text-sm font-sans-body ${plan.highlight ? "text-green-100" : "text-zinc-700 dark:text-zinc-300"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:sultanshahum3@gmail.com?subject=Upgrade to ${plan.name}&body=Hi, I'd like to upgrade to the ${plan.name} plan.%0A%0AAccount: ${user?.email ?? ""}`}
                className={[
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold font-sans-body transition-all",
                  plan.highlight
                    ? "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200",
                ].join(" ")}
              >
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-sans-body mb-3">
            Need a custom plan or have questions?
          </p>
          <a
            href="mailto:sultanshahum3@gmail.com"
            className="inline-flex items-center gap-2 text-[#15803d] dark:text-[#22c55e] font-semibold text-sm hover:underline font-sans-body"
          >
            <Mail className="w-4 h-4" />
            sultanshahum3@gmail.com
          </a>
        </div>

        <div className="text-center mt-8">
          <Link href="/login" className="text-zinc-400 text-sm hover:text-zinc-600 dark:hover:text-zinc-300 font-sans-body transition-colors">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
