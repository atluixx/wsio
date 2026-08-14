const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export interface User {
  id: string;
  email: string;
}

export interface LinkItem {
  id: string;
  code: string;
  url: string;
  createdAt?: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  error?: string;
}

export interface LinkResponse {
  id?: string;
  code?: string;
  url?: string;
  error?: string;
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

export async function createShortLink(url: string): Promise<LinkResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
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
