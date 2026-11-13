"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Loader2, CheckCircle2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to reset password.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--muted)" }}>
          Missing or invalid reset token. Please request a new link.
        </p>
        <Link href="/forgot-password" className="button button-outline">
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <CheckCircle2
          size={40}
          color="var(--green)"
          style={{ marginBottom: 12 }}
        />
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Password updated</h2>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          You can now sign in with your new password.
        </p>
        <Link
          href="/sign-in"
          className="button button-green"
          style={{ marginTop: 20 }}
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field-label">
        New password
        <input
          type="password"
          placeholder="At least 8 characters with letters and numbers"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </label>
      <label className="field-label">
        Confirm password
        <input
          type="password"
          placeholder="Repeat your new password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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
            <Loader2 size={18} className="animate-spin" /> Updating…
          </>
        ) : (
          "Reset password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
        <h1>Choose a new password</h1>
        <p className="auth-subtitle">
          Enter a strong password to secure your HelpFund account.
        </p>

        <Suspense fallback={<div>Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </section>
  );
}
