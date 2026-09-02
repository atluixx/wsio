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
  size?: "md" | "sm";
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  username,
  discordUserId,
  useDiscordAvatar,
  size = "md",
}: Props) {
  const lanyard = useLanyard(
    useDiscordAvatar && discordUserId ? discordUserId : undefined
  );
  // Remember which src failed rather than a sticky boolean, so swapping in a new
  // image (e.g. after a bad URL) clears the error on its own.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const discordSrc = useDiscordAvatar ? discordAvatarUrl(lanyard?.discord_user) : null;
  const candidate = discordSrc || avatarUrl || "";
  const src = candidate && candidate !== failedSrc ? candidate : "";
  const box = size === "sm" ? "h-20 w-20 text-xl" : "h-24 w-24 text-2xl";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={displayName || username}
        onError={() => setFailedSrc(src)}
        className={`${box} rounded-full object-cover`}
        style={{ border: "1px solid var(--p-border)" }}
      />
    );
  }

  return (
    <div
      className={`flex ${box} items-center justify-center rounded-full font-medium`}
      style={{ background: "var(--p-card)", border: "1px solid var(--p-border)" }}
    >
      {initials(displayName, username)}
    </div>
  );
}
