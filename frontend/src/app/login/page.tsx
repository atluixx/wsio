import type { Metadata } from "next";
import { LoginClient } from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Sign In — wsio. Link Management",
  description: "Sign in to your wsio account to manage short links, view click telemetry, and configure API keys.",
  alternates: {
    canonical: "https://wsio.lol/login",
  },
  openGraph: {
    title: "Sign In — wsio. Link Management",
    description: "Sign in to your wsio account to manage short links, view click telemetry, and configure API keys.",
    url: "https://wsio.lol/login",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In — wsio. Link Management",
    description: "Sign in to your wsio account to manage short links, view click telemetry, and configure API keys.",
  },
};

export default function LoginPage() {
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
        "name": "Sign In",
        "item": "https://wsio.lol/login"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <LoginClient />
    </>
  );
}
