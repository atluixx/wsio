import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  title: { absolute: "wsio — your links, one calm page" },
  description:
    "A calm, fast link-in-bio page. Put every link you share in one place, arrange it with a drag, and see what gets clicked.",
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
