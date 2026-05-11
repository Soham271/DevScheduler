import React, { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className = "",
  filter = true,
  duration = 0.5,
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope.current) {
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration: duration,
          delay: stagger(0.1),
        }
      );
    }
  }, [scope, animate, filter, duration]);

  return (
    <div className={className} ref={scope}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0" }}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            style={{
              opacity: 0,
              filter: filter ? "blur(10px)" : "none",
              display: "inline-block",
              marginRight: "0.32em",
              color: "rgba(53, 54, 55, 0.9)",
              fontSize: "clamp(0.99rem, 1.83vw, 1.19rem)",
              lineHeight: 1.8,
              fontWeight: 600,
              letterSpacing: "0.005em",
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
};
