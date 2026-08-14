import { LinkItem } from "./api";

const GUEST_LINKS_KEY = "wsio_guest_links";

export function getGuestLinks(): LinkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_LINKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveGuestLink(link: LinkItem): LinkItem[] {
  const current = getGuestLinks();
  // Avoid duplicates by code
  const filtered = current.filter((l) => l.code !== link.code);
  const updated = [link, ...filtered];
  try {
    localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save guest link to localStorage", e);
  }
  return updated;
}

export function removeGuestLink(code: string): LinkItem[] {
  const current = getGuestLinks();
  const updated = current.filter((l) => l.code !== code);
  try {
    localStorage.setItem(GUEST_LINKS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove guest link from localStorage", e);
  }
  return updated;
}

export function generateGuestHash(rawUrl: string): string {
  try {
    const cleanUrl = rawUrl.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    let hash = 0;
    for (let i = 0; i < cleanUrl.length; i++) {
      hash = (hash << 5) - hash + cleanUrl.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash).toString(36);
    const randomSalt = Math.random().toString(36).substring(2, 6);
    return (positiveHash + randomSalt).substring(0, 8);
  } catch (e) {
    return Math.random().toString(36).substring(2, 10);
  }
}

export function normalizeUrl(url: string): string {
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }
  return trimmed;
}
