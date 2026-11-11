import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, HeartHandshake, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { campaigns } from "@/lib/campaigns";

export default function HomePage() {
  const featured = campaigns.filter((campaign) => campaign.featured);
  const popular = campaigns.filter((campaign) => !campaign.featured).slice(0, 3);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> A little help can go a long way</div>
            <h1>Big things happen when <span>we help each other.</span></h1>
            <p className="hero-description">Whether it’s a medical emergency, school fees or a community project, HelpFund makes it easier to bring people together around the causes that matter.</p>
            <div className="hero-actions">
              <Link href="/create" className="button button-green">Start a fundraiser <ArrowUpRight size={17} /></Link>
              <Link href="/explore" className="button button-outline">Explore campaigns <ArrowRight size={16} /></Link>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack">
                <span>O</span><span>A</span><span>M</span><span>+</span>
              </div>
              <div><strong>Every contribution counts.</strong><small>Join people showing up for one another.</small></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo-main">
              <Image src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1100&q=90" alt="Volunteers working together in a community" fill priority sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
            <div className="hero-note">
              <div className="hero-note-icon"><HeartHandshake size={20} /></div>
              <div><strong>Help moves us forward.</strong><span>One person. One cause. A community.</span></div>
            </div>
            <div className="hero-stamp"><span>HELP</span><HeartHandshake size={24} /><span>MATTERS</span></div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-strip-inner">
          <div><ShieldCheck size={19} /><span>Safety-focused fundraising</span></div>
          <div><Users size={19} /><span>Built around community</span></div>
          <div><WalletCards size={19} /><span>Clear fundraising goals</span></div>
          <div><HeartHandshake size={19} /><span>Support that travels further</span></div>
        </div>
      </section>

      <section className="section section-featured">
        <div className="container">
          <div className="section-heading">
            <div><div className="eyebrow">A place to begin</div><h2>Stories worth showing up for.</h2><p>Meet people and communities working towards something important.</p></div>
            <Link href="/explore" className="text-link">Explore all campaigns <ArrowRight size={16} /></Link>
          </div>
          <div className="campaign-grid campaign-grid-featured">
            {featured.map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}
            {popular.slice(0, 2).map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-heading section-heading-centered">
            <div className="eyebrow">Simple by design</div>
            <h2>Help can start in three steps.</h2>
            <p>Getting support should feel straightforward. We make it easier to get started and keep people informed.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card"><span className="step-number">01</span><div className="step-icon"><Sparkles size={22} /></div><h3>Tell your story</h3><p>Explain what you’re raising money for, set a goal and share why it matters.</p></div>
            <div className="step-card"><span className="step-number">02</span><div className="step-icon"><Users size={22} /></div><h3>Bring people together</h3><p>Share your fundraiser with friends, family and people who care about your cause.</p></div>
            <div className="step-card"><span className="step-number">03</span><div className="step-icon"><HeartHandshake size={22} /></div><h3>Keep the support moving</h3><p>Share updates, thank supporters and show how the fundraiser is progressing.</p></div>
          </div>
        </div>
      </section>

      <section className="safety-section" id="safety">
        <div className="container safety-grid">
          <div className="safety-illustration"><div className="safety-circle"><ShieldCheck size={54} strokeWidth={1.4} /></div><div className="safety-small-card"><span className="safety-check">✓</span><span>Trust starts with transparency</span></div></div>
          <div className="safety-copy"><div className="eyebrow">Trust matters</div><h2>Good intentions deserve a safer place to grow.</h2><p>Fundraising depends on trust. HelpFund is being designed with campaign review, identity checks, clear updates and responsible withdrawal controls at its core.</p><Link href="/#safety" className="text-link">Learn about trust & safety <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner"><div><div className="eyebrow eyebrow-light">Your story matters</div><h2>Someone out there is ready to help.</h2><p>Take the first step. Start your fundraiser today.</p></div><Link href="/create" className="button button-white">Start a fundraiser <ArrowUpRight size={17} /></Link></div>
      </section>
    </>
  );
}
