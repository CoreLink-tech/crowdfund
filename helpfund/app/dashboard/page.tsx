import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";
import { listOrganizerCampaigns } from "@/lib/services/campaigns";
import { ensureUserFromClerk } from "@/lib/services/users";
import { formatNaira } from "@/lib/campaigns";
import { isAdmin } from "@/lib/services/admin";
import { db } from "@/lib/db";
import { donations } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/dashboard");

  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard");

  await ensureUserFromClerk({
    clerkUserId: userId,
    email: user.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "User",
  });

  const firstName =
    user.firstName ||
    user.fullName?.split(" ")[0] ||
    user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "there";

  const myCampaigns = await listOrganizerCampaigns(userId);
  const totalRaised = myCampaigns.reduce((s, c) => s + c.raisedAmount, 0);
  const activeCount = myCampaigns.filter((c) =>
    ["approved", "active"].includes(c.status)
  ).length;
  const pendingCount = myCampaigns.filter(
    (c) => c.status === "pending_review"
  ).length;

  const donationsMade = await db
    .select()
    .from(donations)
    .where(
      and(eq(donations.donorId, userId), eq(donations.status, "successful"))
    )
    .orderBy(desc(donations.createdAt))
    .limit(10);

  const admin = await isAdmin(userId);
  const bootstrapIds = (process.env.ADMIN_CLERK_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const showAdmin = admin || bootstrapIds.includes(userId);

  return (
    <section className="form-page">
      <div className="container form-container" style={{ maxWidth: 960 }}>
        <div className="form-heading">
          <div className="eyebrow">Your dashboard</div>
          <h1>Welcome back, {firstName}.</h1>
          <p>Manage fundraisers, track support, and stay on top of activity.</p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            marginBottom: 28,
          }}
        >
          <div style={{ background: "var(--green-soft)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Total raised</div>
            <strong style={{ fontSize: 18 }}>{formatNaira(totalRaised / 100)}</strong>
          </div>
          <div style={{ background: "var(--cream)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Campaigns</div>
            <strong style={{ fontSize: 18 }}>{myCampaigns.length}</strong>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Active</div>
            <strong style={{ fontSize: 18 }}>{activeCount}</strong>
          </div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Pending review</div>
            <strong style={{ fontSize: 18 }}>{pendingCount}</strong>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <Link href="/create" className="button button-green">
            <Plus size={16} /> Start a fundraiser
          </Link>
          <Link href="/explore" className="button button-outline">
            Explore campaigns
          </Link>
          {showAdmin && (
            <Link href="/admin" className="button button-dark">
              <LayoutDashboard size={16} /> Admin panel
            </Link>
          )}
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>My campaigns</h2>
        {myCampaigns.length === 0 ? (
          <div style={{ padding: 24, background: "var(--canvas)", borderRadius: 12, border: "1px solid var(--line)", marginBottom: 32 }}>
            <p style={{ margin: 0, color: "var(--muted)" }}>
              You haven&apos;t created a campaign yet.{" "}
              <Link href="/create" style={{ color: "var(--green)", fontWeight: 600 }}>Start one</Link>.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginBottom: 32 }}>
            {myCampaigns.map((c) => (
              <div key={c.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, padding: 16, border: "1px solid var(--line)", borderRadius: 12, background: "#fff" }}>
                <div>
                  <strong>{c.title}</strong>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                    {c.categoryName} · {c.status.replace(/_/g, " ")} · {formatNaira(c.raisedAmount / 100)} of {formatNaira(c.goalAmount / 100)}
                  </div>
                </div>
                {["approved", "active", "completed"].includes(c.status) && (
                  <Link href={`/campaigns/${c.slug}`} className="button button-outline button-small">View</Link>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Donations you made</h2>
        {donationsMade.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            No donations yet. <Link href="/explore" style={{ color: "var(--green)" }}>Find a cause</Link>.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {donationsMade.map((d) => (
              <li key={d.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
                {formatNaira(d.amount / 100)}
                {d.isAnonymous ? " (anonymous)" : ""} ·{" "}
                {d.createdAt ? new Date(d.createdAt as Date).toLocaleDateString("en-NG") : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
