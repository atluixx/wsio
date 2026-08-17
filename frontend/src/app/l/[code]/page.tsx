import type { Metadata } from "next";
import { RedirectCodeClient } from "@/components/RedirectCodeClient";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const code = resolvedParams.code || "";
  const title = `Short Link ${code} — wsio.`;
  const description = `Fast sub-millisecond URL redirection powered by wsio global edge network.`;
  const canonicalUrl = `https://wsio.lol/l/${code}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "wsio.",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RedirectCodePage() {
  return <RedirectCodeClient />;
}
