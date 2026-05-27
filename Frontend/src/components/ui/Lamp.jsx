import React from "react";
import { motion } from "framer-motion";

export const LampContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`relative flex min-h-[85vh] w-full flex-col overflow-hidden bg-[var(--color-buttermilk)] ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 flex h-[20rem] scale-y-125 items-start justify-center isolate">
        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "24rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute right-1/2 top-24 z-20 h-80 bg-[conic-gradient(from_70deg_at_center_bottom,rgba(27,25,23,0.03),transparent,transparent)] text-transparent"
        >
          <div className="absolute inset-0 z-20 bg-[var(--color-buttermilk)] [mask-image:linear-gradient(to_top,white,transparent)] [-webkit-mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute inset-0 z-20 bg-[var(--color-buttermilk)] [mask-image:linear-gradient(to_left,white,transparent)] [-webkit-mask-image:linear-gradient(to_left,white,transparent)]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: "8rem" }}
          whileInView={{ opacity: 1, width: "24rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-24 z-20 h-80 bg-[conic-gradient(from_290deg_at_center_bottom,transparent,transparent,rgba(27,25,23,0.03))] text-transparent"
        >
          <div className="absolute inset-0 z-20 bg-[var(--color-buttermilk)] [mask-image:linear-gradient(to_top,white,transparent)] [-webkit-mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute inset-0 z-20 bg-[var(--color-buttermilk)] [mask-image:linear-gradient(to_right,white,transparent)] [-webkit-mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        <div className="absolute inset-x-0 top-1/2 z-40 h-1/2 bg-[var(--color-buttermilk)]" />

        <div className="absolute inset-x-0 top-1/2 z-50 h-2 translate-y-1/2 bg-transparent opacity-30 shadow-[0_0_80px_rgba(27,25,23,0.06)]" />

        <motion.div
          initial={{ width: "6rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 z-30 h-9 translate-y-1/2 rounded-full bg-transparent blur-[20px] shadow-[0_0_40px_10px_rgba(27,25,23,0.03)]"
        />

        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 z-50 h-[3px] max-w-full translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(27,25,23,0.12),transparent)]"
        />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
    </div>
  );
};
