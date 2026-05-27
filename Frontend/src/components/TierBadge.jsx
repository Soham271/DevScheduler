import React from "react";

const cfg = {
  beginner: { label: "Beginner", emoji: "Seed", tone: "rgba(152,148,168,0.12)" },
  intermediate: { label: "Intermediate", emoji: "Bolt", tone: "rgba(152,148,168,0.18)" },
  advanced: { label: "Advanced", emoji: "Crown", tone: "rgba(250,242,236,1)" },
  low: { label: "Low", emoji: "Trend", tone: "rgba(152,148,168,0.12)" },
  medium: { label: "Medium", emoji: "Target", tone: "rgba(152,148,168,0.18)" },
  high: { label: "High", emoji: "Star", tone: "rgba(250,242,236,1)" },
};

const TierBadge = ({ tier, type = "performance" }) => {
  if (!tier) return null;
  const c = cfg[tier.toLowerCase()] || {
    label: tier,
    emoji: "Tier",
    tone: "rgba(255,255,255,0.72)",
  };

  return (
    <div
      className="rounded-[18px] border border-[var(--color-ash-gray)] px-4 py-3"
      style={{ background: c.tone }}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
        {type === "performance" ? "Level" : "Rating"}
      </span>
      <strong className="mt-2 block text-sm font-semibold text-[var(--color-charcoal)]">
        {c.label}
      </strong>
    </div>
  );
};

export default TierBadge;
