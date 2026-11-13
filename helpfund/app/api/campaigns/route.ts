import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCampaignSchema } from "@/lib/validations/campaign";
import {
  createCampaign,
  listPublicCampaigns,
} from "@/lib/services/campaigns";
import { ensureUserFromClerk } from "@/lib/services/users";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("q") || undefined;
    const limit = Math.min(Number(searchParams.get("limit") || 24), 50);
    const offset = Number(searchParams.get("offset") || 0);

    const items = await listPublicCampaigns({
      categorySlug: category,
      search,
      limit,
      offset,
    });

    // Convert kobo → naira for API consumers
    const campaigns = items.map((c) => ({
      ...c,
      goal: c.goalAmount / 100,
      raised: c.raisedAmount / 100,
      image: c.coverImageUrl,
      category: c.categoryName,
      organizer: c.organizerName,
    }));

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("[campaigns GET]", err);
    return NextResponse.json(
      { error: "Unable to load campaigns", campaigns: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    await ensureUserFromClerk({
      clerkUserId: userId,
      email:
        user.emailAddresses?.[0]?.emailAddress ||
        `${userId}@clerk.local`,
      fullName:
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        "User",
    });

    const body = await request.json();
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const result = await createCampaign({
      organizerId: userId,
      title: data.title,
      description: data.description,
      story: data.story,
      categoryId: data.categoryId,
      location: data.location,
      goalAmount: data.goalAmount,
      coverImageUrl: data.coverImageUrl || undefined,
      howFundsUsed: data.howFundsUsed,
      reason: data.reason,
      status: data.submitForReview ? "pending_review" : "draft",
    });

    return NextResponse.json(
      {
        success: true,
        campaign: { id: result.id, slug: result.slug },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[campaigns POST]", err);
    return NextResponse.json(
      { error: "Unable to create campaign" },
      { status: 500 }
    );
  }
}
