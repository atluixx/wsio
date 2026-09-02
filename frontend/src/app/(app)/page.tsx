import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  title: { absolute: "wsio — one link, everything behind it" },
  description:
    "A link-in-bio page made with some care. Claim wsio.lol/yourname, add the links you'd otherwise send one by one, and see what gets opened.",
  alternates: { canonical: APP_URL },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${APP_URL}/#org`,
        name: "wsio",
        url: APP_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${APP_URL}/#website`,
        name: "wsio",
        url: APP_URL,
        publisher: { "@id": `${APP_URL}/#org` },
        description: "A link-in-bio page made with some care.",
      },
      {
        "@type": "SoftwareApplication",
        name: "wsio",
        applicationCategory: "WebApplication",
        operatingSystem: "Web",
        url: APP_URL,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient />
    </>
  );
}
