import Link from "next/link";
import { Heart } from "lucide-react";

export default function SignInPage() {
  return (
    <section className="auth-page"><div className="auth-card">
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><Heart size={18} /></span><span>helpfund<span className="brand-period">.</span></span></Link>
      <div className="eyebrow">Welcome back</div><h1>Log in to HelpFund</h1><p className="auth-subtitle">Continue supporting the causes that matter to you.</p>
      <form className="auth-form" action="#"><label className="field-label">Email address<input type="email" placeholder="you@example.com" required /></label><label className="field-label">Password<input type="password" placeholder="Enter your password" required /></label><button className="button button-green button-full" type="button" disabled>Log in · Coming soon</button></form>
      <p className="auth-switch">New to HelpFund? <Link href="/sign-up">Create an account</Link></p><p className="auth-demo-note">Authentication is not connected in this first frontend build.</p>
    </div></section>
  );
}
