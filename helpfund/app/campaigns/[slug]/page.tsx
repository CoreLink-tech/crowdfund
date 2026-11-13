import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { formatNaira, progressPercent } from "@/lib/campaigns";
import { ShareButton } from "@/components/share-button";
import { DonateForm } from "@/components/donate-form";
import {
  getCampaignBySlug,
  getCampaignUpdates,
} from "@/lib/services/campaigns";
import { listCampaignDonations } from "@/lib/services/donations";

export const dynamic = "force-dynamic";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) notFound();

  // Only show publicly if approved/active/completed (or allow owner later)
  if (!["approved", "active", "completed"].includes(campaign.status)) {
    notFound();
  }

  const raised = campaign.raisedAmount / 100;
  const goal = campaign.goalAmount / 100;
  const percent = progressPercent(raised, goal);
  const storyParagraphs = campaign.story
    ? campaign.story.split(/\n\n+/).filter(Boolean)
    : [campaign.description];

  const daysLeft = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const [updates, recentDonations] = await Promise.all([
    getCampaignUpdates(campaign.id),
    listCampaignDonations(campaign.id, 10),
  ]);

  const image =
    campaign.coverImageUrl ||
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80";

  return (
    <section className="campaign-detail-section">
      <div className="container">
        <Link href="/explore" className="back-link">
          <ArrowLeft size={16} /> Back to campaigns
        </Link>
        <div className="campaign-detail-grid">
          <div className="campaign-detail-main">
            <div className="detail-image">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 65vw"
              />
            </div>
            <div className="detail-category">
              {campaign.categoryName || "Campaign"}
            </div>
            <h1>{campaign.title}</h1>
            <div className="detail-organizer">
              <span className="organizer-avatar">
                {(campaign.organizerName || "O").charAt(0)}
              </span>
              <div>
                <span>Fundraiser by</span>
                <strong>
                  {campaign.organizerName || "Organizer"}{" "}
                  {campaign.verified && <ShieldCheck size={15} />}
                </strong>
              </div>
            </div>
            <div className="detail-meta">
              <span>
                <MapPin size={15} />
                {campaign.location}
              </span>
              <span>
                <Users size={15} />
                {campaign.donorCount} supporters
              </span>
              {daysLeft !== null && (
                <span>
                  <Clock3 size={15} />
                  {daysLeft} days left
                </span>
              )}
            </div>
            <div className="detail-story">
              <h2>About this fundraiser</h2>
              {storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {campaign.howFundsUsed && (
                <>
                  <h2>How funds will be used</h2>
                  <p>{campaign.howFundsUsed}</p>
                </>
              )}
            </div>

            {updates.length > 0 && (
              <div className="detail-story">
                <h2>Updates</h2>
                {updates.map((u) => (
                  <div key={u.id} style={{ marginBottom: 16 }}>
                    <strong>{u.title}</strong>
                    <p>{u.content}</p>
                  </div>
                ))}
              </div>
            )}

            {recentDonations.length > 0 && (
              <div className="detail-story">
                <h2>Recent supporters</h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {recentDonations.map((d) => (
                    <li
                      key={d.id}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid var(--line)",
                        fontSize: 14,
                      }}
                    >
                      <strong>
                        {d.isAnonymous ? "Anonymous" : d.donorName}
                      </strong>{" "}
                      donated {formatNaira(d.amount / 100)}
                      {d.message && (
                        <span style={{ color: "var(--muted)" }}>
                          {" "}
                          — “{d.message}”
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-update-note">
              <div className="update-icon">
                <CheckCircle2 size={19} />
              </div>
              <div>
                <strong>Stay connected to this fundraiser</strong>
                <p>
                  Campaign organizers can share updates so supporters know how
                  things are progressing.
                </p>
              </div>
            </div>
          </div>

          <aside className="donation-panel">
            <div className="donation-raised">
              {formatNaira(raised)} <span>raised</span>
            </div>
            <div className="donation-goal">of {formatNaira(goal)} goal</div>
            <div className="progress-track progress-track-large">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="donation-progress-row">
              <strong>{percent}%</strong>
              <span>{campaign.donorCount} supporters</span>
            </div>
            <div className="donation-actions">
              <DonateForm
                campaignId={campaign.id}
                campaignTitle={campaign.title}
              />
              <ShareButton title={campaign.title} />
            </div>
            <div className="panel-safety">
              <ShieldCheck size={18} />
              <span>
                HelpFund is being built with trust and safety in mind.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
