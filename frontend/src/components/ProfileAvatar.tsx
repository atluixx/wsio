"use client";

import { useState } from "react";
import { useLanyard, discordAvatarUrl } from "@/lib/lanyard";

function initials(name: string, username: string): string {
  const source = (name || username).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

interface Props {
  avatarUrl: string;
  displayName: string;
  username: string;
  discordUserId?: string;
  useDiscordAvatar?: boolean;
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  username,
  discordUserId,
  useDiscordAvatar,
}: Props) {
  const lanyard = useLanyard(
    useDiscordAvatar && discordUserId ? discordUserId : undefined
  );
  const [failed, setFailed] = useState(false);

  const discordSrc =
    useDiscordAvatar && !failed ? discordAvatarUrl(lanyard?.discord_user) : null;
  const src = discordSrc || (!failed ? avatarUrl : "") || "";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={displayName || username}
        onError={() => setFailed(true)}
        className="h-24 w-24 rounded-full object-cover"
        style={{ border: "1px solid var(--p-border)" }}
      />
    );
  }

  return (
    <div
      className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-medium"
      style={{ background: "var(--p-card)", border: "1px solid var(--p-border)" }}
    >
      {initials(displayName, username)}
    </div>
  );
}
