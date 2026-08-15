import { NextResponse } from "next/server";
import crypto from "crypto";

const users: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 });
    }

    let role = "user";
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@wsio.lol";
    if (email === adminEmail.toLowerCase()) {
      role = "admin";
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      role,
    };

    users.push(newUser);

    const response = NextResponse.json(newUser, { status: 201 });
    response.cookies.set("session", newUser.id, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 500 });
  }
}
