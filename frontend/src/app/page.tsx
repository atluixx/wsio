import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "wsio. — Modern URL Shortener & Link Analytics",
  description: "Transform long URLs into concise, branded short links with real-time click analytics and custom subdomains.",
  alternates: {
    canonical: "https://wsio.lol",
  },
  openGraph: {
    title: "wsio. — Modern URL Shortener & Link Analytics",
    description: "Transform long URLs into concise, branded short links with real-time click analytics and custom subdomains.",
    url: "https://wsio.lol",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio. — Modern URL Shortener & Link Analytics",
    description: "Transform long URLs into concise, branded short links with real-time click analytics and custom subdomains.",
  },
};

export default function Home() {
  const jsonLdWebSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "wsio.",
    "url": "https://wsio.lol",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://wsio.lol/l/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "wsio.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "EUR",
    },
    "description": "Fast, reliable URL shortener and link analytics platform.",
  };

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "wsio.",
    "url": "https://wsio.lol",
    "logo": "https://wsio.lol/next.svg",
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How fast is link redirection?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our global edge infrastructure redirects visitors in sub-milliseconds with optimized cache routing.",
        },
      },
      {
        "@type": "Question",
        "name": "Where can I view link analytics?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Registered users can monitor click activity, top referrers, and link performance in real time on their personal dashboard.",
        },
      },
      {
        "@type": "Question",
        "name": "What are the limits for guest users?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Guests can create up to 3 links per day. Creating a free account unlocks unlimited link shortening and persistent history.",
        },
      },
      {
        "@type": "Question",
        "name": "How do custom subdomains work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Businesses can request custom brand subdomains through our formal application process.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <HomeClient />
    </>
  );
}
