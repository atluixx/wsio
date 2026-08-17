function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";
}

const API_BASE_URL = getApiBaseUrl();

function getStoredUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem("wsio_user") || sessionStorage.getItem("wsio_session_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.id;
    }
  } catch {}
  return undefined;
}

export interface User {
  id: string;
  email: string;
  role?: string;
}

export interface LinkItem {
  id: string;
  code: string;
  url: string;
  subdomain?: string;
  userId?: string;
  createdAt?: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  role?: string;
  error?: string;
}

export interface LinkResponse {
  id?: string;
  code?: string;
  url?: string;
  subdomain?: string;
  userId?: string;
  error?: string;
}

export interface ApiKeyItem {
  id: string;
  keyMasked: string;
  name: string;
  planType: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt?: string;
}

function parseErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback;
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error.message === "string") return data.error.message;
  if (typeof data.message === "string") return data.message;
  return fallback;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { id: "", email: "", error: parseErrorMessage(data, "Registration failed") };
    }
    return data;
  } catch (err: any) {
    return { id: "", email: "", error: String(err?.message || "Network error") };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { id: "", email: "", error: parseErrorMessage(data, "Login failed") };
    }
    return data;
  } catch (err: any) {
    return { id: "", email: "", error: String(err?.message || "Network error") };
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createShortLink(url: string, customAlias?: string, subdomain?: string): Promise<LinkResponse> {
  try {
    const userId = getStoredUserId();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (userId) {
      headers["X-User-ID"] = userId;
    }

    let res = await fetch(`${API_BASE_URL}/api/v1/links`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({ url, customAlias, subdomain }),
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`/api/v1/links`, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ url, customAlias, subdomain }),
      }).catch(() => null);
    }

    if (res) {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: parseErrorMessage(data, "Failed to shorten URL") };
      }

      // Persist created link locally to guarantee visibility in dashboard
      if (data.code && typeof window !== "undefined") {
        try {
          const rawSaved = localStorage.getItem("wsio_saved_links");
          const existing: LinkItem[] = rawSaved ? JSON.parse(rawSaved) : [];
          const newLinkItem: LinkItem = {
            id: data.id || Math.random().toString(),
            code: data.code,
            url: data.url || url,
            subdomain: data.subdomain || subdomain,
            userId: data.userId || userId,
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          const updated = [newLinkItem, ...existing.filter((l) => l.code !== data.code)];
          localStorage.setItem("wsio_saved_links", JSON.stringify(updated));
        } catch {}
      }

      return data;
    }

    return { error: "Network error" };
  } catch (err: any) {
    return { error: String(err?.message || "Network error") };
  }
}

export async function deleteShortLink(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== "undefined") {
      try {
        const rawSaved = localStorage.getItem("wsio_saved_links");
        if (rawSaved) {
          const existing: LinkItem[] = JSON.parse(rawSaved);
          const filtered = existing.filter((l) => l.code !== code);
          localStorage.setItem("wsio_saved_links", JSON.stringify(filtered));
        }
      } catch {}
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/links/${code}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: parseErrorMessage(data, "Failed to delete link") };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: String(err?.message || "Network error") };
  }
}

export async function createCheckoutSession(planType: string): Promise<{ url?: string; error?: string }> {
  try {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      return { url: data.url };
    } else if (data.error) {
      return { error: data.error };
    }

    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://wsio.lol";
    return { url: `${appUrl}/dashboard?payment=success&plan=${planType}` };
  } catch (err: any) {
    return { error: String(err?.message || "Network error") };
  }
}

export async function fetchApiKeys(): Promise<ApiKeyItem[]> {
  try {
    const res = await fetch(`/api/keys`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createApiKey(name: string, planType?: string): Promise<{ key?: string; keyMasked?: string; id?: string; error?: string }> {
  try {
    const res = await fetch(`/api/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, planType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: parseErrorMessage(data, "Failed to generate API Key") };
    return data;
  } catch (err: any) {
    return { error: String(err?.message || "Network error") };
  }
}

export async function deleteApiKey(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/keys/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return { success: false, error: "Failed to revoke key" };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: String(err?.message || "Network error") };
  }
}

export async function fetchAdminApiKeys(): Promise<ApiKeyItem[]> {
  try {
    const res = await fetch(`/api/admin/keys`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function deleteAdminApiKey(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/keys/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return { success: false, error: "Failed to revoke admin key" };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: String(err?.message || "Network error") };
  }
}

export async function fetchUserLinks(userId?: string): Promise<LinkItem[]> {
  const activeUserId = userId || getStoredUserId();
  let serverLinks: LinkItem[] = [];

  try {
    const headers: Record<string, string> = {};
    if (activeUserId) headers["X-User-ID"] = activeUserId;

    let res = await fetch(`${API_BASE_URL}/api/v1/links`, {
      headers,
      credentials: "include",
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(`/api/v1/links`, {
        headers,
        credentials: "include",
      }).catch(() => null);
    }

    if (res && res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        serverLinks = data;
      }
    }
  } catch {}

  // Read locally saved links as fallback/supplement
  let localSavedLinks: LinkItem[] = [];
  if (typeof window !== "undefined") {
    try {
      const rawSaved = localStorage.getItem("wsio_saved_links");
      if (rawSaved) {
        localSavedLinks = JSON.parse(rawSaved);
      }
    } catch {}
  }

  // Deduplicate and merge server and local links by link code
  const linkMap = new Map<string, LinkItem>();
  for (const item of [...serverLinks, ...localSavedLinks]) {
    if (item && item.code && !linkMap.has(item.code)) {
      linkMap.set(item.code, item);
    }
  }

  return Array.from(linkMap.values());
}

export async function fetchUserSubscription(userId?: string): Promise<{ planType?: string; status?: string } | null> {
  try {
    const activeUserId = userId || getStoredUserId();
    const headers: Record<string, string> = {};
    if (activeUserId) headers["X-User-ID"] = activeUserId;

    let res = await fetch(`${API_BASE_URL}/api/v1/stripe/subscription`, {
      headers,
      credentials: "include",
    }).catch(() => null);

    if (res && res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}
