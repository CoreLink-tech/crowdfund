import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { createPasswordResetToken, AuthError } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await createPasswordResetToken(parsed.data.email);

    // Always return success to avoid email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account exists with that email, a password reset link has been prepared.",
      // Only expose token in development
      ...(process.env.NODE_ENV === "development" && result.token
        ? { resetToken: result.token }
        : {}),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[auth/forgot-password]", err);
    return NextResponse.json(
      { error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
