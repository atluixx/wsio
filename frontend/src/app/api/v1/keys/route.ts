import { NextResponse } from "next/server";
import crypto from "crypto";

// Memory storage fallback for API keys
const inMemoryKeys: any[] = [];

export async function GET() {
  return NextResponse.json(inMemoryKeys);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || "API Key";
    const planType = body.planType || "starter";

    const rawSecret = "wsio_live_" + crypto.randomBytes(16).toString("hex");
    const keyHash = crypto.createHash("sha256").update(rawSecret).digest("hex");
    const keyMasked = "wsio_live_..." + rawSecret.slice(-6);

    let days = 90;
    if (planType === "diamond") days = 365;
    if (planType === "guest") days = 7;

    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const apiKeyItem = {
      id: crypto.randomUUID(),
      keyHash,
      keyMasked,
      name,
      planType,
      expiresAt,
      createdAt,
    };

    inMemoryKeys.unshift(apiKeyItem);

    return NextResponse.json({
      id: apiKeyItem.id,
      key: rawSecret, // Plaintext returned ONCE
      keyMasked: apiKeyItem.keyMasked,
      name: apiKeyItem.name,
      planType: apiKeyItem.planType,
      expiresAt: apiKeyItem.expiresAt,
      createdAt: apiKeyItem.createdAt,
      message: "Save this API key safely! It will NOT be shown again.",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate key" }, { status: 500 });
  }
}
