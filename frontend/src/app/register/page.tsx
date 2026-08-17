import type { Metadata } from "next";
import { RegisterClient } from "@/components/RegisterClient";

export const metadata: Metadata = {
  title: "Create Free Account — wsio.",
  description: "Sign up for a free wsio account to unlock unlimited link shortening, custom aliases, and click tracking.",
  alternates: {
    canonical: "https://wsio.lol/register",
  },
  openGraph: {
    title: "Create Free Account — wsio.",
    description: "Sign up for a free wsio account to unlock unlimited link shortening, custom aliases, and click tracking.",
    url: "https://wsio.lol/register",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Free Account — wsio.",
    description: "Sign up for a free wsio account to unlock unlimited link shortening, custom aliases, and click tracking.",
  },
};

export default function RegisterPage() {
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
        "name": "Create Account",
        "item": "https://wsio.lol/register"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <RegisterClient />
    </>
  );
}
