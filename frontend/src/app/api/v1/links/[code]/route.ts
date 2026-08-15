import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  try {
    const backendRes = await fetch(`${API_BASE_URL}/api/v1/links/${code}?json=true`, {
      headers: { Accept: "application/json" },
    }).catch(() => null);

    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }

    if (backendRes && backendRes.status === 404) {
      return NextResponse.json({ error: "link not found" }, { status: 404 });
    }
  } catch (e) {
    console.error("Backend link resolution failed:", e);
  }

  return NextResponse.json({ error: "link not found" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    const authHeader = req.headers.get("Authorization");
    const userIdHeader = req.headers.get("X-User-ID");
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;
    if (userIdHeader) headers["X-User-ID"] = userIdHeader;

    const backendRes = await fetch(`${API_BASE_URL}/api/v1/links/${code}`, {
      method: "DELETE",
      headers,
    }).catch(() => null);

    if (backendRes) {
      return new NextResponse(null, { status: backendRes.status });
    }
  } catch {}

  return new NextResponse(null, { status: 204 });
}
