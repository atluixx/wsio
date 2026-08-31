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
            At <strong>wsio.</strong>, privacy is a core structural guarantee. We process only the minimum operational data necessary to host your public profile page and manage your session. We do not track users across the web or monetize behavioral data.
          </p>

          <section className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              1. Zero Third-Party Ad Tracking
            </h2>
            <p className="text-zinc-400">
              We operate zero cross-site ad trackers, behavioral cookies, or commercial fingerprinting scripts. Link clicks are counted first-party and forward visitors straight to the destination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              2. Data We Process
            </h2>
            <p className="text-zinc-400">
              We process minimal data strictly required to run your page:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong className="text-white">Profile content:</strong> Username, display name, bio, avatar URL, theme, and the links you add.</li>
              <li><strong className="text-white">Account information:</strong> Email address and hashed password.</li>
              <li><strong className="text-white">Aggregate telemetry:</strong> Page views and per-link click counts with referrers, for your dashboard statistics.</li>
            </ul>
          </section>

          <section className="space-y-3" id="cookies">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              3. Cookies &amp; Local Storage
            </h2>
            <p className="text-zinc-400">
              We use one essential HTTP-only cookie solely for maintaining your login session. Lightweight UI preferences may be stored locally in your browser and are never uploaded.
            </p>
          </section>

          <section className="space-y-3" id="security">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              4. Security &amp; Data Subject Rights
            </h2>
            <p className="text-zinc-400">
              Under GDPR and LGPD regulations, you maintain the right to inspect, export, or permanently delete your account, profile, and links at any time directly through your dashboard.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}

