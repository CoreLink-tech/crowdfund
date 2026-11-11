"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ImagePlus, Info } from "lucide-react";
import { categories, formatNaira } from "@/lib/campaigns";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Medical");
  const [goal, setGoal] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="form-page">
      <div className="container form-container">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back home</Link>
        <div className="form-heading"><div className="eyebrow">Start something meaningful</div><h1>Tell us what you’re raising funds for.</h1><p>Share the details. You can review everything before a fundraiser is published.</p></div>
        {submitted ? <div className="submission-state"><div className="submission-icon"><Info size={25} /></div><h2>Your draft is ready for the next step.</h2><p>This is a frontend demo. Your information has not been saved or submitted to HelpFund yet. Account creation and campaign storage will be connected in a later development phase.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Edit fundraiser details</button></div> :
          <form className="create-form" onSubmit={handleSubmit}>
            <div className="form-section-title"><span>01</span><div><h2>Fundraiser details</h2><p>Give your fundraiser a clear, specific title.</p></div></div>
            <label className="field-label">Fundraiser title<input required maxLength={90} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Help my mum access urgent medical treatment" /></label>
            <label className="field-label">Choose a category<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.filter((item) => item !== "All campaigns").map((item) => <option key={item}>{item}</option>)}</select></label>
            <div className="form-section-title"><span>02</span><div><h2>Fundraising goal</h2><p>Set a realistic target for what you need to raise.</p></div></div>
            <label className="field-label">How much do you want to raise?<div className="currency-input"><span>₦</span><input required type="number" min="1000" step="100" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="500000" /></div>{goal && Number(goal) > 0 && <small className="field-hint">Your target: {formatNaira(Number(goal))}</small>}</label>
            <label className="field-label">Where is this fundraiser based?<input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or state, Nigeria" /></label>
            <div className="form-section-title"><span>03</span><div><h2>Your story</h2><p>Help people understand why this fundraiser matters.</p></div></div>
            <label className="field-label">Tell your story<textarea required minLength={30} rows={7} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Explain who needs help, what happened, how the funds will be used and how you will share updates..." /><small className="field-hint">{story.length} characters · Aim for a clear, honest explanation.</small></label>
            <div className="upload-placeholder"><ImagePlus size={22} /><div><strong>Add a cover photo</strong><span>Image uploads will be enabled when storage is connected.</span></div><span className="upload-coming">Coming soon</span></div>
            <div className="form-notice"><Info size={17} /><p>Creating a fundraiser will require an account and identity checks. This demo does not store your information.</p></div>
            <button type="submit" className="button button-green button-full">Continue <ArrowRight size={17} /></button>
          </form>
        }
      </div>
    </section>
  );
}
