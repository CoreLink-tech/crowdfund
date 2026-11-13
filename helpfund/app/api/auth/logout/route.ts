import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/services/auth";

export async function POST() {
  try {
    await logoutUser();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[auth/logout]", err);
    return NextResponse.json(
      { error: "Unable to sign out." },
      { status: 500 }
    );
  }
}
