import Link from "next/link";
import { Heart } from "lucide-react";

export default function SignUpPage() {
  return (
    <section className="auth-page"><div className="auth-card">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={18} /></span><span>helpfund<span className="brand-period">.</span></span></Link>
      <div className="eyebrow">Join the community</div><h1>Create your account</h1><p className="auth-subtitle">Start a fundraiser or support a cause close to your heart.</p>
      <form className="auth-form" action="#"><label className="field-label">Full name<input type="text" placeholder="Your full name" required /></label><label className="field-label">Email address<input type="email" placeholder="you@example.com" required /></label><label className="field-label">Password<input type="password" placeholder="Create a password" required /></label><button className="button button-green button-full" type="button" disabled>Create account · Coming soon</button></form>
      <p className="auth-switch">Already have an account? <Link href="/sign-in">Log in</Link></p><p className="auth-demo-note">Account creation is not connected in this first frontend build.</p>
    </div></section>
  );
}
