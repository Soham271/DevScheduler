import React from "react";
import { motion } from "framer-motion";

export const LampContainer = ({ children, className = "" }) => {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "flex",
        minHeight: "55vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#f8fafc",
        width: "100%",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          flex: "1 1 0%",
          transform: "scaleY(1.25)",
          alignItems: "center",
          justifyContent: "center",
          isolation: "isolate",
          zIndex: 0,
        }}
      >
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "40rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto auto 50% auto",
            right: "50%",
            zIndex: 20,
            height: "20rem",
            backgroundImage: "conic-gradient(from 70deg at center bottom, #021d29ff, transparent, transparent)",
            color: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              bottom: 0,
              left: 0,
              zIndex: 20,
              background: "#f8fafc",
              maskImage: "linear-gradient(to top, white, transparent)",
              WebkitMaskImage: "linear-gradient(to top, white, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              bottom: 0,
              left: 0,
              zIndex: 20,
              background: "#f8fafc",
              maskImage: "linear-gradient(to left, white, transparent)",
              WebkitMaskImage: "linear-gradient(to left, white, transparent)",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "40rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto auto 50% auto",
            left: "50%",
            zIndex: 20,
            height: "20rem",
            backgroundImage: "conic-gradient(from 290deg at center bottom, transparent, transparent, #0ea5e9)",
            color: "transparent",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              bottom: 0,
              left: 0,
              zIndex: 20,
              background: "#f8fafc",
              maskImage: "linear-gradient(to top, white, transparent)",
              WebkitMaskImage: "linear-gradient(to top, white, transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              bottom: 0,
              left: 0,
              zIndex: 20,
              background: "#f8fafc",
              maskImage: "linear-gradient(to right, white, transparent)",
              WebkitMaskImage: "linear-gradient(to right, white, transparent)",
            }}
          />
        </motion.div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            height: "50%",
            width: "100%",
            background: "#f8fafc",
            zIndex: 40,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: "auto auto 50% auto",
            zIndex: 50,
            height: "0.5rem",
            width: "100%",
            transform: "translateY(50%)",
            background: "transparent",
            boxShadow: "0 0 120px rgba(14, 165, 233, 0.4)",
            opacity: 0.5,
          }}
        />

        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "24rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto auto 50% auto",
            zIndex: 30,
            height: "36px",
            transform: "translateY(50%)",
            background: "transparent",
            boxShadow: "0 0 60px 20px rgba(14, 165, 233, 0.5)",
            borderRadius: "50%",
            filter: "blur(20px)",
          }}
        />

        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "50rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: "auto auto 50% auto",
            zIndex: 50,
            height: "5px",
            transform: "translateY(50%)",
            background: "linear-gradient(90deg, transparent, #11729bff, transparent)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {children}
      </div>
    </div>
  );
};
