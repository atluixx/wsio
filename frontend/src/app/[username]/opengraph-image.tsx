import { ImageResponse } from "next/og";
import { fetchPublicProfile } from "@/lib/api";

export const alt = "wsio profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const THEMES: Record<
  string,
  { bg: string; fg: string; muted: string; card: string; border: string; accent: string }
> = {
  minimal: { bg: "#faf9f5", fg: "#1c1913", muted: "#57524a", card: "#fffdf8", border: "#e2ded1", accent: "#a13a1e" },
  midnight: { bg: "#0e0f13", fg: "#f2f3f7", muted: "#a8adba", card: "#17181d", border: "#2a2c34", accent: "#e0894f" },
  paper: { bg: "#f3efe6", fg: "#26221a", muted: "#625b4c", card: "#fffdf7", border: "#ddd5c3", accent: "#a13a1e" },
  sunset: { bg: "#1b1016", fg: "#ffece2", muted: "#e0b3a2", card: "#271820", border: "#432c38", accent: "#ff9d6b" },
};

function initials(source: string): string {
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase() || "?";
}

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:woff2?|truetype|opentype)'\)/)?.[1];
    if (!src) return null;
    return await (await fetch(src)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await fetchPublicProfile(username);
  const t = THEMES[profile?.theme ?? "minimal"] ?? THEMES.minimal;

  const name = profile?.displayName || `@${username}`;
  const handle = `@${profile?.username ?? username}`;
  const bioRaw = profile?.bio ?? "";
  const bio = bioRaw.length > 150 ? `${bioRaw.slice(0, 149).trimEnd()}…` : bioRaw;
  const address = `wsio.lol/${profile?.username ?? username}`;
  const avatar = profile?.avatarUrl && /^(https?:|data:image\/)/.test(profile.avatarUrl)
    ? profile.avatarUrl
    : null;

  const glyphs = `${name}${handle}${bio}${address}wsio.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?@#&/:—–-'"()`;
  const [serif, sans] = await Promise.all([
    loadFont("Newsreader", 500, glyphs),
    loadFont("Inter", 400, glyphs),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 500; style: "normal" }[] = [];
  if (serif) fonts.push({ name: "Newsreader", data: serif, weight: 500, style: "normal" });
  if (sans) fonts.push({ name: "Inter", data: sans, weight: 400, style: "normal" });

  const display = serif ? "Newsreader" : sans ? "Inter" : "sans-serif";
  const body = sans ? "Inter" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: t.bg,
          color: t.fg,
          fontFamily: body,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {avatar ? (
            <img
              src={avatar}
              width={168}
              height={168}
              style={{ borderRadius: 999, objectFit: "cover", border: `2px solid ${t.border}` }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: 168,
                height: 168,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: t.card,
                border: `2px solid ${t.border}`,
                fontSize: 56,
                fontFamily: display,
                color: t.muted,
              }}
            >
              {initials(name.replace(/^@/, ""))}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontFamily: display, fontSize: 64, lineHeight: 1.05 }}>
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 30, color: t.muted }}>{handle}</div>
          </div>
        </div>

        {bio ? (
          <div style={{ display: "flex", fontSize: 34, lineHeight: 1.4, color: t.muted, maxWidth: 960 }}>
            {bio}
          </div>
        ) : (
          <div style={{ display: "flex" }} />
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 30, color: t.fg }}>{address}</div>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: display, fontSize: 34 }}>
            wsio
            <span style={{ color: t.accent }}>.</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
