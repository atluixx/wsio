import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";

export async function GET(req: Request) {
  try {
    const userIdHeader = req.headers.get("X-User-ID");
    const headers: Record<string, string> = {};
    if (userIdHeader) {
      headers["X-User-ID"] = userIdHeader;
    }

    const backendRes = await fetch(`${API_BASE_URL}/api/v1/stripe/subscription`, {
      headers,
      cache: "no-store",
    }).catch(() => null);

    if (backendRes && backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {}

  return NextResponse.json({
    planType: "free",
    status: "active",
  });
}
