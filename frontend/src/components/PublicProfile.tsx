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
  return (
    <div
      className="profile-surface min-h-screen w-full"
      data-theme={profile.theme || "minimal"}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-16">
        {/* Avatar */}
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || profile.username}
            className="h-24 w-24 rounded-full object-cover"
            style={{ border: "1px solid var(--profile-border)" }}
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold"
            style={{
              background: "var(--profile-card)",
              border: "1px solid var(--profile-border)",
            }}
          >
            {initials(profile.displayName, profile.username)}
          </div>
        )}

        <h1 className="mt-5 text-center text-xl font-bold tracking-tight">
          {profile.displayName || `@${profile.username}`}
        </h1>
        {profile.displayName && (
          <p className="mt-0.5 text-sm" style={{ color: "var(--profile-muted)" }}>
            @{profile.username}
          </p>
        )}
        {profile.bio && (
          <p
            className="mt-3 max-w-sm text-center text-sm leading-relaxed"
            style={{ color: "var(--profile-muted)" }}
          >
            {profile.bio}
          </p>
        )}

        {/* Links */}
        <div className="mt-8 flex w-full flex-col gap-3">
          {profile.links.map((link) => {
            const Icon = (link.icon && ICONS[link.icon.toLowerCase()]) || LinkIcon;
            return (
              <a
                key={link.id}
                href={clickThroughUrl(link.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors"
                style={{
                  background: "var(--profile-card)",
                  border: "1px solid var(--profile-border)",
                  borderRadius: "var(--profile-radius)",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{link.label}</span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
                />
              </a>
            );
          })}

          {profile.links.length === 0 && (
            <p className="text-center text-sm" style={{ color: "var(--profile-muted)" }}>
              No links yet.
            </p>
          )}
        </div>

        <div className="flex-1" />

        <Link
          href="/"
          className="mt-12 text-xs transition-opacity hover:opacity-100"
          style={{ color: "var(--profile-muted)", opacity: 0.7 }}
        >
          made with wsio<span>.</span>
        </Link>
      </div>
    </div>
  );
}
