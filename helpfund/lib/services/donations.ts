import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { donations, paymentTransactions, campaigns } from "@/lib/db/schema";
import { recalculateCampaignTotals } from "./campaigns";

export type PaymentProvider = "test" | "paystack";

export interface PaymentInitResult {
  provider: PaymentProvider;
  providerReference: string;
  checkoutUrl?: string;
  status: "initiated" | "pending";
}

function activeProvider(): PaymentProvider {
  if (process.env.PAYSTACK_SECRET_KEY) return "paystack";
  return "test";
}

async function initiatePaystack(params: {
  amountKobo: number;
  email: string;
  donationId: string;
  callbackUrl?: string;
}): Promise<PaymentInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");

  const ref = `hf_${params.donationId.replace(/-/g, "").slice(0, 20)}_${Date.now()}`;
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: "NGN",
      reference: ref,
      callback_url:
        params.callbackUrl ||
        (appUrl ? `${appUrl}/api/donations/paystack/callback` : undefined),
      metadata: {
        donation_id: params.donationId,
        platform: "helpfund",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || "Unable to start Paystack payment");
  }

  return {
    provider: "paystack",
    providerReference: ref,
    checkoutUrl: data.data.authorization_url,
    status: "pending",
  };
}

async function initiateTest(params: {
  donationId: string;
}): Promise<PaymentInitResult> {
  const ref = `test_${params.donationId}_${Date.now()}`;
  return {
    provider: "test",
    providerReference: ref,
    status: "initiated",
    checkoutUrl: `/api/donations/test-confirm?ref=${encodeURIComponent(ref)}`,
  };
}

export async function initiatePayment(params: {
  amountKobo: number;
  currency: string;
  donationId: string;
  email: string;
  provider?: PaymentProvider;
}): Promise<PaymentInitResult> {
  const provider = params.provider || activeProvider();

  if (provider === "paystack") {
    return initiatePaystack({
      amountKobo: params.amountKobo,
      email: params.email,
      donationId: params.donationId,
    });
  }

  return initiateTest({ donationId: params.donationId });
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
    provider: input.provider || activeProvider(),
  });

  await db.insert(paymentTransactions).values({
    id: uuidv4(),
    donationId,
    provider: payment.provider,
    providerReference: payment.providerReference,
    amount: amountKobo,
    currency: "NGN",
    status: payment.status === "pending" ? "pending" : "initiated",
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
    provider: payment.provider,
  };
}

/** Mark donation successful (idempotent). Used by test confirm + Paystack verify. */
export async function markDonationSuccessful(providerReference: string) {
  const tx = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.providerReference, providerReference))
    .limit(1);

  if (!tx[0]) throw new Error("Transaction not found");
  if (tx[0].status === "successful") {
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

export async function confirmTestPayment(providerReference: string) {
  if (!providerReference.startsWith("test_")) {
    throw new Error("Invalid test reference");
  }
  return markDonationSuccessful(providerReference);
}

export async function verifyPaystackPayment(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  const data = await res.json();
  if (!res.ok || !data?.status) {
    throw new Error(data?.message || "Verification failed");
  }

  const status = data.data?.status;
  if (status !== "success") {
    throw new Error(`Payment not successful (${status})`);
  }

  return markDonationSuccessful(reference);
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
