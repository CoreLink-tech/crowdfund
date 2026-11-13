"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import type { Campaign } from "@/lib/campaigns";

type ApiCampaign = {
  slug: string;
  title: string;
  organizer: string | null;
  location: string;
  category: string | null;
  raised: number;
  goal: number;
  donorCount: number;
  image: string | null;
  verified?: boolean;
  featured?: boolean;
  endDate?: string | Date | null;
};

function toCard(c: ApiCampaign): Campaign {
  const daysLeft = c.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 30;
  return {
    slug: c.slug,
    title: c.title,
    organizer: c.organizer || "Organizer",
    location: c.location,
    category: c.category || "Other",
    raised: c.raised,
    goal: c.goal,
    donors: c.donorCount || 0,
    daysLeft,
    image:
      c.image ||
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80",
    verified: c.verified,
    featured: c.featured,
    story: [],
  };
}

export default function ExplorePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<string[]>(["All campaigns"]);
  const [activeCategory, setActiveCategory] = useState("All campaigns");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const names = (data.categories || []).map(
          (c: { name: string }) => c.name
        );
        setCategories(["All campaigns", ...names]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "All campaigns") {
      params.set(
        "category",
        activeCategory.toLowerCase().replace(/\s+/g, "-")
      );
    }
    if (query.trim()) params.set("q", query.trim());

    fetch(`/api/campaigns?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCampaigns((data.campaigns || []).map(toCard));
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [activeCategory, query]);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <div className="eyebrow">Find a cause</div>
          <h1>Explore fundraisers</h1>
          <p>
            Discover people, families and communities working towards something
            that matters.
          </p>
        </div>
        <div className="explore-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns, causes or locations"
            />
          </div>
          <label className="sort-select">
            <SlidersHorizontal size={16} />
            <span>Sort by</span>
            <select defaultValue="popular">
              <option value="popular">Recommended</option>
              <option value="ending">Ending soon</option>
              <option value="progress">Most progress</option>
            </select>
          </label>
        </div>
        <div className="category-scroll">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`category-filter ${
                activeCategory === category ? "active" : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="results-row">
          <span>
            <strong>{loading ? "…" : campaigns.length}</strong> fundraisers
          </span>
          <span>Showing campaigns in Nigeria</span>
        </div>
        {loading ? (
          <div className="empty-state">
            <Loader2 size={30} className="animate-spin" />
            <h3>Loading fundraisers…</h3>
          </div>
        ) : campaigns.length ? (
          <div className="campaign-grid">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.slug} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Search size={30} />
            <h3>No fundraisers found</h3>
            <p>
              {query || activeCategory !== "All campaigns"
                ? "Try another search term or choose a different category."
                : "No approved campaigns yet. Be the first to create one."}
            </p>
            <button
              className="button button-outline"
              onClick={() => {
                setQuery("");
                setActiveCategory("All campaigns");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
