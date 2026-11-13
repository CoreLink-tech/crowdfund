import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  campaigns,
  campaignCategories,
  users,
  donations,
  adminActions,
} from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function getPlatformStats() {
  const [campaignStats] = await db
    .select({
      total: sql<number>`count(*)`,
      pending: sql<number>`sum(case when ${campaigns.status} = 'pending_review' then 1 else 0 end)`,
      active: sql<number>`sum(case when ${campaigns.status} in ('approved','active') then 1 else 0 end)`,
    })
    .from(campaigns);

  const [userStats] = await db
    .select({ total: sql<number>`count(*)` })
    .from(users);

  const [donationStats] = await db
    .select({
      total: sql<number>`coalesce(sum(${donations.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(donations)
    .where(eq(donations.status, "successful"));

  return {
    campaigns: Number(campaignStats?.total ?? 0),
    pendingReview: Number(campaignStats?.pending ?? 0),
    activeCampaigns: Number(campaignStats?.active ?? 0),
    users: Number(userStats?.total ?? 0),
    totalRaisedKobo: Number(donationStats?.total ?? 0),
    successfulDonations: Number(donationStats?.count ?? 0),
  };
}

export async function listPendingCampaigns() {
  return db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      status: campaigns.status,
      goalAmount: campaigns.goalAmount,
      location: campaigns.location,
      submittedAt: campaigns.submittedAt,
      createdAt: campaigns.createdAt,
      organizerName: users.fullName,
      organizerEmail: users.email,
      categoryName: campaignCategories.name,
      description: campaigns.description,
      story: campaigns.story,
    })
    .from(campaigns)
    .leftJoin(users, eq(campaigns.organizerId, users.id))
    .leftJoin(
      campaignCategories,
      eq(campaigns.categoryId, campaignCategories.id)
    )
    .where(eq(campaigns.status, "pending_review"))
    .orderBy(desc(campaigns.submittedAt));
}

export async function listAllCampaignsForAdmin(limit = 50) {
  return db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      status: campaigns.status,
      goalAmount: campaigns.goalAmount,
      raisedAmount: campaigns.raisedAmount,
      donorCount: campaigns.donorCount,
      organizerName: users.fullName,
      categoryName: campaignCategories.name,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .leftJoin(users, eq(campaigns.organizerId, users.id))
    .leftJoin(
      campaignCategories,
      eq(campaigns.categoryId, campaignCategories.id)
    )
    .orderBy(desc(campaigns.createdAt))
    .limit(limit);
}

export async function approveCampaign(campaignId: string, adminId: string) {
  await db
    .update(campaigns)
    .set({
      status: "approved",
      approvedAt: new Date(),
      approvedBy: adminId,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  await db.insert(adminActions).values({
    id: uuidv4(),
    adminId,
    action: "approve_campaign",
    targetType: "campaign",
    targetId: campaignId,
  });
}

export async function rejectCampaign(
  campaignId: string,
  adminId: string,
  reason: string
) {
  await db
    .update(campaigns)
    .set({
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  await db.insert(adminActions).values({
    id: uuidv4(),
    adminId,
    action: "reject_campaign",
    targetType: "campaign",
    targetId: campaignId,
    details: JSON.stringify({ reason }),
  });
}

export async function isAdmin(clerkUserId: string): Promise<boolean> {
  const rows = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1);
  return rows[0]?.role === "admin";
}

/** Promote a Clerk user to admin (one-time setup helper) */
export async function promoteToAdmin(clerkUserId: string) {
  await db
    .update(users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(users.id, clerkUserId));
}
