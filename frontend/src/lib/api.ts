function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "https://api.wsio.lol") {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "";
}

const API_BASE_URL = getApiBaseUrl();


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

export async function createShortLink(url: string, customAlias?: string, subdomain?: string): Promise<LinkResponse> {
  try {
    const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("wsio_user") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser?.id) {
          headers["X-User-ID"] = storedUser.id;
        }
      } catch {}
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/links`, {
      method: "POST",
      headers: headers,
      credentials: "include",
      body: JSON.stringify({ url, customAlias, subdomain }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: parseErrorMessage(data, "Failed to shorten URL") };
    }
    return data;
  } catch (err: any) {
    return { error: String(err?.message || "Network error") };
  }
}

export async function deleteShortLink(code: string): Promise<{ success: boolean; error?: string }> {
  try {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/stripe/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planType }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: parseErrorMessage(data, "Failed to create checkout session") };
    }
    return data;
  } catch (err: any) {
    return { error: String(err?.message || "Network error") };
  }
}

export async function fetchApiKeys(): Promise<ApiKeyItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/keys`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/keys`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/keys/${id}`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/keys`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/keys/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) return { success: false, error: "Failed to revoke admin key" };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: String(err?.message || "Network error") };
  }
}

