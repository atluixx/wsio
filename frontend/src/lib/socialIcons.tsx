import { FaLinkedin } from "react-icons/fa6";
import {
  SiApplemusic,
  SiBehance,
  SiBluesky,
  SiBuymeacoffee,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiGithub,
  SiGumroad,
  SiInstagram,
  SiKofi,
  SiMedium,
  SiPatreon,
  SiPinterest,
  SiReddit,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { linkIcon, LINK_ICON_KEYS, type IconComponent } from "@/lib/linkIcons";

/** Brand-specific icons, keyed the same way as ProfileLink.icon can be. */
const BRAND: Record<string, IconComponent> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  x: SiX,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  github: SiGithub,
  linkedin: FaLinkedin,
  twitch: SiTwitch,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  discord: SiDiscord,
  telegram: SiTelegram,
  whatsapp: SiWhatsapp,
  threads: SiThreads,
  bluesky: SiBluesky,
  pinterest: SiPinterest,
  reddit: SiReddit,
  snapchat: SiSnapchat,
  substack: SiSubstack,
  medium: SiMedium,
  patreon: SiPatreon,
  kofi: SiKofi,
  buymeacoffee: SiBuymeacoffee,
  gumroad: SiGumroad,
  dribbble: SiDribbble,
  behance: SiBehance,
};

export const SOCIAL_KEYS = Object.keys(BRAND);

// host (matched against the full lowercased hostname) -> brand key
const HOST_RULES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$|(^|\.)instagr\.am$/, "instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$/, "facebook"],
  [/(^|\.)twitter\.com$|(^|\.)x\.com$/, "x"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "youtube"],
  [/(^|\.)github\.(com|io)$/, "github"],
  [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, "linkedin"],
  [/(^|\.)twitch\.tv$/, "twitch"],
  [/(^|\.)music\.apple\.com$/, "applemusic"],
  [/(^|\.)spotify\.com$/, "spotify"],
  [/(^|\.)soundcloud\.com$/, "soundcloud"],
  [/(^|\.)discord\.(gg|com)$|(^|\.)discordapp\.com$/, "discord"],
  [/(^|\.)t\.me$|(^|\.)telegram\.(me|org)$/, "telegram"],
  [/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/, "whatsapp"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)bsky\.app$/, "bluesky"],
  [/(^|\.)pinterest\.[a-z.]+$/, "pinterest"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)snapchat\.com$/, "snapchat"],
  [/(^|\.)substack\.com$/, "substack"],
  [/(^|\.)medium\.com$/, "medium"],
  [/(^|\.)patreon\.com$/, "patreon"],
  [/(^|\.)ko-fi\.com$/, "kofi"],
  [/(^|\.)buymeacoffee\.com$|(^|\.)bmc\.link$/, "buymeacoffee"],
  [/(^|\.)gumroad\.com$/, "gumroad"],
  [/(^|\.)dribbble\.com$/, "dribbble"],
  [/(^|\.)behance\.net$/, "behance"],
];

/** Best-guess brand key for a link URL, or null if it isn't a known platform. */
export function detectSocial(rawUrl: string): string | null {
  const raw = (rawUrl || "").trim().toLowerCase();
  if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("sms:")) {
    return null;
  }
  let host: string;
  try {
    host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
  } catch {
    return null;
  }
  for (const [re, key] of HOST_RULES) {
    if (re.test(host)) return key;
  }
  return null;
}

const GENERIC_KEYS = new Set<string>(LINK_ICON_KEYS);

/**
 * The icon to show for a link. An explicit `icon` the owner picked always wins;
 * otherwise the platform is detected from the URL, falling back to a generic
 * glyph (mail for mailto:, phone for tel:, a link otherwise).
 */
export function resolveLinkIcon(link: { url: string; icon?: string | null }): IconComponent {
  const explicit = (link.icon ?? "").toLowerCase().trim();
  if (explicit) {
    if (BRAND[explicit]) return BRAND[explicit];
    if (GENERIC_KEYS.has(explicit)) return linkIcon(explicit);
  }

  const social = detectSocial(link.url);
  if (social) return BRAND[social];

  const u = (link.url ?? "").trim().toLowerCase();
  if (u.startsWith("mailto:")) return linkIcon("email");
  if (u.startsWith("tel:") || u.startsWith("sms:")) return linkIcon("phone");
  return linkIcon(explicit);
}
