import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchPublicProfile } from "@/lib/api";
import { PublicProfile } from "@/components/PublicProfile";

interface Props {
  params: Promise<{ username: string }>;
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol").replace(/\/$/, "");

// Fetched once per request, shared by generateMetadata and the page.
const getProfile = cache(fetchPublicProfile);

function clean(s: string, max = 200): string {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }

  const name = profile.displayName || `@${profile.username}`;
  const description = clean(profile.bio || `${name}'s links, all on one page.`);
  const url = `${APP_URL}/${profile.username}`;

  return {
    title: name,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${name} · wsio`,
      description,
      url,
      siteName: "wsio",
      type: "profile",
      username: profile.username,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} · wsio`,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) notFound();

  const name = profile.displayName || `@${profile.username}`;
  const url = `${APP_URL}/${profile.username}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name,
      alternateName: `@${profile.username}`,
      description: profile.bio || undefined,
      url,
      image:
        profile.avatarUrl && /^https?:/.test(profile.avatarUrl) ? profile.avatarUrl : undefined,
      sameAs: profile.links.map((l) => l.url),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicProfile profile={profile} />
    </>
  );
}
