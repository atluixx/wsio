import type { CSSProperties } from "react";

function relLuminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/**
 * Inline `--p-*` overrides for a profile that has picked a custom background
 * colour. Text, cards and borders are derived so any colour stays legible, and
 * `textured` flags the paper-grain overlay.
 */
export function surfaceStyle(color?: string | null): {
  style: CSSProperties;
  textured: boolean;
} {
  const hex = (color ?? "").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return { style: {}, textured: false };
  }

  const light = relLuminance(hex) > 0.42; // dark text reads well on it
  const vars: Record<string, string> = light
    ? {
        "--p-bg": hex,
        "--p-fg": "#1c1913",
        "--p-muted": "rgba(28,25,19,0.64)",
        "--p-card": "rgba(255,255,255,0.72)",
        "--p-card-hover": "rgba(255,255,255,0.9)",
        "--p-border": "rgba(28,25,19,0.12)",
        "--p-shadow": "0 1px 2px rgba(28,25,19,0.06)",
      }
    : {
        "--p-bg": hex,
        "--p-fg": "#f5f2ec",
        "--p-muted": "rgba(245,242,236,0.68)",
        "--p-card": "rgba(255,255,255,0.08)",
        "--p-card-hover": "rgba(255,255,255,0.14)",
        "--p-border": "rgba(255,255,255,0.16)",
        "--p-shadow": "none",
      };

  return { style: vars as CSSProperties, textured: true };
}
