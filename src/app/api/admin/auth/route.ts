import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, verifyAdminToken, getAdminPassword, COOKIE_NAME } from "@/lib/admin-auth";
import { verifyOrigin } from "@/lib/csrf";
import { timingSafeEqual } from "crypto";
import { z } from "zod";

const LoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Compare against self to maintain constant time, then return false
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

// POST /api/admin/auth — login
export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!safeCompare(parsed.data.password, getAdminPassword())) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createAdminToken();

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// GET /api/admin/auth — check auth status
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const valid = await verifyAdminToken(token);
  return NextResponse.json({ authenticated: valid });
}

// DELETE /api/admin/auth — logout
export async function DELETE(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
