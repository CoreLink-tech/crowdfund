import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { listPublicCampaigns } from "@/lib/services/campaigns";
import type { Campaign } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

function toCard(c: Awaited<ReturnType<typeof listPublicCampaigns>>[0]): Campaign {
  return {
    slug: c.slug,
    title: c.title,
    organizer: c.organizerName || "Organizer",
    location: c.location,
    category: c.categoryName || "Other",
    raised: c.raisedAmount / 100,
    goal: c.goalAmount / 100,
    donors: c.donorCount,
    daysLeft: c.endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        )
      : 30,
    image:
      c.coverImageUrl ||
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80",
    featured: c.featured,
    verified: c.verified,
    story: [],
  };
}

export default async function HomePage() {
  let featured: Campaign[] = [];
  let popular: Campaign[] = [];

  try {
    const rows = await listPublicCampaigns({ limit: 8 });
    const cards = rows.map(toCard);
    featured = cards.filter((c) => c.featured).slice(0, 2);
    popular = cards.filter((c) => !c.featured).slice(0, 3);
    if (featured.length === 0 && cards.length) {
      featured = cards.slice(0, 1);
      popular = cards.slice(1, 4);
    }
  } catch {
    // DB not ready — empty state
  }

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" /> A little help can go a long way
            </div>
            <h1>
              Big things happen when <span>we help each other.</span>
            </h1>
            <p className="hero-description">
              Whether it’s a medical emergency, school fees or a community
              project, HelpFund makes it easier to bring people together around
              the causes that matter.
            </p>
            <div className="hero-actions">
              <Link href="/create" className="button button-green">
                Start a fundraiser <ArrowUpRight size={17} />
              </Link>
              <Link href="/explore" className="button button-outline">
                Explore campaigns <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>O</span>
                <span>A</span>
                <span>M</span>
                <span>+</span>
              </div>
              <div>
                <strong>Every contribution counts.</strong>
                <small>Join people showing up for one another.</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <Image
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85"
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 480px"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {(featured.length > 0 || popular.length > 0) && (
        <section className="page-section">
          <div className="container">
            <div className="section-heading">
              <div className="eyebrow">Happening now</div>
              <h2>Fundraisers people are supporting</h2>
              <p>Real campaigns from the HelpFund community.</p>
            </div>
            <div className="campaign-grid">
              {[...featured, ...popular].map((campaign) => (
                <CampaignCard key={campaign.slug} campaign={campaign} />
              ))}
            </div>
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <Link href="/explore" className="text-link">
                Explore all campaigns <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <div className="eyebrow">Simple by design</div>
            <h2>Help can start in three steps.</h2>
            <p>
              Getting support should feel straightforward. We make it easier to
              get started and keep people informed.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">
                <Sparkles size={22} />
              </div>
              <h3>Tell your story</h3>
              <p>
                Explain what you’re raising money for, set a goal and share why
                it matters.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">
                <Users size={22} />
              </div>
              <h3>Bring people together</h3>
              <p>
                Share your fundraiser with friends, family and people who care
                about your cause.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">
                <HeartHandshake size={22} />
              </div>
              <h3>Keep the support moving</h3>
              <p>
                Share updates, thank supporters and show how the fundraiser is
                progressing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="safety-section" id="safety">
        <div className="container safety-grid">
          <div className="safety-illustration">
            <div className="safety-circle">
              <ShieldCheck size={54} strokeWidth={1.4} />
            </div>
            <div className="safety-small-card">
              <span className="safety-check">✓</span>
              <span>Trust starts with transparency</span>
            </div>
          </div>
          <div className="safety-copy">
            <div className="eyebrow">Trust matters</div>
            <h2>Good intentions deserve a safer place to grow.</h2>
            <p>
              Fundraising depends on trust. HelpFund is being designed with
              campaign review, identity checks, clear updates and responsible
              withdrawal controls at its core.
            </p>
            <Link href="/#safety" className="text-link">
              Learn about trust & safety <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <div className="eyebrow eyebrow-light">Your story matters</div>
            <h2>Someone out there is ready to help.</h2>
            <p>Take the first step. Start your fundraiser today.</p>
          </div>
          <Link href="/create" className="button button-white">
            Start a fundraiser <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
