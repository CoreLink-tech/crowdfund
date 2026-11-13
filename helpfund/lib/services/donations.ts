import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { donations, paymentTransactions, campaigns } from "@/lib/db/schema";
import { recalculateCampaignTotals } from "./campaigns";

export type PaymentProvider = "test" | "paystack" | "flutterwave";

/**
 * Payment provider abstraction.
 * Only the "test" adapter is active. Live providers are placeholders.
 */
export interface PaymentInitResult {
  provider: PaymentProvider;
  providerReference: string;
  checkoutUrl?: string;
  status: "initiated" | "pending";
}

export async function initiatePayment(params: {
  amountKobo: number;
  currency: string;
  donationId: string;
  email: string;
  provider?: PaymentProvider;
}): Promise<PaymentInitResult> {
  const provider = params.provider || "test";

  if (provider === "test") {
    // Clearly labeled test adapter — never treat as real money
    const ref = `test_${params.donationId}_${Date.now()}`;
    return {
      provider: "test",
      providerReference: ref,
      status: "initiated",
      // In a real UI we would redirect; for test we confirm via API
      checkoutUrl: `/api/donations/test-confirm?ref=${ref}`,
    };
  }

  // Placeholders for future providers — do not activate without credentials
  throw new Error(`Payment provider "${provider}" is not configured.`);
}

export async function createDonation(input: {
  campaignId: string;
  donorId?: string | null;
  donorName: string;
  donorEmail: string;
  amountNaira: number;
  isAnonymous?: boolean;
  message?: string;
  provider?: PaymentProvider;
}) {
  if (!input.amountNaira || input.amountNaira < 100) {
    throw new Error("Minimum donation is ₦100");
  }
  if (input.amountNaira > 50_000_000) {
    throw new Error("Amount exceeds allowed limit");
  }

  // Campaign must be publicly fundable
  const camp = await db
    .select({ id: campaigns.id, status: campaigns.status })
    .from(campaigns)
    .where(eq(campaigns.id, input.campaignId))
    .limit(1);

  if (!camp[0] || !["approved", "active"].includes(camp[0].status)) {
    throw new Error("This campaign is not accepting donations");
  }

  const donationId = uuidv4();
  const amountKobo = Math.round(input.amountNaira * 100);

  await db.insert(donations).values({
    id: donationId,
    campaignId: input.campaignId,
    donorId: input.donorId || null,
    donorName: input.donorName.trim(),
    donorEmail: input.donorEmail.toLowerCase().trim(),
    amount: amountKobo,
    currency: "NGN",
    isAnonymous: !!input.isAnonymous,
    message: input.message?.trim() || null,
    status: "pending",
  });

  const payment = await initiatePayment({
    amountKobo,
    currency: "NGN",
    donationId,
    email: input.donorEmail,
    provider: input.provider || "test",
  });

  await db.insert(paymentTransactions).values({
    id: uuidv4(),
    donationId,
    provider: payment.provider,
    providerReference: payment.providerReference,
    amount: amountKobo,
    currency: "NGN",
    status: "initiated",
  });

  await db
    .update(donations)
    .set({
      paymentProvider: payment.provider,
      providerReference: payment.providerReference,
    })
    .where(eq(donations.id, donationId));

  return {
    donationId,
    providerReference: payment.providerReference,
    checkoutUrl: payment.checkoutUrl,
    amountNaira: input.amountNaira,
  };
}

/**
 * Confirm a test payment. Idempotent.
 * Real providers would call this from a verified webhook.
 */
export async function confirmTestPayment(providerReference: string) {
  if (!providerReference.startsWith("test_")) {
    throw new Error("Invalid test reference");
  }

  const tx = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.providerReference, providerReference))
    .limit(1);

  if (!tx[0]) throw new Error("Transaction not found");
  if (tx[0].status === "successful") {
    // Already processed — idempotent
    return { donationId: tx[0].donationId, alreadyProcessed: true };
  }

  await db
    .update(paymentTransactions)
    .set({ status: "successful", updatedAt: new Date() })
    .where(eq(paymentTransactions.id, tx[0].id));

  await db
    .update(donations)
    .set({ status: "successful", verifiedAt: new Date() })
    .where(eq(donations.id, tx[0].donationId));

  const don = await db
    .select({ campaignId: donations.campaignId })
    .from(donations)
    .where(eq(donations.id, tx[0].donationId))
    .limit(1);

  if (don[0]) {
    await recalculateCampaignTotals(don[0].campaignId);
  }

  return { donationId: tx[0].donationId, alreadyProcessed: false };
}

export async function getDonation(donationId: string) {
  const rows = await db
    .select()
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);
  return rows[0] ?? null;
}

export async function listCampaignDonations(campaignId: string, limit = 20) {
  return db
    .select({
      id: donations.id,
      donorName: donations.donorName,
      amount: donations.amount,
      isAnonymous: donations.isAnonymous,
      message: donations.message,
      createdAt: donations.createdAt,
      status: donations.status,
    })
    .from(donations)
    .where(
      and(
        eq(donations.campaignId, campaignId),
        eq(donations.status, "successful")
      )
    )
    .orderBy(desc(donations.createdAt))
    .limit(limit);
}
