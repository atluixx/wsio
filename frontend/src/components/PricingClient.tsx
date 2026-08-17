"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createCheckoutSession } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PricingClient() {
  const { showToast } = useToast();
  const [annualBilling, setAnnualBilling] = useState(true);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

  const plans = [
    {
      name: "Free Tier",
      description: "Essential URL shortening for occasional sharing.",
      priceMonthly: "€0",
      priceAnnual: "€0",
      billingPeriod: "Forever free",
      tag: "Free",
      highlight: false,
      ctaText: "Start Free",
      ctaHref: "/",
      ctaVariant: "outline" as const,
      features: [
        "3 link creations per day",
        "Fast global redirection SLA",
        "No third-party tracking",
        "Standard short URL format",
      ],
    },
    {
      name: "Starter Plan",
      description: "For creators, freelancers, and indie builders.",
      priceMonthly: "€3",
      priceAnnual: "€2.40",
      billingPeriod: annualBilling ? "€28.80 / year (€2.40/mo)" : "Billed monthly (€3/mo)",
      tag: "Popular",
      highlight: true,
      ctaText: "Get Starter",
      ctaHref: "/register?plan=starter",
      ctaVariant: "default" as const,
      features: [
        "Unlimited link creation",
        "Cloud database history & sync",
        "Custom slug aliases",
        "Click analytics & referrers",
        "Vector QR code generator",
        "90-Day API Keys access",
      ],
    },
    {
      name: "Diamond Plan",
      description: "For growing teams, brands, and heavy API applications.",
      priceMonthly: "€9",
      priceAnnual: "€7.20",
      billingPeriod: annualBilling ? "€86.40 / year (€7.20/mo)" : "Billed monthly (€9/mo)",
      tag: "Enterprise",
      highlight: false,
      ctaText: "Get Diamond",
      ctaHref: "/register?plan=diamond",
      ctaVariant: "secondary" as const,
      features: [
        "Brand subdomain applications",
        "Real-time click telemetry stream",
        "REST API & 365-day API Keys",
        "High per-minute API rate limits",
        "Priority 99.99% Edge SLA",
        "Dedicated workspace management",
      ],
    },
  ];

  const comparisonFeatures = [
    { name: "Daily Link Cap", free: "3 / day", starter: "Unlimited", diamond: "Unlimited" },
    { name: "Cloud History Sync", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "Custom Slugs / Aliases", free: "No", starter: "Yes", diamond: "Yes" },
    { name: "QR Code Generator", free: "Basic", starter: "Vector PNG", diamond: "Custom Branded" },
    { name: "Click Telemetry", free: "No", starter: "30 Days", diamond: "Unlimited Real-Time" },
    { name: "Custom Subdomain Request", free: "No", starter: "No", diamond: "Application Included" },
    { name: "REST API Access", free: "No", starter: "90-Day Keys", diamond: "365-Day Keys & High Rate Limits" },
    { name: "Edge SLA Guarantee", free: "Standard", starter: "99.9%", diamond: "99.99% Priority" },
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 space-y-12 font-sans">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <h1 className="text-3xl sm:text-5xl text-white font-extrabold tracking-tight">
            Simple, transparent pricing.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Free forever for basic sharing. Upgrade for custom slugs, analytics, and API keys.
          </p>

          <div className="pt-2 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900 p-1 text-xs font-mono">
            <button
              onClick={() => setAnnualBilling(false)}
              className={
                !annualBilling
                  ? "rounded-lg px-3 py-1.5 bg-white text-zinc-950 font-bold"
                  : "rounded-lg px-3 py-1.5 text-zinc-400 hover:text-white"
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={
                annualBilling
                  ? "rounded-lg px-3 py-1.5 bg-white text-zinc-950 font-bold"
                  : "rounded-lg px-3 py-1.5 text-zinc-400 hover:text-white"
              }
            >
              Annual (-20%)
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Plan Cards Grid */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const planKey = plan.name.toLowerCase().includes("starter")
              ? "starter"
              : plan.name.toLowerCase().includes("diamond")
              ? "diamond"
              : "free";

            return (
              <div
                key={idx}
                className={`flex flex-col justify-between p-6 rounded-2xl minimal-card ${
                  plan.highlight ? "border-white/20 bg-zinc-900/60" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                      {plan.highlight && (
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white text-zinc-950">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 min-h-[32px]">{plan.description}</p>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-3xl font-extrabold text-white">
                        {annualBilling ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span className="text-xs text-zinc-400">/ mo</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/5">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={submittingPlan === planKey}
                    className={`w-full h-10 text-xs font-semibold rounded-xl ${
                      plan.highlight
                        ? "bg-white hover:bg-zinc-200 text-zinc-950 font-bold"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                    }`}
                  >
                    {submittingPlan === planKey ? (
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{plan.ctaText}</span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Feature Comparison Matrix */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Compare Tiers</h2>
          <div className="overflow-x-auto rounded-2xl minimal-card">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950 text-zinc-400 font-mono">
                  <th className="p-3.5 font-semibold">Feature</th>
                  <th className="p-3.5 font-semibold text-center">Free</th>
                  <th className="p-3.5 font-semibold text-center text-white">Starter</th>
                  <th className="p-3.5 font-semibold text-center text-zinc-200">Diamond</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-mono">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40">
                    <td className="p-3.5 font-medium text-white font-sans">{row.name}</td>
                    <td className="p-3.5 text-center text-zinc-500">{row.free}</td>
                    <td className="p-3.5 text-center font-bold text-white">{row.starter}</td>
                    <td className="p-3.5 text-center font-bold text-zinc-200">{row.diamond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}


