import Link from "next/link";
import type { PublicProfile as PublicProfileData } from "@/lib/api";
import { ProfileLinks } from "@/components/ProfileLinks";

function initials(name: string, username: string): string {
  const source = (name || username).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function PublicProfile({ profile }: { profile: PublicProfileData }) {
  const name = profile.displayName || `@${profile.username}`;

  return (
    <div
      className="profile-surface flex min-h-screen w-full flex-col items-center px-5 py-16 sm:py-20"
      data-theme={profile.theme || "minimal"}
    >
      <div className="flex w-full max-w-[26rem] flex-1 flex-col items-center">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={name}
            className="h-24 w-24 rounded-full object-cover"
            style={{ border: "1px solid var(--p-border)" }}
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold"
            style={{ background: "var(--p-card)", border: "1px solid var(--p-border)" }}
          >
            {initials(profile.displayName, profile.username)}
          </div>
        )}

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
        {profile.bio && (
          <p
            className="mt-4 max-w-[22rem] text-center text-[0.95rem] leading-relaxed"
            style={{ color: "var(--p-muted)" }}
          >
            {profile.bio}
          </p>
        )}

        <ProfileLinks links={profile.links} />
      </div>

      <Link
        href="/"
        className="mt-14 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-[0.8rem] transition-opacity hover:opacity-100"
        style={{
          color: "var(--p-muted)",
          border: "1px solid var(--p-border)",
          opacity: 0.75,
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>wsio</span>
        <span>— make your own</span>
      </Link>
    </div>
  );
}
