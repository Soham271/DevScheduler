import React from "react";
import { motion } from "framer-motion";

const ActionButton = ({ children, onClick, disabled, type = "button", className = "" }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -1 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] border px-6 py-3 text-sm font-semibold transition ${className}`}
      style={{
        background: disabled ? "rgba(229,229,229,0.7)" : "var(--color-canvas-white)",
        color: disabled ? "var(--color-cool-gray)" : "var(--color-ink-black)",
        borderColor: "var(--color-ink-black)",
        boxShadow: disabled ? "none" : "var(--shadow-subtle-3)",
      }}
    >
      <span className="flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default ActionButton;
