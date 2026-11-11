import Link from "next/link";
import { ArrowUpRight, Heart, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="HelpFund home">
          <span className="brand-mark"><Heart size={18} strokeWidth={2.7} /></span>
          <span>helpfund<span className="brand-period">.</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/explore">Explore fundraisers</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#safety">Trust & safety</Link>
        </nav>

        <div className="header-actions">
          <Link href="/sign-in" className="header-signin">Log in</Link>
          <Link href="/create" className="button button-dark button-small">Start a fundraiser <ArrowUpRight size={15} /></Link>
        </div>
        <details className="mobile-nav">
          <summary className="mobile-menu" aria-label="Open menu"><Menu size={23} /></summary>
          <div className="mobile-nav-panel">
            <Link href="/explore">Explore fundraisers</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#safety">Trust & safety</Link>
            <Link href="/sign-in">Log in</Link>
            <Link href="/create">Start a fundraiser</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
