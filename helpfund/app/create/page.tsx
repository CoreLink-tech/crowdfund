"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { formatNaira } from "@/lib/campaigns";

type Category = { id: string; name: string; slug: string };

export default function CreatePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [howFundsUsed, setHowFundsUsed] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [submitForReview, setSubmitForReview] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = data.categories || [];
        setCategories(list);
        if (list[0]) setCategoryId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/create");
    }
  }, [isLoaded, isSignedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || story.slice(0, 200),
          story,
          categoryId,
          location,
          goalAmount: Number(goal),
          coverImageUrl: coverImageUrl || undefined,
          howFundsUsed,
          submitForReview,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to create campaign");
        setLoading(false);
        return;
      }

      setCreatedSlug(data.campaign.slug);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <section className="form-page">
        <div className="container form-container">
          <p>Checking authentication…</p>
        </div>
      </section>
    );
  }

  if (createdSlug) {
    return (
      <section className="form-page">
        <div className="container form-container">
          <div className="submission-state">
            <div className="submission-icon">
              <Info size={25} />
            </div>
            <h2>Campaign created</h2>
            <p>
              {submitForReview
                ? "Your campaign has been submitted for review. It will appear publicly once approved by an administrator."
                : "Your draft has been saved. You can submit it for review from your dashboard."}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/dashboard" className="button button-dark">
                Go to dashboard
              </Link>
              <Link href="/explore" className="button button-outline">
                Explore campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <div className="container form-container">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>
        <div className="form-heading">
          <div className="eyebrow">Start something meaningful</div>
          <h1>Tell us what you’re raising funds for.</h1>
          <p>
            Share the details. Campaigns are reviewed before they appear
            publicly.
          </p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h2>Fundraiser details</h2>
              <p>Give your fundraiser a clear, specific title.</p>
            </div>
          </div>

          <label className="field-label">
            Fundraiser title
            <input
              required
              maxLength={90}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Help my mum access urgent medical treatment"
            />
          </label>

          <label className="field-label">
            Choose a category
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.length === 0 && (
                <option value="">Loading categories…</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Location
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, Nigeria"
            />
          </label>

          <div className="form-section-title">
            <span>02</span>
            <div>
              <h2>Fundraising goal</h2>
              <p>Set a realistic target in Nigerian Naira (NGN).</p>
            </div>
          </div>

          <label className="field-label">
            How much do you want to raise?
            <div className="currency-input">
              <span>₦</span>
              <input
                required
                type="number"
                min={1000}
                step={100}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="500000"
              />
            </div>
            {goal && Number(goal) > 0 && (
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                Goal: {formatNaira(Number(goal))}
              </span>
            )}
          </label>

          <div className="form-section-title">
            <span>03</span>
            <div>
              <h2>Your story</h2>
              <p>Explain why this matters and how the funds will be used.</p>
            </div>
          </div>

          <label className="field-label">
            Short summary
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short overview of what you're raising money for"
            />
          </label>

          <label className="field-label">
            Full story
            <textarea
              required
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Share the full context so supporters understand the need"
            />
          </label>

          <label className="field-label">
            How will the funds be used?
            <textarea
              rows={3}
              value={howFundsUsed}
              onChange={(e) => setHowFundsUsed(e.target.value)}
              placeholder="e.g. Surgery fees, hospital stay, medication"
            />
          </label>

          <label className="field-label">
            Cover image URL (optional)
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label
            className="field-label"
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <input
              type="checkbox"
              checked={submitForReview}
              onChange={(e) => setSubmitForReview(e.target.checked)}
            />
            <span>Submit for review now (recommended)</span>
          </label>

          {error && (
            <div
              style={{
                color: "#b42318",
                background: "#fef3f2",
                padding: "12px 14px",
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
            disabled={loading || !categoryId}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving…
              </>
            ) : submitForReview ? (
              "Submit for review"
            ) : (
              "Save as draft"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
