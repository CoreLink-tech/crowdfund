import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/services/donations";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")
    || request.nextUrl.searchParams.get("trxref");

  const appUrl = process.env.APP_URL || request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/explore?donate=missing_ref`);
  }

  try {
    await verifyPaystackPayment(reference);
    return NextResponse.redirect(`${appUrl}/explore?donate=success`);
  } catch (err) {
    console.error("[paystack callback]", err);
    return NextResponse.redirect(`${appUrl}/explore?donate=failed`);
  }
}
