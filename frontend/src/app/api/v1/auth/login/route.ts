import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    let role = "user";
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@wsio.lol";
    if (email === adminEmail.toLowerCase()) {
      role = "admin";
    }

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
