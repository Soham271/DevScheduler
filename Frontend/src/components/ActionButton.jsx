import React from 'react';
import { motion } from 'framer-motion';

const ActionButton = ({ children, onClick, disabled, type = 'button', className = '' }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: disabled 
          ? 'rgba(148,163,184,0.12)' 
          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
        backgroundSize: '200% 200%',
        color: disabled ? '#94a3b8' : '#fff',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled 
          ? 'none' 
          : '0 2px 12px rgba(99,102,241,0.25), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
      }}
    >
      {/* Shimmer overlay on hover */}
      {!disabled && (
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            animation: 'shimmer 3s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};

export default ActionButton;
