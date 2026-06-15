/* DESIGN UPDATE: Added thematic bottom-border accent and hover state with amber left border */
import React from "react";
import { motion } from "framer-motion";

/* DESIGN UPDATE: variant colors now include a border accent color */
const variants = {
  purple: { tone: "rgba(152,148,168,0.16)", accent: "#9894a8" },
  cyan: { tone: "rgba(152,148,168,0.16)", accent: "#06b6d4" },
  amber: { tone: "rgba(250,242,236,1)", accent: "#f59e0b" },
  emerald: { tone: "rgba(250,242,236,1)", accent: "#10b981" },
  rose: { tone: "rgba(152,148,168,0.16)", accent: "#f43f5e" },
};

const StatsCard = ({ icon: Icon, label, value, subtitle, variant = "purple" }) => {
  const v = variants[variant] || variants.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
      /* DESIGN UPDATE: cursor pointer + transition for card hover accent */
      className="relative overflow-hidden rounded-[22px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.76)] p-4 shadow-[0_10px_24px_rgba(27,25,23,0.05)] cursor-pointer transition-all duration-200 hover:bg-[#FFF9F4] hover:border-l-2 hover:border-l-[#F59E0B]"
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(27,25,23,0.18), transparent)" }}
      />
      {/* DESIGN UPDATE: 1px bottom-border accent using thematic color */}
      <div
        className="absolute inset-x-0 bottom-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${v.accent}, transparent)` }}
      />
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-[var(--color-ash-gray)]"
          style={{ background: v.tone }}
        >
          <Icon size={18} className="text-[var(--color-charcoal)]" />
        </div>
        <div className="min-w-0 flex-1">
          {/* DESIGN UPDATE: uppercase 10px label with letter-spacing */}
          <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-slate-blue)]">
            {label}
          </span>
          <strong className="mt-2 block text-[1.8rem] font-semibold leading-none text-[var(--color-charcoal)]">
            {value ?? "-"}
          </strong>
          {subtitle && (
            <span className="mt-2 block text-xs leading-5 text-[var(--color-cool-gray)]">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
