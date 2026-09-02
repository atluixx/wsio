import { ArrowUpRight } from "lucide-react";
import type { OwnerProfile } from "@/lib/api";
import { resolveLinkIcon } from "@/lib/socialIcons";
import { groupLinks } from "@/lib/linkSections";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileDiscord } from "@/components/ProfileDiscord";

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
  // Only wire up Lanyard once the id looks like a real snowflake, so we don't
  // open a socket for every keystroke while it's being typed.
  const discordId = /^\d{17,20}$/.test(profile.discordUserId) ? profile.discordUserId : "";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[340px] rounded-[2.2rem] border border-[var(--color-control-border)] bg-[#211d16] p-2.5 shadow-[0_28px_60px_-24px_rgba(28,25,19,0.4)]">
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
              <ProfileAvatar
                avatarUrl={profile.avatarUrl}
                displayName={profile.displayName}
                username={profile.username}
                discordUserId={discordId}
                useDiscordAvatar={profile.useDiscordAvatar}
                size="sm"
              />

              <h2
                className="mt-5 text-center text-[1.35rem] font-medium tracking-[-0.01em]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </h2>
              {profile.displayName && (
                <p className="mt-1 text-[0.85rem]" style={{ color: "var(--p-muted)" }}>
                  @{profile.username}
                </p>
              )}

              {discordId && <ProfileDiscord userId={discordId} />}

              {profile.bio && (
                <p
                  className="mt-3 max-w-[20rem] text-center text-[0.85rem] leading-relaxed"
                  style={{ color: "var(--p-muted)" }}
                >
                  {profile.bio}
                </p>
              )}

              <div className="mt-7 flex w-full flex-col gap-6">
                {links.length === 0 ? (
                  <p className="text-center text-[0.85rem]" style={{ color: "var(--p-muted)" }}>
                    No links yet.
                  </p>
                ) : (
                  groupLinks(links).map((group) => (
                    <div key={group.title || "_"} className="flex w-full flex-col gap-2.5">
                      {group.title && (
                        <span
                          className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
                          style={{ color: "var(--p-muted)" }}
                        >
                          {group.title}
                        </span>
                      )}
                      {group.links.map((link) => {
                        const Icon = resolveLinkIcon(link);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-3.5 py-3.5 text-[0.85rem] font-medium transition-transform hover:-translate-y-0.5"
                            style={{
                              background: "var(--p-card)",
                              border: "1px solid var(--p-border)",
                              borderRadius: "var(--p-radius)",
                              boxShadow: "var(--p-shadow)",
                              color: "inherit",
                            }}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1 truncate text-center">{link.label}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-30" />
                          </a>
                        );
                      })}
                    </div>
                  ))
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
