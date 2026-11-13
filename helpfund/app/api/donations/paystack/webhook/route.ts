import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { markDonationSuccessful } from "@/lib/services/donations";

/**
 * Paystack webhook — verifies signature then marks donation successful.
 * Configure URL in Paystack dashboard: /api/donations/paystack/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const raw = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";
    const hash = crypto.createHmac("sha512", secret).update(raw).digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw);
    if (event?.event === "charge.success") {
      const reference = event?.data?.reference;
      if (reference) {
        await markDonationSuccessful(reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paystack webhook]", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
