/** Shared icon vocabulary for profile links. Keys are stored on ProfileLink.icon. */
export const LINK_ICON_KEYS = [
  "website",
  "email",
  "social",
  "video",
  "photos",
  "music",
  "shop",
  "writing",
  "podcast",
  "chat",
  "tip",
  "games",
] as const;

export type LinkIconKey = (typeof LINK_ICON_KEYS)[number];
