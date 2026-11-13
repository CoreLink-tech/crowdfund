"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { formatNaira } from "@/lib/campaigns";

const SUGGESTED = [1000, 2000, 5000, 10000];

export function DonateForm({
  campaignId,
  campaignTitle,
}: {
  campaignId: string;
  campaignTitle: string;
}) {
  const [amount, setAmount] = useState(2000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    donationId: string;
    checkoutUrl?: string;
  } | null>(null);

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
          amount,
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

      // Test adapter: confirm immediately
      if (data.checkoutUrl) {
        const confirm = await fetch(data.checkoutUrl);
        const confirmData = await confirm.json();
        if (!confirm.ok) {
          setError(confirmData.error || "Payment confirmation failed");
          setLoading(false);
          return;
        }
      }

      setSuccess({ donationId: data.donationId, checkoutUrl: data.checkoutUrl });
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>Thank you!</p>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>
          Your test donation of {formatNaira(amount)} was recorded.
          <br />
          <span style={{ fontSize: 12 }}>
            (Test mode — no real money was charged)
          </span>
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
              amount === v ? "button-green" : "button-outline"
            }`}
            onClick={() => setAmount(v)}
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
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
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
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Processing…
          </>
        ) : (
          <>
            Donate {formatNaira(amount)} <Heart size={17} />
          </>
        )}
      </button>
      <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
        Test payment only. No real money is processed yet.
      </p>
    </form>
  );
}
