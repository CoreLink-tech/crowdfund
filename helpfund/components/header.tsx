import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Heart, Menu } from "lucide-react";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="HelpFund home">
          <span className="brand-mark">
            <Heart size={18} strokeWidth={2.7} />
          </span>
          <span>
            helpfund<span className="brand-period">.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/explore">Explore fundraisers</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/#safety">Trust & safety</Link>
        </nav>

        <div className="header-actions">
          <Suspense fallback={<div style={{ width: 120 }} />}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="header-signin" type="button">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="button button-dark button-small" type="button">
                  Start a fundraiser <ArrowUpRight size={15} />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="header-signin">
                Dashboard
              </Link>
              <Link
                href="/create"
                className="button button-dark button-small"
              >
                Start a fundraiser <ArrowUpRight size={15} />
              </Link>
              <UserButton />
            </Show>
          </Suspense>
        </div>

        <details className="mobile-nav">
          <summary className="mobile-menu" aria-label="Open menu">
            <Menu size={23} />
          </summary>
          <div className="mobile-nav-panel">
            <Link href="/explore">Explore fundraisers</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/#safety">Trust & safety</Link>
            <Suspense fallback={null}>
              <Show when="signed-out">
                <Link href="/sign-in">Log in</Link>
                <Link href="/sign-up">Create account</Link>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/create">Start a fundraiser</Link>
              </Show>
            </Suspense>
          </div>
        </details>
      </div>
    </header>
  );
}
