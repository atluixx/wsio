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
    "@type": "WebSite",
    name: "wsio",
    url: APP_URL,
    description: "A calm link-in-bio page with honest click analytics.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient />
    </>
  );
}
