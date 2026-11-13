import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  approveCampaign,
  rejectCampaign,
  listPendingCampaigns,
  isAdmin,
} from "@/lib/services/admin";
import { ensureUserFromClerk } from "@/lib/services/users";

async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  await ensureUserFromClerk({
    clerkUserId: userId,
    email: user.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "Admin",
  });

  // Bootstrap: first user or explicit admin role
  const admin = await isAdmin(userId);
  // Allow bootstrap via env ADMIN_CLERK_IDS (comma-separated)
  const bootstrapIds = (process.env.ADMIN_CLERK_IDS || "")
    .split(/[,\s]+/)
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
  if (!admin && !bootstrapIds.includes(userId)) {
    return null;
  }
  return userId;
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pending = await listPendingCampaigns();
  return NextResponse.json({
    pending: pending.map((c) => ({
      ...c,
      goal: c.goalAmount / 100,
    })),
  });
}

export async function POST(request: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { campaignId, action, reason } = body as {
    campaignId: string;
    action: "approve" | "reject";
    reason?: string;
  };

  if (!campaignId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "approve") {
    await approveCampaign(campaignId, adminId);
  } else {
    await rejectCampaign(campaignId, adminId, reason || "Does not meet guidelines");
  }

  return NextResponse.json({ success: true });
}
