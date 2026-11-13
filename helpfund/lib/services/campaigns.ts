import { eq, and, desc, sql, like, or, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import {
  campaigns,
  campaignCategories,
  campaignUpdates,
  donations,
  users,
} from "@/lib/db/schema";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}-${uuidv4().slice(0, 8)}`;
}

export async function listCategories() {
  return db
    .select()
    .from(campaignCategories)
    .where(eq(campaignCategories.isActive, true))
    .orderBy(campaignCategories.sortOrder);
}

export async function listPublicCampaigns(opts?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const limit = opts?.limit ?? 24;
  const offset = opts?.offset ?? 0;

  const conditions = [
    inArray(campaigns.status, ["approved", "active", "completed"]),
  ];

  if (opts?.categorySlug && opts.categorySlug !== "all") {
    const cat = await db
      .select({ id: campaignCategories.id })
      .from(campaignCategories)
      .where(eq(campaignCategories.slug, opts.categorySlug))
      .limit(1);
    if (cat[0]) {
      conditions.push(eq(campaigns.categoryId, cat[0].id));
    }
  }

  if (opts?.search?.trim()) {
    const q = `%${opts.search.trim()}%`;
    conditions.push(
      or(like(campaigns.title, q), like(campaigns.location, q))!
    );
  }

  const rows = await db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      location: campaigns.location,
      goalAmount: campaigns.goalAmount,
      raisedAmount: campaigns.raisedAmount,
      donorCount: campaigns.donorCount,
      coverImageUrl: campaigns.coverImageUrl,
      status: campaigns.status,
      verified: campaigns.verified,
      featured: campaigns.featured,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
      categoryName: campaignCategories.name,
      categorySlug: campaignCategories.slug,
      organizerName: users.fullName,
    })
    .from(campaigns)
    .leftJoin(campaignCategories, eq(campaigns.categoryId, campaignCategories.id))
    .leftJoin(users, eq(campaigns.organizerId, users.id))
    .where(and(...conditions))
    .orderBy(desc(campaigns.featured), desc(campaigns.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getCampaignBySlug(slug: string) {
  const rows = await db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      description: campaigns.description,
      story: campaigns.story,
      location: campaigns.location,
      goalAmount: campaigns.goalAmount,
      raisedAmount: campaigns.raisedAmount,
      donorCount: campaigns.donorCount,
      coverImageUrl: campaigns.coverImageUrl,
      videoUrl: campaigns.videoUrl,
      status: campaigns.status,
      verified: campaigns.verified,
      featured: campaigns.featured,
      howFundsUsed: campaigns.howFundsUsed,
      reason: campaigns.reason,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
      organizerId: campaigns.organizerId,
      categoryName: campaignCategories.name,
      categorySlug: campaignCategories.slug,
      organizerName: users.fullName,
    })
    .from(campaigns)
    .leftJoin(campaignCategories, eq(campaigns.categoryId, campaignCategories.id))
    .leftJoin(users, eq(campaigns.organizerId, users.id))
    .where(eq(campaigns.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function getCampaignUpdates(campaignId: string) {
  return db
    .select()
    .from(campaignUpdates)
    .where(
      and(
        eq(campaignUpdates.campaignId, campaignId),
        eq(campaignUpdates.isPublic, true)
      )
    )
    .orderBy(desc(campaignUpdates.createdAt));
}

export async function createCampaign(input: {
  organizerId: string;
  title: string;
  description: string;
  story: string;
  categoryId: string;
  location: string;
  goalAmount: number; // naira (will store as kobo)
  coverImageUrl?: string;
  howFundsUsed?: string;
  reason?: string;
  endDate?: Date;
  status?: "draft" | "pending_review";
}) {
  const id = uuidv4();
  const slug = slugify(input.title);
  const goalKobo = Math.round(input.goalAmount * 100);

  await db.insert(campaigns).values({
    id,
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    story: input.story,
    categoryId: input.categoryId,
    organizerId: input.organizerId,
    location: input.location.trim(),
    goalAmount: goalKobo,
    raisedAmount: 0,
    currency: "NGN",
    coverImageUrl: input.coverImageUrl || null,
    howFundsUsed: input.howFundsUsed || null,
    reason: input.reason || null,
    status: input.status || "draft",
    endDate: input.endDate || null,
    submittedAt: input.status === "pending_review" ? new Date() : null,
  });

  return { id, slug };
}

export async function submitCampaignForReview(
  campaignId: string,
  organizerId: string
) {
  const row = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!row[0] || row[0].organizerId !== organizerId) {
    throw new Error("FORBIDDEN");
  }
  if (!["draft", "rejected"].includes(row[0].status)) {
    throw new Error("INVALID_STATUS");
  }

  await db
    .update(campaigns)
    .set({
      status: "pending_review",
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));
}

export async function listOrganizerCampaigns(organizerId: string) {
  return db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      title: campaigns.title,
      status: campaigns.status,
      goalAmount: campaigns.goalAmount,
      raisedAmount: campaigns.raisedAmount,
      donorCount: campaigns.donorCount,
      coverImageUrl: campaigns.coverImageUrl,
      createdAt: campaigns.createdAt,
      categoryName: campaignCategories.name,
    })
    .from(campaigns)
    .leftJoin(campaignCategories, eq(campaigns.categoryId, campaignCategories.id))
    .where(eq(campaigns.organizerId, organizerId))
    .orderBy(desc(campaigns.createdAt));
}

/** Only successful donations contribute to totals */
export async function recalculateCampaignTotals(campaignId: string) {
  const result = await db
    .select({
      total: sql<number>`coalesce(sum(${donations.amount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(donations)
    .where(
      and(
        eq(donations.campaignId, campaignId),
        eq(donations.status, "successful")
      )
    );

  const total = Number(result[0]?.total ?? 0);
  const count = Number(result[0]?.count ?? 0);

  await db
    .update(campaigns)
    .set({
      raisedAmount: total,
      donorCount: count,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  return { raisedAmount: total, donorCount: count };
}
