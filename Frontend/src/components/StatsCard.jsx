import React from 'react';

const variants = {
  purple: { bg: 'bg-brand-50', ring: 'bg-brand-100 text-brand-600', border: 'border-brand-100' },
  cyan: { bg: 'bg-cyan-50', ring: 'bg-cyan-100 text-cyan-600', border: 'border-cyan-100' },
  amber: { bg: 'bg-amber-50', ring: 'bg-amber-100 text-amber-600', border: 'border-amber-100' },
  emerald: { bg: 'bg-emerald-50', ring: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  rose: { bg: 'bg-rose-50', ring: 'bg-rose-100 text-rose-600', border: 'border-rose-100' },
};

const StatsCard = ({ icon: Icon, label, value, subtitle, variant = 'purple' }) => {
  const v = variants[variant] || variants.purple;
  return (
    <div className={`${v.bg} ${v.border} border rounded-2xl p-5 flex items-start gap-4 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md`}>
      <div className={`${v.ring} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
        <strong className="block text-2xl font-extrabold text-gray-900 leading-tight">{value ?? '—'}</strong>
        {subtitle && <span className="block text-xs text-gray-500 mt-1">{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
