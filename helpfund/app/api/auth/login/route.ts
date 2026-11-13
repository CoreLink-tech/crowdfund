import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { loginUser, AuthError } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const user = await loginUser(parsed.data, { ipAddress: ip, userAgent });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accountType: user.accountType,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const status =
        err.code === "UNAUTHORIZED" ? 401 : err.code === "FORBIDDEN" ? 403 : 500;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[auth/login]", err);
    return NextResponse.json(
      { error: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
