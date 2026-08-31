import type { Metadata } from "next";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service — wsio.",
  description: "Read the wsio terms of service and acceptable use policy.",
  alternates: {
    canonical: "https://wsio.lol/terms",
  },
  openGraph: {
    title: "Terms of Service — wsio.",
    description: "Read the wsio terms of service and acceptable use policy.",
    url: "https://wsio.lol/terms",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — wsio.",
    description: "Read the wsio terms of service and acceptable use policy.",
  },
};

export default function TermsPage() {
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
        "name": "Terms of Service",
        "item": "https://wsio.lol/terms"
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
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            Last updated: August 17, 2026
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="prose prose-invert prose-zinc max-w-none text-xs sm:text-sm leading-relaxed space-y-8 text-zinc-300">
          <p>
            By accessing or using <strong>wsio.</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use the platform.
          </p>

          <section className="space-y-3 pt-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              1. Service Overview &amp; Acceptable Use
            </h2>
            <p className="text-zinc-400">
              wsio provides hosted link-in-bio pages and link click analytics. You strictly agree not to use wsio to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Distribute malware, ransomware, phishing, or deceptive software payloads.</li>
              <li>Send unsolicited commercial spam or automated bot traffic.</li>
              <li>Infringe upon intellectual property, privacy, or legal rights of third parties.</li>
            </ul>
            <p className="text-zinc-400">
              Links detected in violation of our acceptable use policies will be terminated immediately without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              2. Account Responsibilities
            </h2>
            <p className="text-zinc-400">
              You are responsible for maintaining the confidentiality of your account credentials and session. Any activity initiated under your account remains your responsibility.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/10 pb-2">
              3. Service Availability
            </h2>
            <p className="text-zinc-400">
              wsio is provided free of charge on an &ldquo;as is&rdquo; basis. We strive for continuous availability but do not guarantee uninterrupted service, and we may modify or discontinue features at any time.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}

