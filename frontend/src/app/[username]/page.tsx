import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicProfile } from "@/lib/api";
import { PublicProfile } from "@/components/PublicProfile";

interface Props {
  params: Promise<{ username: string }>;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);

  if (!profile) {
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }

  const name = profile.displayName || `@${profile.username}`;
  const description = profile.bio || `${name}'s links, all in one place.`;
  const url = `${APP_URL}/${profile.username}`;

  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: name,
      description,
      url,
      siteName: "wsio.",
      type: "profile",
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
    twitter: {
      card: "summary",
      title: name,
      description,
      images: profile.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);

  if (!profile) notFound();

  return <PublicProfile profile={profile} />;
}
