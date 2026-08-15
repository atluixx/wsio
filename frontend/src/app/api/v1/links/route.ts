import { NextResponse } from "next/server";
import crypto from "crypto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export async function GET() {
  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/v1/links`).catch(() => null);
    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {}
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url;

    if (!rawUrl) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const userIdHeader = req.headers.get("X-User-ID");
    if (userIdHeader) {
      headers["X-User-ID"] = userIdHeader;
    }

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Proxy link creation to Go Backend database
    const backendRes = await fetch(`${API_BASE_URL}/api/v1/links`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }).catch(() => null);

    if (backendRes) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Fallback link creation if backend is unreachable
    const customAlias = (body.customAlias || "").trim().toLowerCase();
    const subdomain = (body.subdomain || "").trim().toLowerCase();
    const code = customAlias || crypto.createHash("md5").update(rawUrl + Date.now()).digest("hex").substring(0, 6);

    const newLink = {
      id: crypto.randomUUID(),
      code,
      url: rawUrl,
      subdomain,
      userId: userIdHeader || undefined,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newLink, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create short link" }, { status: 500 });
  }
}
