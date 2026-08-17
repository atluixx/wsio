import type { Metadata } from "next";
import { AdminKeysClient } from "@/components/AdminKeysClient";

export const metadata: Metadata = {
  title: "API Key Governance — wsio. Admin",
  description: "Manage system API access tokens and SHA-256 API keys across workspace tiers.",
  alternates: {
    canonical: "https://wsio.lol/admin/keys",
  },
  openGraph: {
    title: "API Key Governance — wsio. Admin",
    description: "Manage system API access tokens and SHA-256 API keys across workspace tiers.",
    url: "https://wsio.lol/admin/keys",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Key Governance — wsio. Admin",
    description: "Manage system API access tokens and SHA-256 API keys across workspace tiers.",
  },
};

export default function AdminKeysPage() {
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
        "name": "Admin",
        "item": "https://wsio.lol/admin"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "API Keys",
        "item": "https://wsio.lol/admin/keys"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <AdminKeysClient />
    </>
  );
}
