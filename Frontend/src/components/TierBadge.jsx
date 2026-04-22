import React from 'react';

const cfg = {
  beginner: { label: 'Beginner', emoji: '🌱', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  intermediate: { label: 'Intermediate', emoji: '⚡', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  advanced: { label: 'Advanced', emoji: '🏆', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  low: { label: 'Low', emoji: '📈', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  medium: { label: 'Medium', emoji: '🎯', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
  high: { label: 'High', emoji: '🌟', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
};

const TierBadge = ({ tier, type = 'performance' }) => {
  if (!tier) return null;
  const c = cfg[tier.toLowerCase()] || { label: tier, emoji: '•', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl px-4 py-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform`}>
      <span className="text-2xl">{c.emoji}</span>
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{type === 'performance' ? 'Level' : 'Rating'}</span>
        <strong className={`text-sm font-bold ${c.text}`}>{c.label}</strong>
      </div>
    </div>
  );
};

export default TierBadge;
