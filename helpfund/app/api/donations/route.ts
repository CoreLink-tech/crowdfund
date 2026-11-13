import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createDonation } from "@/lib/services/donations";
import { rateLimit, clientKey } from "@/lib/security/rate-limit";

const schema = z.object({
  campaignId: z.string().min(1),
  amount: z.coerce.number().min(100).max(50_000_000),
  donorName: z.string().min(2).max(100),
  donorEmail: z.string().email(),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(clientKey(request, "donate"), 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
    }
    const { userId } = await auth(); // optional — guests can donate
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const result = await createDonation({
      campaignId: parsed.data.campaignId,
      donorId: userId || null,
      donorName: parsed.data.donorName,
      donorEmail: parsed.data.donorEmail,
      amountNaira: parsed.data.amount,
      isAnonymous: parsed.data.isAnonymous,
      message: parsed.data.message,
      provider: "test",
    });

    return NextResponse.json({
      success: true,
      donationId: result.donationId,
      providerReference: result.providerReference,
      checkoutUrl: result.checkoutUrl,
      amount: result.amountNaira,
      note: "Test payment only — no real money is processed.",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to create donation";
    console.error("[donations POST]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
