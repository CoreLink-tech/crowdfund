"use client";

import { Share2 } from "lucide-react";

export function ShareButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* User cancelled sharing. */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      window.alert("Campaign link copied.");
    }
  }
  return <button className="button button-outline button-full" onClick={share}><Share2 size={16} /> Share fundraiser</button>;
}
