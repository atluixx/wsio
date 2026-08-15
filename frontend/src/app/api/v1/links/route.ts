import { NextResponse } from "next/server";
import crypto from "crypto";

const linksStore: any[] = [];

export async function GET() {
  return NextResponse.json(linksStore);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url;
    const customAlias = (body.customAlias || "").trim().toLowerCase();
    const subdomain = (body.subdomain || "").trim().toLowerCase();

    if (!rawUrl) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    let code = customAlias;
    if (!code) {
      code = crypto.createHash("md5").update(rawUrl + Date.now()).digest("hex").substring(0, 6);
    } else {
      const existing = linksStore.find((l) => l.code === code);
      if (existing) {
        return NextResponse.json({ error: "custom alias already in use" }, { status: 409 });
      }
    }

    const userIdHeader = req.headers.get("X-User-ID");

    const newLink = {
      id: crypto.randomUUID(),
      code,
      url: rawUrl,
      subdomain,
      userId: userIdHeader || undefined,
      createdAt: new Date().toISOString(),
    };

    linksStore.unshift(newLink);

    return NextResponse.json(newLink, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create short link" }, { status: 500 });
  }
}
