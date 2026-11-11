import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Heart, MapPin, ShieldCheck, Users } from "lucide-react";
import { campaigns, formatNaira, progressPercent } from "@/lib/campaigns";
import { ShareButton } from "@/components/share-button";

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = campaigns.find((item) => item.slug === slug);
  if (!campaign) notFound();
  const percent = progressPercent(campaign.raised, campaign.goal);

  return (
    <section className="campaign-detail-section">
      <div className="container">
        <Link href="/explore" className="back-link"><ArrowLeft size={16} /> Back to campaigns</Link>
        <div className="campaign-detail-grid">
          <div className="campaign-detail-main">
            <div className="detail-image"><Image src={campaign.image} alt="" fill priority sizes="(max-width: 900px) 100vw, 65vw" /></div>
            <div className="detail-category">{campaign.category}</div>
            <h1>{campaign.title}</h1>
            <div className="detail-organizer"><span className="organizer-avatar">{campaign.organizer.charAt(0)}</span><div><span>Fundraiser by</span><strong>{campaign.organizer} {campaign.verified && <ShieldCheck size={15} />}</strong></div></div>
            <div className="detail-meta"><span><MapPin size={15} />{campaign.location}</span><span><Users size={15} />{campaign.donors} supporters</span><span><Clock3 size={15} />{campaign.daysLeft} days left</span></div>
            <div className="detail-story"><h2>About this fundraiser</h2>{campaign.story.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            <div className="detail-update-note"><div className="update-icon"><CheckCircle2 size={19} /></div><div><strong>Stay connected to this fundraiser</strong><p>Campaign organizers can share updates so supporters know how things are progressing.</p></div></div>
          </div>
          <aside className="donation-panel">
            <div className="donation-raised">{formatNaira(campaign.raised)} <span>raised</span></div>
            <div className="donation-goal">of {formatNaira(campaign.goal)} goal</div>
            <div className="progress-track progress-track-large"><span style={{ width: `${percent}%` }} /></div>
            <div className="donation-progress-row"><strong>{percent}%</strong><span>{campaign.donors} supporters</span></div>
            <div className="donation-actions"><button className="button button-green button-full" disabled>Donate now <Heart size={17} /></button><ShareButton title={campaign.title} /></div>
            <div className="donation-demo-notice">Donations are not enabled yet. Payment integration will be added after the core platform is ready.</div>
            <div className="panel-safety"><ShieldCheck size={18} /><span>HelpFund is being built with trust and safety in mind.</span></div>
          </aside>
        </div>
      </div>
    </section>
  );
}
