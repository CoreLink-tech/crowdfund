import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { registerUser, AuthError } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await registerUser(parsed.data, { ipAddress: ip, userAgent });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.userId,
          email: result.email,
        },
        // Only expose verification token in development for testing
        ...(process.env.NODE_ENV === "development" && {
          verificationToken: result.verificationToken,
        }),
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      const status =
        err.code === "CONFLICT" ? 409 : err.code === "VALIDATION" ? 400 : 500;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[auth/register]", err);
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 }
    );
  }
}
