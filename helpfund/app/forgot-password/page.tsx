"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to process request.");
        setLoading(false);
        return;
      }

      setDone(true);
      if (data.resetToken) setDevToken(data.resetToken);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link href="/" className="brand auth-brand">
          <span className="brand-mark">
            <Heart size={18} />
          </span>
          <span>
            helpfund<span className="brand-period">.</span>
          </span>
        </Link>
        <div className="eyebrow">Account recovery</div>
        <h1>Reset your password</h1>
        <p className="auth-subtitle">
          Enter the email associated with your account and we’ll prepare a reset
          link.
        </p>

        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <CheckCircle2
              size={40}
              color="var(--green)"
              style={{ marginBottom: 12 }}
            />
            <h2 style={{ fontSize: 18, marginBottom: 8 }}>Check your email</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              If an account exists for that address, a password reset link has
              been prepared.
            </p>
            {devToken && (
              <div
                style={{
                  marginTop: 16,
                  padding: 12,
                  background: "#fff8e6",
                  borderRadius: 8,
                  fontSize: 12,
                  wordBreak: "break-all",
                  textAlign: "left",
                }}
              >
                <strong>Dev only:</strong>{" "}
                <Link href={`/reset-password?token=${devToken}`}>
                  Reset link (token exposed in development)
                </Link>
              </div>
            )}
            <Link
              href="/sign-in"
              className="button button-outline"
              style={{ marginTop: 20 }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </label>

            {error && (
              <div
                style={{
                  color: "#b42318",
                  background: "#fef3f2",
                  padding: "12px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {error}
              </div>
            )}

            <button
              className="button button-green button-full"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password? <Link href="/sign-in">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
