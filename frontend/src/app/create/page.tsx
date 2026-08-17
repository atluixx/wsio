import type { Metadata } from "next";
import { CreateLinkClient } from "@/components/CreateLinkClient";

export const metadata: Metadata = {
  title: "Create Short Link — wsio.",
  description: "Shorten long web addresses instantly with optional custom slugs and vector QR codes.",
  alternates: {
    canonical: "https://wsio.lol/create",
  },
  openGraph: {
    title: "Create Short Link — wsio.",
    description: "Shorten long web addresses instantly with optional custom slugs and vector QR codes.",
    url: "https://wsio.lol/create",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Short Link — wsio.",
    description: "Shorten long web addresses instantly with optional custom slugs and vector QR codes.",
  },
};

export default function CreatePage() {
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
        "name": "Create Short Link",
        "item": "https://wsio.lol/create"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <CreateLinkClient />
    </>
  );
}
