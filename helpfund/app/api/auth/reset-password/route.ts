import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPassword, AuthError } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    await resetPassword(parsed.data.token, parsed.data.password);

    return NextResponse.json({
      success: true,
      message: "Password has been reset. You can now sign in.",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const status = err.code === "UNAUTHORIZED" ? 401 : 400;
      return NextResponse.json({ error: err.message }, { status });
    }
    console.error("[auth/reset-password]", err);
    return NextResponse.json(
      { error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
