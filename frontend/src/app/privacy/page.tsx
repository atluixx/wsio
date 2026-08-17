import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy — wsio.",
  description: "Learn about wsio zero-tracking policy, LGPD and GDPR compliance, and minimal data processing model.",
  alternates: {
    canonical: "https://wsio.lol/privacy",
  },
  openGraph: {
    title: "Privacy Policy — wsio.",
    description: "Learn about wsio zero-tracking policy, LGPD and GDPR compliance, and minimal data processing model.",
    url: "https://wsio.lol/privacy",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — wsio.",
    description: "Learn about wsio zero-tracking policy, LGPD and GDPR compliance, and minimal data processing model.",
  },
};

export default function PrivacyPage() {
  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://wsio.lol"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://wsio.lol/privacy"
      }
    ]
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 space-y-8 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      
      <ScrollReveal>
        <div className="space-y-4 border-b border-white/10 pb-8">
          <Button asChild variant="ghost" size="sm" className="text-xs h-7 -ml-2 text-zinc-400 hover:text-white">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Home</span>
            </Link>
          </Button>
          <h1 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Last updated: August 17, 2026 &bull; Compliant with GDPR &amp; LGPD
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="prose prose-invert prose-zinc max-w-none text-xs sm:text-sm leading-relaxed space-y-8 text-zinc-300">
          <p>
            At <strong>wsio.</strong>, privacy is a core structural guarantee. We process only the minimum operational data necessary to perform high-speed URL redirection and session management. We do not track users across the web or monetize behavioral data.
          </p>

          <section className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              1. Zero Third-Party Ad Tracking
            </h2>
            <p className="text-zinc-400">
              We operate zero cross-site ad trackers, behavioral cookies, or commercial fingerprinting scripts. Redirect loops execute strictly at the edge to forward requests directly to target destinations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              2. Data We Process
            </h2>
            <p className="text-zinc-400">
              We process minimal data strictly required to deliver link services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong className="text-white">Target URLs:</strong> Web addresses provided by users for link creation.</li>
              <li><strong className="text-white">Account Information:</strong> Email addresses and hashed passwords for authenticated users.</li>
              <li><strong className="text-white">Aggregate Telemetry:</strong> Anonymized click counts and referrers for dashboard statistics.</li>
            </ul>
          </section>

          <section className="space-y-3" id="cookies">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              3. Cookies &amp; Local Storage
            </h2>
            <p className="text-zinc-400">
              We use essential HTTP-only cookies solely for maintaining active user login sessions. Unauthenticated guest link history is saved locally in your browser storage and is never uploaded until an account is registered.
            </p>
          </section>

          <section className="space-y-3" id="security">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              4. Security &amp; Data Subject Rights
            </h2>
            <p className="text-zinc-400">
              Under GDPR and LGPD regulations, you maintain the right to inspect, export, or permanently delete your account and associated short links at any time directly through your user dashboard.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}

