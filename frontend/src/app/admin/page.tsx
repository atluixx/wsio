import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Console — wsio.",
  description: "System administrator console for telemetry, user management, API token governance, and subdomains.",
  alternates: {
    canonical: "https://wsio.lol/admin",
  },
  openGraph: {
    title: "Admin Console — wsio.",
    description: "System administrator console for telemetry, user management, API token governance, and subdomains.",
    url: "https://wsio.lol/admin",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Console — wsio.",
    description: "System administrator console for telemetry, user management, API token governance, and subdomains.",
  },
};

export default function AdminDashboardPage() {
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
        "name": "Admin Console",
        "item": "https://wsio.lol/admin"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <AdminDashboardClient />
    </>
  );
}
