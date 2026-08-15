"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, HelpCircle } from "lucide-react";
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
      name: "Free Tier",
      description: "Essential link shortening for occasional sharing.",
      priceMonthly: "$0",
      priceAnnual: "$0",
      billingPeriod: "Forever free",
      tag: "Free",
      highlight: false,
      ctaText: "Start Free",
      ctaHref: "/",
      ctaVariant: "outline" as const,
      features: [
        "3 link creations per day",
        "Fast global redirection",
        "No third-party tracking",
        "Standard short URL format",
      ],
    },
    {
      name: "Starter Plan",
      description: "For creators, freelancers, and indie builders.",
      priceMonthly: "$4",
      priceAnnual: "$3",
      billingPeriod: annualBilling ? "$36 / year ($3/mo)" : "Billed monthly ($4/mo)",
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
      priceMonthly: "$12",
      priceAnnual: "$9",
      billingPeriod: annualBilling ? "$108 / year ($9/mo)" : "Billed monthly ($12/mo)",
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20 space-y-12 sm:space-y-16">
      {/* Header */}
      <ScrollReveal>
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="font-heading text-4xl sm:text-6xl text-white font-bold leading-[1.15]">
            Simple, predictable plans.
          </h1>

          <p className="text-sm sm:text-base text-purple-200/70 leading-relaxed">
            Start for free, or upgrade to unlock custom slugs, branded subdomains, and high-rate-limit API access.
          </p>

          {/* Billing Toggle */}
          <div className="pt-2 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-[#0c081a] p-1.5 text-xs">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`rounded-full px-4 py-2 transition-colors cursor-pointer min-h-[38px] ${
                !annualBilling ? "bg-purple-600 text-white font-semibold shadow-md" : "text-purple-300 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 transition-colors cursor-pointer min-h-[38px] ${
                annualBilling ? "bg-purple-600 text-white font-semibold shadow-md" : "text-purple-300 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/30">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Plan Cards Grid */}
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
                className={`flex flex-col justify-between relative p-6 sm:p-7 rounded-2xl transition-all duration-300 ${
                  plan.highlight
                    ? "glass-panel border-purple-500/40 shadow-2xl ring-1 ring-purple-500/30"
                    : "glass-card border-purple-500/20"
                }`}
              >
                <div className="space-y-6">
                  <div className="border-b border-purple-500/15 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-white">{plan.name}</h3>
                      <span className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/20">{plan.tag}</span>
                    </div>
                    <p className="text-xs text-purple-200/70 leading-relaxed min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-white">
                        {annualBilling ? plan.priceAnnual : plan.priceMonthly}
                      </span>
                      <span className="text-xs text-purple-300/70">/ month</span>
                    </div>
                    <div className="text-[11px] text-purple-300/70">{plan.billingPeriod}</div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] uppercase tracking-wider text-purple-300/80 font-semibold block">
                      Features:
                    </span>
                    <ul className="space-y-2 text-xs text-purple-200/80">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
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
                    className={`w-full h-11 text-xs font-semibold ${
                      plan.highlight
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30"
                    }`}
                  >
                    {submittingPlan === planKey ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
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
          <div className="border-b border-purple-500/15 pb-4">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Feature Matrix</h2>
            <p className="text-xs text-purple-300/70 mt-1">Compare features across plan tiers.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl glass-card border-purple-500/20">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead>
                <tr className="border-b border-purple-500/20 bg-purple-950/40 text-purple-300 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Feature</th>
                  <th className="p-4 font-semibold text-center">Free Tier</th>
                  <th className="p-4 font-semibold text-center text-white">Starter Plan</th>
                  <th className="p-4 font-semibold text-center text-purple-300">Diamond Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-purple-200/80">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-950/30 transition-colors">
                    <td className="p-4 font-medium text-white">{row.name}</td>
                    <td className="p-4 text-center text-purple-300/60">{row.free}</td>
                    <td className="p-4 text-center font-medium text-white">{row.starter}</td>
                    <td className="p-4 text-center font-semibold text-purple-300">{row.diamond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal delayMs={200}>
        <Card className="glass-panel p-6 sm:p-8 space-y-4 rounded-2xl border-purple-500/25">
          <div className="flex items-center gap-2 text-white font-semibold">
            <HelpCircle className="h-5 w-5 text-purple-400" />
            <h2 className="font-heading text-2xl">Pricing FAQ</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-purple-200/70 leading-relaxed">
            <div>
              <h3 className="font-semibold text-white">What happens when I reach the guest daily limit?</h3>
              <p className="mt-1">
                Guest link creation is capped at 3 links per day. You can register for a free account or upgrade to Starter for unlimited link shortening.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white">Can I switch or cancel my plan anytime?</h3>
              <p className="mt-1">
                Yes. You can manage or upgrade your subscription from your user dashboard at any time.
              </p>
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
