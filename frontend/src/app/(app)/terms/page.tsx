import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms",
  description: "The wsio terms of service and acceptable use policy.",
  alternates: { canonical: "https://wsio.lol/terms" },
  openGraph: {
    title: "Terms · wsio",
    description: "The wsio terms of service and acceptable use policy.",
    url: "https://wsio.lol/terms",
    siteName: "wsio",
    locale: "en_US",
    type: "website",
  },
};

const sections = [
  {
    h: "Acceptable use",
    p: "wsio hosts link-in-bio pages and first-party click analytics. You agree not to use it to distribute malware or phishing, send unsolicited spam or bot traffic, or infringe the intellectual-property, privacy, or legal rights of others. Pages found in violation are removed without notice.",
  },
  {
    h: "Your account",
    p: "You are responsible for keeping your credentials and session confidential. Activity under your account is your responsibility.",
  },
  {
    h: "Availability",
    p: "wsio is provided free, as is. We aim for continuous availability but don't guarantee uninterrupted service, and we may change or retire features at any time.",
  },
];

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wsio.lol" },
      { "@type": "ListItem", position: 2, name: "Terms", item: "https://wsio.lol/terms" },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <h1 className="mt-6 font-display text-3xl font-medium tracking-tight sm:text-4xl">Terms</h1>
      <p className="mt-2 text-sm text-faint">Last updated 17 August 2026</p>

      <p className="mt-8 leading-relaxed text-muted">
        By using wsio you agree to these terms. If you don&apos;t agree, please
        don&apos;t use the service.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-medium tracking-tight">{s.h}</h2>
            <p className="mt-2.5 leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
