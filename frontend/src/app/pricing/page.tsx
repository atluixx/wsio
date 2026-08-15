"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, HelpCircle, Building2 } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createCheckoutSession } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PricingPage() {
  const { showToast } = useToast();
  const [annualBilling, setAnnualBilling] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Free / Guest",
      description: "Ideal for quick one-off link shortening with essential redirection.",
      priceMonthly: "$0",
      priceAnnual: "$0",
      billingPeriod: "Forever free",
      tag: "Casual Use",
      highlight: false,
      ctaText: "Start Shortening Free",
      ctaHref: "/",
      ctaVariant: "outline" as const,
      features: [
        "3 link creations per 24 hours",
        "Fast global edge redirection",
        "Zero third-party tracking",
        "Standard short link hashes",
      ],
    },
    {
      name: "Starter Plan",
      description: "For creators, freelancers, and indie developers who need full link control.",
      priceMonthly: "$4",
      priceAnnual: "$3",
      billingPeriod: annualBilling ? "$36 / year ($3/mo)" : "Billed monthly ($4/mo)",
      tag: "Most Popular",
      highlight: true,
      ctaText: "Upgrade to Starter",
      ctaHref: "/register?plan=starter",
      ctaVariant: "default" as const,
      features: [
        "Unlimited link creation (No daily caps)",
        "Cloud database sync across devices",
        "Custom back-half slug aliases",
        "Click analytics & referrer origins",
        "Vector QR code generator",
        "90-Day API Keys access",
      ],
    },
    {
      name: "Diamond Plan",
      description: "For growth teams, enterprise brands, and developers scaling API usage.",
      priceMonthly: "$12",
      priceAnnual: "$9",
      billingPeriod: annualBilling ? "$108 / year ($9/mo)" : "Billed monthly ($12/mo)",
      tag: "Power & Scale",
      highlight: false,
      ctaText: "Go Diamond",
      ctaHref: "/register?plan=diamond",
      ctaVariant: "secondary" as const,
      features: [
        "Company custom subdomains (brand.wsio.lol)",
        "Real-time click telemetry stream",
        "REST API access & 365-day API Keys",
        "Password-protected & expiring links",
        "Priority edge SLA (99.99% Uptime)",
        "Team collaboration & shared workspaces",
      ],
    },
  ];

  const comparisonFeatures = [
    { name: "Daily Link Cap", free: "3 / day", starter: "Unlimited", diamond: "Unlimited" },
    { name: "Multi-Device Cloud Sync", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Custom Slugs / Aliases", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Dynamic Destination Editing", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Vector QR Code Generator", free: "Basic", starter: "Vector PNG", diamond: "Custom Branded QR" },
    { name: "Click Telemetry History", free: "No", starter: "30 Days", diamond: "Unlimited Real-Time" },
    { name: "Custom Branded Subdomains", free: "No", starter: "No", diamond: "Dedicated Domain Request" },
    { name: "Headless REST API Access", free: "No", starter: "90-Day Keys", diamond: "365-Day Keys & SLA" },
    { name: "Edge Uptime Guarantee", free: "Standard", starter: "99.9%", diamond: "99.99% Priority" },
  ];

  const handleSubscribe = async (planType: string) => {
    if (planType === "free" || planType === "guest") {
      window.location.href = "/";
      return;
    }

    setSubmittingPlan(planType);
    const res = await createCheckoutSession(planType);
    setSubmittingPlan(null);

    if (res.url) {
      window.location.href = res.url;
    } else {
      showToast(res.error || "Failed to launch Checkout Session", "error");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-20 space-y-12 sm:space-y-16 font-sans">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Transparent Pricing for All Scales</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl text-white font-bold leading-[1.12]">
            Simple plans built to scale.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Start for free as a guest, or upgrade to unlock unlimited link shortening, custom slugs, and real-time click telemetry.
          </p>

          {/* Billing Toggle */}
          <div className="pt-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950 p-1.5 text-xs">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-4 py-2 transition-colors cursor-pointer min-h-[38px] ${
                !annualBilling ? "bg-white text-zinc-950 font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors cursor-pointer min-h-[38px] ${
                annualBilling ? "bg-white text-zinc-950 font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Plan Cards Grid - Glassmorphism */}
      <ScrollReveal delayMs={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const planKey = plan.name.toLowerCase().includes("starter")
              ? "starter"
              : plan.name.toLowerCase().includes("diamond")
              ? "diamond"
              : "free";

            return (
              <Card
                key={idx}
                className={`flex flex-col justify-between relative p-6 sm:p-7 backdrop-blur-2xl rounded-2xl transition-all duration-300 ${
                  plan.highlight
                    ? "border-emerald-500/40 bg-zinc-950/60 shadow-2xl ring-1 ring-emerald-500/20"
                    : "border-white/10 bg-zinc-950/40 hover:border-white/20 shadow-xl"
                }`}
              >
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-white">{plan.name}</h3>
                      <span className="text-[11px] font-mono text-zinc-400">{plan.tag}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-white">
                        {annualBilling ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span className="text-xs text-zinc-400">/ month</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{plan.billingPeriod}</div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
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
                  <Button
                    variant={plan.ctaVariant}
                    onClick={() => handleSubscribe(planKey)}
                    disabled={submittingPlan === planKey}
                    className="w-full h-11 text-xs font-semibold"
                  >
                    {submittingPlan === planKey ? (
                      <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Feature Comparison Matrix */}
      <ScrollReveal delayMs={150}>
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Detailed Feature Matrix</h2>
            <p className="text-xs text-zinc-400 mt-1">Compare plan capabilities across Free, Starter, and Diamond tiers.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/60 text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-center">Guest / Free</th>
                  <th className="p-4 font-semibold text-center text-white">Starter ($3-$4)</th>
                  <th className="p-4 font-semibold text-center text-emerald-400">Diamond ($9-$12)</th>
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
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <HelpCircle className="h-5 w-5 text-emerald-400" />
            <h2 className="font-heading text-2xl">Pricing &amp; Account FAQ</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white">What happens when a guest reaches the 3 links/day limit?</h3>
              <p className="mt-1">
                Guest sessions are capped at 3 link creations per 24 hours. You can sign up for a free account or upgrade to Starter for unlimited link shortening.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I change or cancel my plan anytime?</h3>
              <p className="mt-1">
                Yes. You can manage, upgrade, or cancel your subscription at any time directly from your dashboard.
              </p>
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
