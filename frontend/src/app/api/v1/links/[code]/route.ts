import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return NextResponse.json({ code, message: "redirection active" });
}

export async function DELETE() {
  return new NextResponse(null, { status: 204 });
}
