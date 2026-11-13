import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureUserFromClerk } from "@/lib/services/users";
import {
  getPlatformStats,
  listPendingCampaigns,
  listAllCampaignsForAdmin,
  isAdmin,
} from "@/lib/services/admin";
import { formatNaira } from "@/lib/campaigns";
import { AdminReviewActions } from "@/components/admin-review-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/admin");

  await ensureUserFromClerk({
    clerkUserId: userId,
    email: user.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`,
    fullName:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin",
  });

  const admin = await isAdmin(userId);
  const bootstrapIds = (process.env.ADMIN_CLERK_IDS || "")
    .split(/[,\s]+/)
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  if (!admin && !bootstrapIds.includes(userId)) {
    return (
      <section className="form-page">
        <div className="container form-container">
          <h1>Admin access required</h1>
          <p style={{ color: "var(--muted)" }}>
            Your account does not have admin privileges. Set{" "}
            <code>ADMIN_CLERK_IDS</code> to your Clerk user ID, or promote your
            user role in the database.
          </p>
          <p style={{ fontSize: 13 }}>
            Your Clerk user ID: <code>{userId}</code>
          </p>
          <Link href="/dashboard" className="button button-outline">
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const stats = await getPlatformStats();
  const pending = await listPendingCampaigns();
  const all = await listAllCampaignsForAdmin(30);

  return (
    <section className="form-page">
      <div className="container form-container" style={{ maxWidth: 1000 }}>
        <div className="form-heading">
          <div className="eyebrow">Administration</div>
          <h1>Platform overview</h1>
          <p>Review campaigns, monitor activity, and keep HelpFund safe.</p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            marginBottom: 32,
          }}
        >
          <AdminStat label="Users" value={String(stats.users)} />
          <AdminStat label="Campaigns" value={String(stats.campaigns)} />
          <AdminStat label="Pending review" value={String(stats.pendingReview)} />
          <AdminStat label="Active" value={String(stats.activeCampaigns)} />
          <AdminStat
            label="Raised (verified)"
            value={formatNaira(stats.totalRaisedKobo / 100)}
          />
          <AdminStat
            label="Donations"
            value={String(stats.successfulDonations)}
          />
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>
          Pending review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p style={{ color: "var(--muted)", marginBottom: 32 }}>
            No campaigns waiting for review.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
            {pending.map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 20,
                  background: "#fff",
                }}
              >
                <strong style={{ fontSize: 16 }}>{c.title}</strong>
                <div style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 12px" }}>
                  {c.categoryName} · {c.location} · Goal{" "}
                  {formatNaira(c.goalAmount / 100)} · by {c.organizerName} (
                  {c.organizerEmail})
                </div>
                <p style={{ fontSize: 14, marginBottom: 12 }}>
                  {c.description?.slice(0, 280)}
                  {(c.description?.length || 0) > 280 ? "…" : ""}
                </p>
                <AdminReviewActions campaignId={c.id} />
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Recent campaigns</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {all.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
                fontSize: 14,
              }}
            >
              <span>
                <strong>{c.title}</strong>{" "}
                <span style={{ color: "var(--muted)" }}>
                  · {c.status.replace(/_/g, " ")} · {c.organizerName}
                </span>
              </span>
              <span style={{ color: "var(--muted)" }}>
                {formatNaira(c.raisedAmount / 100)}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32 }}>
          <Link href="/dashboard" className="button button-outline">
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--canvas)",
        borderRadius: 12,
        padding: 14,
        border: "1px solid var(--line)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
