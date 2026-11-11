"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { campaigns, categories } from "@/lib/campaigns";

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All campaigns");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");

  const filtered = useMemo(() => {
    let result = campaigns.filter((campaign) => {
      const categoryMatch = activeCategory === "All campaigns" || campaign.category === activeCategory;
      const searchMatch = `${campaign.title} ${campaign.organizer} ${campaign.location} ${campaign.category}`.toLowerCase().includes(query.toLowerCase());
      return categoryMatch && searchMatch;
    });
    if (sort === "ending") result = [...result].sort((a, b) => a.daysLeft - b.daysLeft);
    if (sort === "progress") result = [...result].sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    return result;
  }, [activeCategory, query, sort]);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <div className="eyebrow">Find a cause</div>
          <h1>Explore fundraisers</h1>
          <p>Discover people, families and communities working towards something that matters.</p>
        </div>
        <div className="explore-toolbar">
          <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns, causes or locations" /></div>
          <label className="sort-select"><SlidersHorizontal size={16} /><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Recommended</option><option value="ending">Ending soon</option><option value="progress">Most progress</option></select></label>
        </div>
        <div className="category-scroll">
          {categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`category-filter ${activeCategory === category ? "active" : ""}`}>{category}</button>)}
        </div>
        <div className="results-row"><span><strong>{filtered.length}</strong> fundraisers</span><span>Showing campaigns in Nigeria</span></div>
        {filtered.length ? <div className="campaign-grid">{filtered.map((campaign) => <CampaignCard key={campaign.slug} campaign={campaign} />)}</div> : <div className="empty-state"><Search size={30} /><h3>No fundraisers found</h3><p>Try another search term or choose a different category.</p><button className="button button-outline" onClick={() => { setQuery(""); setActiveCategory("All campaigns"); }}>Clear filters</button></div>}
      </div>
    </section>
  );
}
