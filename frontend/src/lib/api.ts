const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  role?: string;
  error?: string;
}

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  section?: string;
  position: number;
  active: boolean;
}

export interface OwnerProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  discordUserId: string;
  useDiscordAvatar: boolean;
  links: ProfileLink[];
}

export interface PublicProfileLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  section?: string;
}

export interface PublicProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  discordUserId: string;
  useDiscordAvatar: boolean;
  links: PublicProfileLink[];
}

export interface LinkAnalytics {
  profileLinkId: string;
  totalClicks: number;
  clicks24h: number;
  clicks7d: number;
  referrers: Record<string, number>;
}

export interface ProfileAnalytics {
  profileId: string;
  totalViews: number;
  views24h: number;
  views7d: number;
  totalClicks: number;
  links: { profileLinkId: string; totalClicks: number }[];
}

export interface ProfileInput {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  discordUserId?: string;
  useDiscordAvatar?: boolean;
}

export interface LinkInput {
  label: string;
  url: string;
  icon?: string;
  section?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error.message === "string") return data.error.message;
  if (typeof data.message === "string") return data.message;
  return fallback;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    return null;
  }
}

/**
 * No-JavaScript / QR fallback: this URL records a click server-side and then
 * 302s the visitor to the link target.
 */
export function clickThroughUrl(linkId: string): string {
  return `${API_BASE_URL}/api/v1/click/${linkId}`;
}

/**
 * Fire-and-forget click record for the public page. The link itself points at
 * the real destination; this just tells the backend it was opened. Uses
 * `sendBeacon` when available (survives navigation), falling back to a
 * keepalive fetch. Both are CORS "simple" requests, so no preflight.
 */
export function recordClick(linkId: string): void {
  const url = `${API_BASE_URL}/api/v1/click/${linkId}`;
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url);
      return;
    }
    void fetch(url, { method: "POST", keepalive: true, credentials: "omit" });
  } catch {
    /* a missed click count is not worth interrupting the visitor */
  }
}

// --- auth ---

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res) return { id: "", email: "", error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { id: "", email: "", error: parseErrorMessage(data, "Registration failed") };
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res) return { id: "", email: "", error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { id: "", email: "", error: parseErrorMessage(data, "Login failed") };
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const res = await apiFetch("/api/v1/auth/me");
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", { method: "POST" });
}

// --- profile (owner) ---

export type MyProfileResult =
  | { profile: OwnerProfile; missing?: false; error?: undefined }
  | { profile?: undefined; missing: true; error?: undefined }
  | { profile?: undefined; missing?: false; error: string };

export async function fetchMyProfile(): Promise<MyProfileResult> {
  const res = await apiFetch("/api/v1/me/profile");
  if (!res) return { error: "Network error" };
  if (res.status === 404) return { missing: true };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: parseErrorMessage(data, "Failed to load profile") };
  return { profile: data as OwnerProfile };
}

export async function saveMyProfile(input: ProfileInput): Promise<{ profile?: OwnerProfile; error?: string }> {
  const res = await apiFetch("/api/v1/me/profile", { method: "PUT", body: JSON.stringify(input) });
  if (!res) return { error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: parseErrorMessage(data, "Failed to save profile") };
  return { profile: data as OwnerProfile };
}

export async function createProfileLink(input: LinkInput): Promise<{ link?: ProfileLink; error?: string }> {
  const res = await apiFetch("/api/v1/me/profile/links", { method: "POST", body: JSON.stringify(input) });
  if (!res) return { error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: parseErrorMessage(data, "Failed to add link") };
  return { link: data as ProfileLink };
}

export async function updateProfileLink(
  id: string,
  patch: Partial<LinkInput> & { active?: boolean }
): Promise<{ link?: ProfileLink; error?: string }> {
  const res = await apiFetch(`/api/v1/me/profile/links/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  if (!res) return { error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: parseErrorMessage(data, "Failed to update link") };
  return { link: data as ProfileLink };
}

export async function deleteProfileLink(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await apiFetch(`/api/v1/me/profile/links/${id}`, { method: "DELETE" });
  if (!res) return { success: false, error: "Network error" };
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: parseErrorMessage(data, "Failed to delete link") };
  }
  return { success: true };
}

export async function reorderProfileLinks(orderedIds: string[]): Promise<{ links?: ProfileLink[]; error?: string }> {
  const res = await apiFetch("/api/v1/me/profile/links/reorder", {
    method: "PUT",
    body: JSON.stringify({ orderedIds }),
  });
  if (!res) return { error: "Network error" };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: parseErrorMessage(data, "Failed to reorder links") };
  return { links: data as ProfileLink[] };
}

export async function fetchProfileAnalytics(): Promise<ProfileAnalytics | null> {
  const res = await apiFetch("/api/v1/me/profile/analytics");
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

export async function fetchLinkAnalytics(id: string): Promise<LinkAnalytics | null> {
  const res = await apiFetch(`/api/v1/me/profile/links/${id}/analytics`);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

// --- profile (public) ---

export async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/profiles/${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicProfile;
  } catch {
    return null;
  }
}

export async function fetchProfileIndex(): Promise<{ username: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/profiles`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.profiles) ? data.profiles : [];
  } catch {
    return [];
  }
}

// --- reports ---

export const REPORT_REASONS = [
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "spam", label: "Spam or scam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate", label: "Hate speech" },
  { value: "adult", label: "Adult or explicit content" },
  { value: "malware", label: "Malware or phishing links" },
  { value: "other", label: "Something else" },
] as const;

export type ReportStatus = "open" | "reviewed" | "dismissed" | "actioned";

export interface ProfileReport {
  id: string;
  profileId: string;
  username: string;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
}

export async function reportProfile(
  username: string,
  reason: string,
  details: string
): Promise<{ ok: boolean; error?: string }> {
  const res = await apiFetch(`/api/v1/profiles/${encodeURIComponent(username)}/report`, {
    method: "POST",
    body: JSON.stringify({ reason, details }),
  });
  if (!res) return { ok: false, error: "Network error" };
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: parseErrorMessage(data, "Couldn't submit the report") };
  }
  return { ok: true };
}

export async function fetchReports(
  status?: ReportStatus | ""
): Promise<{ reports: ProfileReport[]; openCount: number }> {
  const qs = status ? `?status=${status}` : "";
  const res = await apiFetch(`/api/v1/admin/reports${qs}`);
  if (!res || !res.ok) return { reports: [], openCount: 0 };
  const data = await res.json().catch(() => ({}));
  return { reports: data.reports ?? [], openCount: data.openCount ?? 0 };
}

export async function updateReport(
  id: string,
  status: ReportStatus
): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/v1/admin/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return { ok: !!res && res.ok };
}
