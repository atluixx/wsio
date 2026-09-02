import type { ComponentType } from "react";
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
} from "lucide-react";

export type IconComponent = ComponentType<{ className?: string }>;

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

const ICONS: Record<string, IconComponent> = {
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

/** Resolve a stored icon key to a component, falling back to a generic link glyph. */
export function linkIcon(key?: string | null): IconComponent {
  return (key && ICONS[key.toLowerCase()]) || LinkIcon;
}
