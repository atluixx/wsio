import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How wsio handles data: a minimal, first-party processing model with no third-party ad tracking. GDPR and LGPD aligned.",
  alternates: { canonical: "https://wsio.lol/privacy" },
  openGraph: {
    title: "Privacy · wsio",
    description: "A minimal, first-party data model. No third-party ad tracking.",
    url: "https://wsio.lol/privacy",
    siteName: "wsio",
    locale: "en_US",
    type: "website",
  },
};

const sections = [
  {
    h: "No third-party ad tracking",
    p: "There are no cross-site ad trackers, behavioural cookies, or fingerprinting scripts on wsio. Link clicks are counted first-party and forward visitors straight to the destination.",
  },
  {
    h: "What we process",
    list: [
      "Profile content — username, display name, bio, avatar URL, theme, and the links you add.",
      "Account — your email address and a hashed password.",
      "Aggregate telemetry — page views and per-link click counts with referrers, for your own dashboard.",
    ],
  },
  {
    h: "Cookies and local storage",
    p: "One essential HTTP-only cookie keeps you signed in. A few lightweight UI preferences may sit in your browser's local storage and are never uploaded.",
  },
  {
    h: "Your rights",
    p: "Under GDPR and LGPD you can inspect, export, or permanently delete your account, profile, and links at any time from your dashboard.",
  },
];

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wsio.lol" },
      { "@type": "ListItem", position: 2, name: "Privacy", item: "https://wsio.lol/privacy" },
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

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Privacy
      </h1>
      <p className="mt-2 text-sm text-faint">Last updated 17 August 2026 · GDPR &amp; LGPD aligned</p>

      <p className="mt-8 leading-relaxed text-muted">
        Privacy on wsio is structural, not a setting. We process the minimum
        needed to host your page and keep you signed in, and we don&apos;t track
        people across the web or sell behavioural data.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-semibold tracking-tight">{s.h}</h2>
            {s.p && <p className="mt-2.5 leading-relaxed text-muted">{s.p}</p>}
            {s.list && (
              <ul className="mt-3 space-y-2">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-2.5 leading-relaxed text-muted">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-faint" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
