import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "User Dashboard — wsio.",
  description: "Monitor link click telemetry, manage short URLs, generate vector QR codes, and create API keys.",
  alternates: {
    canonical: "https://wsio.lol/dashboard",
  },
  openGraph: {
    title: "User Dashboard — wsio.",
    description: "Monitor link click telemetry, manage short URLs, generate vector QR codes, and create API keys.",
    url: "https://wsio.lol/dashboard",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "User Dashboard — wsio.",
    description: "Monitor link click telemetry, manage short URLs, generate vector QR codes, and create API keys.",
  },
};

export default function DashboardPage() {
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
        "name": "Dashboard",
        "item": "https://wsio.lol/dashboard"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <DashboardClient />
    </>
  );
}
