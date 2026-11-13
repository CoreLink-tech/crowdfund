import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const current = await getCurrentSession();
    if (!current) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: current.user.id,
        email: current.user.email,
        fullName: current.user.fullName,
        role: current.user.role,
        accountType: current.user.accountType,
        emailVerified: current.user.emailVerified,
      },
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
