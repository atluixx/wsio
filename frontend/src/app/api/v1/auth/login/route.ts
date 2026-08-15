import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    // Proxy login request to Go Backend database
    const backendRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);

    if (backendRes) {
      const data = await backendRes.json().catch(() => ({}));
      const response = NextResponse.json(data, { status: backendRes.status });

      const setCookieHeader = backendRes.headers.get("Set-Cookie");
      if (setCookieHeader) {
        response.headers.set("Set-Cookie", setCookieHeader);
      }
      return response;
    }

    // Fallback if backend is unreachable
    let role = "user";
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@wsio.lol";
    if (email === adminEmail.toLowerCase()) {
      role = "admin";
    }

    const crypto = await import("crypto");
    const userObj = {
      id: crypto.randomUUID(),
      email,
      role,
    };

    const response = NextResponse.json(userObj);
    response.cookies.set("session", userObj.id, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}
