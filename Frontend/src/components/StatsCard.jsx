import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  purple: { 
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
    iconBg: 'rgba(99,102,241,0.1)',
    iconColor: '#818cf8',
    glowColor: 'rgba(99,102,241,0.12)',
    accentLine: 'linear-gradient(to right, #818cf8, #a5b4fc)',
  },
  cyan: { 
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(34,211,238,0.04))',
    iconBg: 'rgba(6,182,212,0.1)',
    iconColor: '#22d3ee',
    glowColor: 'rgba(6,182,212,0.12)',
    accentLine: 'linear-gradient(to right, #22d3ee, #67e8f9)',
  },
  amber: { 
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.04))',
    iconBg: 'rgba(245,158,11,0.1)',
    iconColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.12)',
    accentLine: 'linear-gradient(to right, #f59e0b, #fbbf24)',
  },
  emerald: { 
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.04))',
    iconBg: 'rgba(16,185,129,0.1)',
    iconColor: '#34d399',
    glowColor: 'rgba(16,185,129,0.12)',
    accentLine: 'linear-gradient(to right, #34d399, #6ee7b7)',
  },
  rose: { 
    gradient: 'linear-gradient(135deg, rgba(244,63,94,0.08), rgba(251,113,133,0.04))',
    iconBg: 'rgba(244,63,94,0.1)',
    iconColor: '#fb7185',
    glowColor: 'rgba(244,63,94,0.12)',
    accentLine: 'linear-gradient(to right, #fb7185, #fda4af)',
  },
};

const StatsCard = ({ icon: Icon, label, value, subtitle, variant = 'purple' }) => {
  const v = variants[variant] || variants.purple;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      {/* Subtle accent line at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: v.accentLine }}
      />
      
      {/* Hover glow effect */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none"
        style={{ background: v.glowColor }}
      />

      <div className="relative z-10 flex items-start gap-4">
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: v.iconBg }}
        >
          <Icon size={20} style={{ color: v.iconColor }} />
        </div>
        <div className="min-w-0">
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</span>
          <strong className="block text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">{value ?? '—'}</strong>
          {subtitle && <span className="block text-xs text-gray-400 mt-1.5 font-medium">{subtitle}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
