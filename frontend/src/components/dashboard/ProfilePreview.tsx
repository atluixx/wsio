import { ArrowUpRight, Music2 } from "lucide-react";
import type { OwnerProfile } from "@/lib/api";
import { linkIcon } from "@/lib/linkIcons";

function initials(name: string, username: string): string {
  const source = (name || username).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

interface Props {
  profile: OwnerProfile;
  publicUrl: string;
}

/**
 * Non-interactive, faithful rendering of the visitor-facing page. Shares the
 * `.profile-surface` theme tokens with the real profile so the dashboard shows
 * exactly what will ship.
 */
export function ProfilePreview({ profile, publicUrl }: Props) {
  const name = profile.displayName || `@${profile.username}`;
  const links = profile.links.filter((l) => l.active);
  const host = publicUrl.replace(/^https?:\/\//, "");

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[340px] rounded-[2.2rem] border border-[var(--color-control-border)] bg-[#232019] p-2.5 shadow-[0_28px_60px_-24px_rgba(23,21,15,0.45)]">
        <div className="overflow-hidden rounded-[1.7rem] bg-white">
          <div className="flex items-center gap-2 border-b border-line bg-canvas px-3.5 py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-line-strong" />
            <span className="truncate text-[11px] text-faint">{host}</span>
          </div>

          <div className="h-[540px] overflow-y-auto">
            <div
              className="profile-surface flex min-h-full flex-col items-center px-5 py-10"
              data-theme={profile.theme || "minimal"}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover"
                  style={{ border: "1px solid var(--p-border)" }}
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold"
                  style={{ background: "var(--p-card)", border: "1px solid var(--p-border)" }}
                >
                  {initials(profile.displayName, profile.username)}
                </div>
              )}

              <h2
                className="mt-5 text-center text-[1.35rem] font-semibold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </h2>
              {profile.displayName && (
                <p className="mt-1 text-[0.85rem]" style={{ color: "var(--p-muted)" }}>
                  @{profile.username}
                </p>
              )}

              {profile.bio && (
                <p
                  className="mt-3 max-w-[20rem] text-center text-[0.85rem] leading-relaxed"
                  style={{ color: "var(--p-muted)" }}
                >
                  {profile.bio}
                </p>
              )}

              {profile.music && (
                <div
                  className="mt-6 flex w-full items-center gap-2.5 rounded-[var(--p-radius)] px-2.5 py-2.5"
                  style={{
                    background: "var(--p-card)",
                    border: "1px solid var(--p-border)",
                    boxShadow: "var(--p-shadow)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--p-radius)-6px)]"
                    style={{ background: "var(--p-card-hover)" }}
                  >
                    {profile.music.artworkUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.music.artworkUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Music2 className="h-4 w-4" style={{ color: "var(--p-muted)" }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.8rem] font-medium">
                      {profile.music.title || "Featured track"}
                    </div>
                    <div
                      className="text-[0.62rem] uppercase tracking-[0.1em]"
                      style={{ color: "var(--p-muted)" }}
                    >
                      {profile.music.kind}
                    </div>
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "var(--p-fg)", color: "var(--p-bg)" }}
                  >
                    <span className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent" style={{ borderLeftColor: "var(--p-bg)" }} />
                  </div>
                </div>
              )}

              <div className="mt-7 flex w-full flex-col gap-2.5">
                {links.length === 0 ? (
                  <p className="text-center text-[0.85rem]" style={{ color: "var(--p-muted)" }}>
                    No links yet.
                  </p>
                ) : (
                  links.map((link) => {
                    const Icon = linkIcon(link.icon);
                    return (
                      <div
                        key={link.id}
                        className="flex items-center gap-3 px-3.5 py-3.5 text-[0.85rem] font-medium"
                        style={{
                          background: "var(--p-card)",
                          border: "1px solid var(--p-border)",
                          borderRadius: "var(--p-radius)",
                          boxShadow: "var(--p-shadow)",
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate text-center">{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-faint">Live preview — this is your public page</p>
    </div>
  );
}
