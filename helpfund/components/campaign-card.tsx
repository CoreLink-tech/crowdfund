import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { Campaign, formatNaira, progressPercent } from "@/lib/campaigns";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const percent = progressPercent(campaign.raised, campaign.goal);
  return (
    <article className="campaign-card">
      <Link href={`/campaigns/${campaign.slug}`} className="campaign-image-wrap">
        <Image
          src={campaign.image}
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className="campaign-image"
        />
        <span className="category-tag">{campaign.category}</span>
      </Link>
      <div className="campaign-card-body">
        <div className="campaign-organizer">
          {campaign.verified && <ShieldCheck size={14} />}
          <span>{campaign.organizer}</span>
        </div>
        <Link href={`/campaigns/${campaign.slug}`} className="campaign-title">{campaign.title}</Link>
        <div className="campaign-location"><MapPin size={13} /> {campaign.location}</div>
        <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
        <div className="campaign-stats">
          <div><strong>{formatNaira(campaign.raised)}</strong><span>raised of {formatNaira(campaign.goal)}</span></div>
          <div className="campaign-percent">{percent}%</div>
        </div>
        <div className="campaign-card-bottom">
          <span>{campaign.donors.toLocaleString()} supporters</span>
          <span>{campaign.daysLeft} days left</span>
        </div>
      </div>
    </article>
  );
}
