"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AdminReviewActions({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    setError("");
    setLoading(action);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          action,
          reason: action === "reject" ? "Does not meet platform guidelines" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("Request failed");
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <button
        type="button"
        className="button button-green button-small"
        disabled={!!loading}
        onClick={() => act("approve")}
      >
        {loading === "approve" ? <Loader2 size={14} className="animate-spin" /> : null}
        Approve
      </button>
      <button
        type="button"
        className="button button-outline button-small"
        disabled={!!loading}
        onClick={() => act("reject")}
      >
        {loading === "reject" ? <Loader2 size={14} className="animate-spin" /> : null}
        Reject
      </button>
      {error && (
        <span style={{ color: "#b42318", fontSize: 13 }}>{error}</span>
      )}
    </div>
  );
}
