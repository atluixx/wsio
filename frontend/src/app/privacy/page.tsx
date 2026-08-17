import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft, Shield, EyeOff, Server, Cookie } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 space-y-10 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <ScrollReveal>
        <div className="border-b border-white/10 pb-6 space-y-3">
          <Button asChild variant="ghost" size="sm" className="text-xs h-8 -ml-2 text-zinc-400 hover:text-white">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </Button>
          <h1 className="font-heading text-3xl sm:text-5xl text-white font-bold">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
            At wsio, user privacy is an architectural requirement. We build simple, privacy-respecting software with full LGPD and GDPR compliance. Also read our{" "}
            <Link href="/terms" className="text-zinc-200 underline hover:text-white transition-colors">
              Terms of Service
            </Link>{" "}
            or explore our{" "}
            <Link href="/pricing" className="text-zinc-200 underline hover:text-white transition-colors">
              Pricing Plans
            </Link>.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <EyeOff className="h-5 w-5 text-emerald-400" />
              <h2>1. Zero Third-Party Tracking</h2>
            </div>
            <p className="text-zinc-400">
              We do not sell user data, utilize cross-site advertising cookies, or embed third-party tracking scripts into link redirections.
            </p>
          </Card>

          {/* Section 2 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Server className="h-5 w-5 text-sky-400" />
              <h2>2. Information We Process</h2>
            </div>
            <p className="text-zinc-400">
              We process minimal operational data strictly necessary to execute short link redirections:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li><strong className="text-white">Destination URLs:</strong> Target web addresses provided to create short links.</li>
              <li><strong className="text-white">Account Credentials:</strong> Email addresses submitted for authentication and account sync.</li>
            </ul>
          </Card>

          {/* Section 3 */}
          <Card id="cookies" className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Cookie className="h-5 w-5 text-amber-400" />
              <h2>3. Cookies &amp; Data Rights (LGPD / GDPR)</h2>
            </div>
            <p className="text-zinc-400">
              We use necessary HTTP-only authentication cookies for registered user sessions and browser local storage for guest mode links. You can manage your preferences or request complete account deletion at any time.
            </p>
          </Card>

          {/* Section 4 */}
          <Card id="security" className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Shield className="h-5 w-5 text-purple-400" />
              <h2>4. Encryption &amp; Security Model</h2>
            </div>
            <p className="text-zinc-400">
              All communications between your browser and our servers are encrypted via TLS. Active short links remain under your control and can be deleted from your dashboard at any time.
            </p>
          </Card>
        </div>
      </ScrollReveal>
    </div>
  );
}
