import Link from "next/link";
import type { PublicProfile as PublicProfileData } from "@/lib/api";
import { ProfileLinks } from "@/components/ProfileLinks";
import { ProfileMusic } from "@/components/ProfileMusic";
import { ProfileDiscord } from "@/components/ProfileDiscord";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export function PublicProfile({ profile }: { profile: PublicProfileData }) {
  const name = profile.displayName || `@${profile.username}`;

  return (
    <div
      className="profile-surface flex min-h-screen w-full flex-col items-center px-5 py-16 sm:py-20"
      data-theme={profile.theme || "minimal"}
    >
      <div className="flex w-full max-w-[26rem] flex-1 flex-col items-center">
        <ProfileAvatar
          avatarUrl={profile.avatarUrl}
          displayName={profile.displayName}
          username={profile.username}
          discordUserId={profile.discordUserId}
          useDiscordAvatar={profile.useDiscordAvatar}
        />

        <h1
          className="mt-6 text-center text-[1.55rem] font-semibold tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {name}
        </h1>
        {profile.displayName && (
          <p className="mt-1 text-[0.95rem]" style={{ color: "var(--p-muted)" }}>
            @{profile.username}
          </p>
        )}

        {profile.discordUserId && <ProfileDiscord userId={profile.discordUserId} />}

        {profile.bio && (
          <p
            className="mt-4 max-w-[22rem] text-center text-[0.95rem] leading-relaxed"
            style={{ color: "var(--p-muted)" }}
          >
            {profile.bio}
          </p>
        )}

        {profile.music && <ProfileMusic music={profile.music} />}

        <ProfileLinks links={profile.links} />
      </div>

      <Link
        href="/"
        className="mt-14 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-[0.8rem]"
        style={{ color: "var(--p-muted)", border: "1px solid var(--p-border)" }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>wsio</span>
        <span>— make your own</span>
      </Link>
    </div>
  );
}
