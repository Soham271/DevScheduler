/* DESIGN UPDATE: Complete rewrite of lamp effect — warm amber radial glow instead of dark gray conic */
import React from "react";
import { motion } from "framer-motion";

export const LampContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`relative flex min-h-[85vh] w-full flex-col overflow-hidden bg-[var(--color-buttermilk)] ${className}`}
    >
      {/* DESIGN UPDATE: Warm amber radial glow container */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          top: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "200px",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.06) 40%, transparent 70%)",
          }}
        />

        {/* DESIGN UPDATE: Left beam line — 1px wide, ~200px tall, rotated -30deg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            position: "absolute",
            left: "50%",
            top: "0",
            width: "1px",
            height: "200px",
            transform: "translateX(-80px) rotate(-30deg)",
            transformOrigin: "top center",
            background:
              "linear-gradient(to bottom, rgba(251,191,36,0.3), rgba(251,191,36,0.05) 60%, transparent)",
          }}
        />

        {/* DESIGN UPDATE: Right beam line — 1px wide, ~200px tall, rotated +30deg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            position: "absolute",
            left: "50%",
            top: "0",
            width: "1px",
            height: "200px",
            transform: "translateX(80px) rotate(30deg)",
            transformOrigin: "top center",
            background:
              "linear-gradient(to bottom, rgba(251,191,36,0.3), rgba(251,191,36,0.05) 60%, transparent)",
          }}
        />
      </div>

      {/* DESIGN UPDATE: Subtle warm glow line at midpoint */}
      <div className="pointer-events-none absolute inset-x-0 top-[18rem] z-0 flex justify-center">
        <motion.div
          initial={{ width: "6rem", opacity: 0 }}
          whileInView={{ width: "20rem", opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="h-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(251,191,36,0.18), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
};
