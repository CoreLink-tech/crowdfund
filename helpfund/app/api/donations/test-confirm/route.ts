import { NextRequest, NextResponse } from "next/server";
import { confirmTestPayment } from "@/lib/services/donations";

/**
 * Test-only payment confirmation.
 * In production this endpoint should be disabled or heavily restricted.
 * Real money flow must use verified webhooks from the payment provider.
 */
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_TEST_PAYMENTS !== "true") {
      return NextResponse.json(
        { error: "Test payments are disabled in production" },
        { status: 403 }
      );
    }

    const ref = request.nextUrl.searchParams.get("ref");
    if (!ref) {
      return NextResponse.json({ error: "Missing ref" }, { status: 400 });
    }

    const result = await confirmTestPayment(ref);

    return NextResponse.json({
      success: true,
      donationId: result.donationId,
      alreadyProcessed: result.alreadyProcessed,
      message: "Test payment confirmed. Campaign totals updated.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Confirmation failed";
    console.error("[test-confirm]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
