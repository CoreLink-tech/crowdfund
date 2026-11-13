import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const firstName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "there";

  return (
    <section className="form-page">
      <div className="container form-container">
        <div className="form-heading">
          <div className="eyebrow">Your dashboard</div>
          <h1>Welcome back, {firstName}.</h1>
          <p>
            Manage your fundraisers, track donations and keep supporters updated.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: "var(--green-soft)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              Signed in with
            </div>
            <strong>
              {user?.emailAddresses?.[0]?.emailAddress || "Clerk account"}
            </strong>
          </div>
          <div
            style={{
              background: "var(--cream)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
              User ID
            </div>
            <strong style={{ fontSize: 13, wordBreak: "break-all" }}>
              {userId}
            </strong>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Link href="/create" className="button button-green">
            Start a fundraiser <ArrowUpRight size={16} />
          </Link>
          <Link href="/explore" className="button button-outline">
            Explore campaigns
          </Link>
        </div>

        <div
          style={{
            marginTop: 40,
            padding: 24,
            background: "var(--canvas)",
            borderRadius: 12,
            border: "1px solid var(--line)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Coming next</h2>
          <ul style={{ color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            <li>Campaign management and performance stats</li>
            <li>Donation history</li>
            <li>Profile linked to your Clerk account</li>
            <li>Admin tools (for platform admins)</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
