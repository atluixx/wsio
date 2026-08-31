import Link from "next/link";
import {
  Globe,
  Mail,
  AtSign,
  Video,
  Camera,
  Music,
  ShoppingBag,
  PenLine,
  Podcast,
  MessageCircle,
  Coffee,
  Gamepad2,
  Link as LinkIcon,
  ArrowUpRight,
} from "lucide-react";
import type { PublicProfile as PublicProfileData } from "@/lib/api";
import { clickThroughUrl } from "@/lib/api";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  email: Mail,
  social: AtSign,
  video: Video,
  photos: Camera,
  music: Music,
  shop: ShoppingBag,
  writing: PenLine,
  podcast: Podcast,
  chat: MessageCircle,
  tip: Coffee,
  games: Gamepad2,
};

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

        <div className="mt-9 flex w-full flex-col gap-3">
          {profile.links.map((link) => {
            const Icon = (link.icon && ICONS[link.icon.toLowerCase()]) || LinkIcon;
            return (
              <a
                key={link.id}
                href={clickThroughUrl(link.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 px-4 py-4 text-[0.95rem] font-medium transition-transform duration-150 hover:-translate-y-0.5"
                style={{
                  background: "var(--p-card)",
                  border: "1px solid var(--p-border)",
                  borderRadius: "var(--p-radius)",
                  boxShadow: "var(--p-shadow)",
                }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate text-center">{link.label}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-30 transition-opacity group-hover:opacity-70" />
              </a>
            );
          })}

          {profile.links.length === 0 && (
            <p className="text-center text-[0.95rem]" style={{ color: "var(--p-muted)" }}>
              No links yet.
            </p>
          )}
        </div>
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
