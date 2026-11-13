"use client";

import { useState } from "react";
import { Heart, Loader2, ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/campaigns";

const SUGGESTED = [1000, 2000, 5000, 10000, 25000];

export function DonateForm({
  campaignId,
}: {
  campaignId: string;
  campaignTitle?: string;
}) {
  const [amount, setAmount] = useState(2000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    amount: number;
    provider: string;
  } | null>(null);

  const effectiveAmount = custom ? Number(custom) : amount;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          amount: effectiveAmount,
          donorName: name,
          donorEmail: email,
          message,
          isAnonymous: anonymous,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to start donation");
        setLoading(false);
        return;
      }

      // Paystack: redirect to checkout
      if (data.provider === "paystack" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Test adapter: confirm in place
      if (data.checkoutUrl) {
        const confirm = await fetch(data.checkoutUrl);
        const confirmData = await confirm.json();
        if (!confirm.ok) {
          setError(confirmData.error || "Payment confirmation failed");
          setLoading(false);
          return;
        }
      }

      setSuccess({ amount: effectiveAmount, provider: data.provider || "test" });
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--green-soft)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 12px",
          }}
        >
          <Heart size={22} color="var(--green)" />
        </div>
        <p style={{ fontWeight: 700, marginBottom: 6 }}>Thank you!</p>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
          {formatNaira(success.amount)} recorded successfully.
          {success.provider === "test" && (
            <>
              <br />
              <span style={{ fontSize: 12 }}>
                Test mode — no real money was charged.
              </span>
            </>
          )}
        </p>
        <button
          className="button button-outline button-full"
          type="button"
          onClick={() => window.location.reload()}
        >
          Refresh totals
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleDonate} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SUGGESTED.map((v) => (
          <button
            key={v}
            type="button"
            className={`button button-small ${
              !custom && amount === v ? "button-green" : "button-outline"
            }`}
            onClick={() => {
              setAmount(v);
              setCustom("");
            }}
          >
            {formatNaira(v)}
          </button>
        ))}
      </div>
      <label className="field-label">
        Custom amount (₦)
        <input
          type="number"
          min={100}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Enter amount"
        />
      </label>
      <label className="field-label">
        Your name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </label>
      <label className="field-label">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="field-label">
        Message (optional)
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Words of support"
        />
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
        }}
      >
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        Donate anonymously
      </label>
      {error && (
        <div
          style={{
            color: "#b42318",
            background: "#fef3f2",
            padding: 10,
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
      <button
        className="button button-green button-full"
        type="submit"
        disabled={loading || !effectiveAmount || effectiveAmount < 100}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Processing…
          </>
        ) : (
          <>
            Donate {formatNaira(effectiveAmount || 0)} <Heart size={17} />
          </>
        )}
      </button>
      <div className="trust-chip">
        <ShieldCheck size={14} />
        Secure checkout · Only verified payments count
      </div>
    </form>
  );
}
