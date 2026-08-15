"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap, ShieldCheck, HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: "Guest / Free",
      description: "Quick one-off link shortening with privacy-first redirection.",
      priceMonthly: "$0",
      priceAnnual: "$0",
      billingPeriod: "Forever free",
      badge: "Casual Use",
      highlight: false,
      ctaText: "Start Shortening",
      ctaHref: "/",
      ctaVariant: "btn-minimal-secondary",
      features: [
        "3 link creations per 24-hour day",
        "Sub-15ms edge redirection speed",
        "Local browser storage history",
        "100% zero third-party tracking",
        "Basic monospaced hash codes",
      ],
    },
    {
      name: "Starter",
      description: "For creators, marketers, freelancers, and indie builders.",
      priceMonthly: "$9",
      priceAnnual: "$7",
      billingPeriod: annualBilling ? "per month, billed annually ($84/yr)" : "per month, billed monthly",
      badge: "Most Popular",
      highlight: true,
      ctaText: "Upgrade to Starter",
      ctaHref: "/register?plan=starter",
      ctaVariant: "btn-minimal-primary",
      features: [
        "Unlimited link creation (No daily caps)",
        "Cloud multi-device dashboard sync",
        "Custom back-half slug aliases",
        "Essential click analytics & velocity",
        "Dynamic destination URL editing",
        "Instant vector QR code generator",
        "Standard email support",
      ],
    },
    {
      name: "Diamond",
      description: "For growth agencies, startups, enterprise marketers, and API developers.",
      priceMonthly: "$29",
      priceAnnual: "$24",
      billingPeriod: annualBilling ? "per month, billed annually ($288/yr)" : "per month, billed monthly",
      badge: "Power & Scale",
      highlight: false,
      ctaText: "Go Diamond",
      ctaHref: "/register?plan=diamond",
      ctaVariant: "btn-minimal-secondary",
      features: [
        "Custom branded domains (links.yourbrand.com)",
        "Real-time live click telemetry",
        "Geographic & referrer analytics breakdown",
        "REST API access & bulk link generation",
        "Password-protected & expiring links",
        "Priority sub-10ms edge SLA (99.99% Uptime)",
        "Team collaboration & shared workspaces",
        "Dedicated priority support",
      ],
    },
  ];

  const comparisonFeatures = [
    { name: "Daily Link Creation Limit", free: "3 / day", starter: "Unlimited", diamond: "Unlimited" },
    { name: "Multi-Device Cloud Sync", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Custom Back-Half Slugs", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Dynamic Target URL Editing", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Vector QR Code Export", free: "Basic", starter: "Vector SVG/PNG", diamond: "Custom Branded QR" },
    { name: "Click Analytics History", free: "No", starter: "Essential (30 Days)", diamond: "Advanced Real-Time (Unlimited)" },
    { name: "Custom Branded Domains", free: "No", starter: "No", diamond: "Unlimited Domains" },
    { name: "REST API & Bulk Hashes", free: "No", starter: "No", diamond: "Included" },
    { name: "Password & Expiry Protection", free: "No", starter: "No", diamond: "Included" },
    { name: "Edge SLA Guarantee", free: "Standard", starter: "99.9%", diamond: "99.99% Priority" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 space-y-16 font-mono">
      {/* Header & Title */}
      <ScrollReveal>
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-3.5 py-1 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal leading-[1.1]">
            Plans for every <span className="italic text-zinc-400">scale.</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            High-performance link infrastructure. Start for free as a guest, or unlock unlimited links, custom slugs, and real-time telemetry.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950 p-1.5 text-xs">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-4 py-1.5 transition-colors cursor-pointer ${
                !annualBilling ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors cursor-pointer ${
                annualBilling ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="rounded-full bg-emerald-400/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Plan Cards Grid */}
      <ScrollReveal delayMs={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`bento-card flex flex-col justify-between relative ${
                plan.highlight ? "border-white/30 bg-zinc-900/90 shadow-2xl" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl text-white font-normal">{plan.name}</h3>
                    {!plan.highlight && (
                      <span className="text-[10px] text-zinc-500 uppercase border border-white/10 px-2 py-0.5 rounded">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-bold text-white">
                      {annualBilling ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">{plan.billingPeriod}</div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    What&apos;s Included:
                  </span>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.ctaHref}
                  className={`${plan.ctaVariant} w-full`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Feature Comparison Matrix */}
      <ScrollReveal delayMs={150}>
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-3xl text-white font-normal">Detailed Feature Matrix</h2>
            <p className="text-xs text-zinc-400 mt-1">Compare features across Free, Starter, and Diamond tiers.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/60 text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-center">Guest / Free</th>
                  <th className="p-4 font-semibold text-center text-white">Starter ($7-$9)</th>
                  <th className="p-4 font-semibold text-center text-emerald-400">Diamond ($24-$29)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 font-medium text-white">{row.name}</td>
                    <td className="p-4 text-center text-zinc-400">{row.free}</td>
                    <td className="p-4 text-center font-semibold text-white">{row.starter}</td>
                    <td className="p-4 text-center font-semibold text-emerald-400">{row.diamond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal delayMs={200}>
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <HelpCircle className="h-5 w-5 text-sky-400" />
            <h2 className="font-serif text-2xl">Pricing FAQ</h2>
          </div>

          <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white">What happens when a guest reaches the 3 links/day limit?</h3>
              <p className="mt-1">
                Guest sessions are restricted to 3 link creations per 24 hours. When you reach this limit, simply create a free account or upgrade to Starter for unlimited link creation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I cancel or switch plans anytime?</h3>
              <p className="mt-1">
                Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your dashboard setting.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
