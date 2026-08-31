import type { Metadata } from "next";
import { HomeClient } from "@/components/HomeClient";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  title: { absolute: "wsio. — One link for everything you do" },
  description:
    "Build a clean, fast link-in-bio page. One link for your socials, work, and everything you share — with real click analytics.",
  alternates: { canonical: APP_URL },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "wsio.",
    url: APP_URL,
    description: "Link-in-bio pages with click analytics.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClient />
    </>
  );
}
