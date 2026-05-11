import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  GitBranch,
  BarChart3,
  Calendar,
  Zap,
  Shield,
} from "lucide-react";
import { LampContainer } from "../components/ui/Lamp";
import { TextGenerateEffect } from "../components/ui/TextGenerateEffect";
import { useState } from "react";
import AuthModal from "../components/AuthModal";
import { isLoggedIn } from "../utils/auth";
const DESCRIPTION =
  "Your all-in-one-powered developer productivity platform. Track coding contests, monitor GitHub activity, analyze LeetCode & Codeforces stats, and get intelligent insights — all in one beautiful dashboard.";

const FEATURES = [
  {
    icon: Trophy,
    title: "Contest Tracking",
    desc: "Never miss a contest. Real-time tracking across LeetCode, Codeforces, CodeChef & more.",
    color: "#f59e0b",
  },
  {
    icon: GitBranch,
    title: "GitHub Insights",
    desc: "Monitor contributions, pull requests, and commit streaks automatically.",
    color: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Platform Analytics",
    desc: "Deep-dive into your rating history, problem stats, and solving patterns.",
    color: "#6366f1",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Automated email reminders and smart inactivity alerts to keep you on track.",
    color: "#ec4899",
  },
  {
    icon: Zap,
    title: "Real-Time Feed",
    desc: "Live activity feed powered by WebSockets for instant platform updates.",
    color: "#06b6d4",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT authentication with Google OAuth. Your data stays protected.",
    color: "#8b5cf6",
  },
];



const LandingPage = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate("/dashboard");
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = ({ needsOnboarding }) => {
    setIsAuthenticated(true);
    setNeedsOnboarding(needsOnboarding);
    setShowAuthModal(false);
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginRight: "calc(-50vw + 50%)",
        marginTop: "-1.5rem",
        overflow: "hidden",
        background: "#f8fafc",
      }}
    >
      {/* ═══════════════ HERO SECTION WITH LAMP ═══════════════ */}
      <LampContainer>
        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            textAlign: "center",
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            background:
              "linear-gradient(to bottom right, #0f172a, #334155)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            margin: 0,
          }}
        >
          DevScheduler
        </motion.h1>
      </LampContainer>

      {/* ═══════════════ DESCRIPTION & CTA SECTION ═══════════════ */}
      <section
        style={{
          position: "relative",
          background: "#f8fafc",
          padding: "2rem 1.5rem 6rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Text generate effect for description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            maxWidth: "850px",
            textAlign: "center",
          }}
        >
          <TextGenerateEffect words={DESCRIPTION} duration={0.75} />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Primary CTA */}
          <motion.button
            onClick={handleGetStarted}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 50px rgba(6, 182, 212, 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.9rem 2.2rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background:
                "linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow:
                "0 8px 30px rgba(6, 182, 212, 0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              transition: "all 0.3s ease",
              letterSpacing: "0.01em",
              overflow: "hidden",
            }}
          >
            {/* Shimmer */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)",
                backgroundSize: "250% 100%",
                animation: "shimmer 3s ease-in-out infinite",
                borderRadius: "12px",
              }}
            />
            <Sparkles
              size={16}
              style={{ position: "relative", zIndex: 1 }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>
              Get Started
            </span>
            <ArrowRight
              size={16}
              style={{ position: "relative", zIndex: 1 }}
            />
          </motion.button>

          {/* Secondary CTA — Ghost */}
          <motion.button
            onClick={() => {
              document
                .getElementById("features-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            whileHover={{
              scale: 1.04,
              borderColor: "rgba(6, 182, 212, 0.5)",
              background: "rgba(6, 182, 212, 0.06)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "0.9rem 2.2rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "rgba(51, 65, 85, 0.9)",
              background: "transparent",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.01em",
            }}
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Platform badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "2.5rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >

        </motion.div>
      </section>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <section
        id="features-section"
        style={{
          position: "relative",
          background: "#f8fafc",
          padding: "5rem 1.5rem 6rem",
        }}
      >
        {/* Subtle gradient divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            maxWidth: "500px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)",
          }}
        />

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ textAlign: "center", marginBottom: "4rem" }}
        >

          <h2
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "#0a0b0dff",
              letterSpacing: "-0.02em",
              margin: "0 0 0.75rem",
              fontFamily: '"Space Grotesk", "Inter", sans-serif',
            }}
          >
            Everything you need to level up
          </h2>
          <p
            style={{
              fontSize: "clamp(1.1rem, 2.70vw, 1.5rem)",
              color: "#656565ff",
              maxWidth: "1300px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            Stay updated with your developer journey every day using DevScheduler.  Get smart reminders to solve coding problems and track your activity across LeetCode, CodeChef, Codeforces, and GitHub.Monitor your daily progress in real time, schedule automated emails, and stay consistent with your goals. All your productivity, insights, and coding growth — in one powerful and professional dashboard.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "1.25rem",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{
                  y: -4,
                  borderColor: `${feat.color}30`,
                  boxShadow: `0 20px 50px ${feat.color}08`,
                }}
                style={{
                  position: "relative",
                  padding: "1.75rem",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 1))",
                  border: "1px solid rgba(226, 232, 240, 1)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                  cursor: "default",
                  transition:
                    "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                  overflow: "hidden",
                }}
              >
                {/* Subtle gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${feat.color}25, transparent)`,
                  }}
                />

                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: `${feat.color}12`,
                    border: `1px solid ${feat.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Icon size={20} color={feat.color} strokeWidth={2} />
                </div>

                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    margin: "0 0 0.5rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feat.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(71, 85, 105, 0.8)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA SECTION ═══════════════ */}
      <section
        style={{
          position: "relative",
          background: "#f8fafc",
          padding: "3rem 1.5rem 5rem",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          {/* Glow background */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              height: "200px",
              background:
                "radial-gradient(closest-side, rgba(6,182,212,0.08), transparent)",
              pointerEvents: "none",
            }}
          />

          <h2
            style={{
              position: "relative",
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              margin: "0 0 0.75rem",
              fontFamily: '"Space Grotesk", "Inter", sans-serif',
            }}
          >
            Ready to track your progress?
          </h2>
          <p
            style={{
              position: "relative",
              fontSize: "0.95rem",
              color: "rgba(71, 85, 105, 0.8)",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            Join DevScheduler and take control of your competitive
            programming journey today.
          </p>

          <motion.button
            onClick={handleGetStarted}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 50px rgba(6, 182, 212, 0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.9rem 2.5rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#fff",
              background:
                "linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(6, 182, 212, 0.25)",
              transition: "all 0.3s ease",
              letterSpacing: "0.01em",
            }}
          >
            <Sparkles size={16} />
            Get Started
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>

        {/* Footer line */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(51, 65, 85, 0.2)",
          }}
        >
          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(100, 116, 139, 0.5)",
              margin: 0,
            }}
          >
            © 2026 DevScheduler. Built with passion for developers.
          </p>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
