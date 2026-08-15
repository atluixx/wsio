import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return NextResponse.json({
    code,
    totalClicks: 1,
    clicks24h: 1,
    clicks7d: 1,
    referrers: { "Direct / Unknown": 1 },
  });
}
