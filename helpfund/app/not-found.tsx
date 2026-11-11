import Link from "next/link";

export default function NotFound() {
  return <section className="empty-state page-not-found"><h1>We couldn't find that page.</h1><p>The page may have moved or the link may be incorrect.</p><Link href="/explore" className="button button-dark">Explore campaigns</Link></section>;
}
