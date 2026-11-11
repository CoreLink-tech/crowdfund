import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <span className="brand-mark"><Heart size={18} strokeWidth={2.7} /></span>
              <span>helpfund<span className="brand-period">.</span></span>
            </Link>
            <p>When people come together, meaningful things become possible.</p>
          </div>
          <div className="footer-column">
            <strong>Discover</strong>
            <Link href="/explore">Explore campaigns</Link>
            <Link href="/create">Start a fundraiser</Link>
            <Link href="/#how-it-works">How it works</Link>
          </div>
          <div className="footer-column">
            <strong>Help</strong>
            <Link href="/#safety">Trust & safety</Link>
            <a href="mailto:hello@helpfund.example">Contact us</a>
            <a href="mailto:support@helpfund.example">Help centre</a>
          </div>
          <div className="footer-column">
            <strong>Legal</strong>
            <a href="#terms">Terms of use</a>
            <a href="#privacy">Privacy policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 HelpFund. Built for people helping people.</span>
          <span className="footer-country">Made with care in Africa <span>✳</span></span>
        </div>
      </div>
    </footer>
  );
}
