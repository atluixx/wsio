import { LinkItem } from "./api";

const GUEST_LINKS_KEY = "wsio_guest_links";
const GUEST_USAGE_KEY = "wsio_guest_usage_track";
export const GUEST_DAILY_LIMIT = 3;

export function getGuestLinks(userId?: string): LinkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = userId ? `wsio_user_links_${userId}` : GUEST_LINKS_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveGuestLink(link: LinkItem, userId?: string): LinkItem[] {
  const targetUserId = userId || link.userId;
  const current = getGuestLinks(targetUserId);
  const filtered = current.filter((l) => l.code !== link.code);
  const updated = [link, ...filtered];
  try {
    const key = targetUserId ? `wsio_user_links_${targetUserId}` : GUEST_LINKS_KEY;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save guest link to localStorage", e);
  }
  return updated;
}

export function removeGuestLink(code: string, userId?: string): LinkItem[] {
  const current = getGuestLinks(userId);
  const updated = current.filter((l) => l.code !== code);
  try {
    const key = userId ? `wsio_user_links_${userId}` : GUEST_LINKS_KEY;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to remove guest link from localStorage", e);
  }
  return updated;
}

export function getGuestDailyUsage(): { count: number; date: string } {
  if (typeof window === "undefined") return { count: 0, date: "" };
  const today = new Date().toISOString().split("T")[0];
  try {
    const raw = localStorage.getItem(GUEST_USAGE_KEY);
    if (!raw) return { count: 0, date: today };
    const parsed = JSON.parse(raw);
    if (parsed.date !== today) {
      return { count: 0, date: today };
    }
    return parsed;
  } catch (e) {
    return { count: 0, date: today };
  }
}

export function incrementGuestDailyUsage(): number {
  const today = new Date().toISOString().split("T")[0];
  const current = getGuestDailyUsage();
  const newCount = current.date === today ? current.count + 1 : 1;
  try {
    localStorage.setItem(GUEST_USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  } catch (e) {}
  return newCount;
}

export function isGuestLimitReached(): boolean {
  const usage = getGuestDailyUsage();
  return usage.count >= GUEST_DAILY_LIMIT;
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
