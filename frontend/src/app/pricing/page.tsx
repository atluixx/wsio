import type { Metadata } from "next";
import { PricingClient } from "@/components/PricingClient";

export const metadata: Metadata = {
  title: "Pricing Plans — wsio. URL Shortener & Analytics",
  description: "Choose predictable plans for link shortening, custom domain branding, and high-rate-limit REST API access.",
  alternates: {
    canonical: "https://wsio.lol/pricing",
  },
  openGraph: {
    title: "Pricing Plans — wsio. URL Shortener & Analytics",
    description: "Choose predictable plans for link shortening, custom domain branding, and high-rate-limit REST API access.",
    url: "https://wsio.lol/pricing",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans — wsio. URL Shortener & Analytics",
    description: "Choose predictable plans for link shortening, custom domain branding, and high-rate-limit REST API access.",
  },
};

export default function PricingPage() {
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
        "name": "Pricing",
        "item": "https://wsio.lol/pricing"
      }
    ]
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What happens when I reach the guest daily limit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Guest link creation is capped at 3 links per day. You can register for a free account or upgrade to Starter for unlimited link shortening."
        }
      },
      {
        "@type": "Question",
        "name": "Can I switch or cancel my plan anytime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. You can manage or upgrade your subscription from your user dashboard at any time."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <PricingClient />
    </>
  );
}
