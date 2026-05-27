import React, { useState } from "react";
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
import { TextGenerateEffect } from "../components/ui/TextGenerateEffect";
import { LampContainer } from "../components/ui/Lamp";
import AuthModal from "../components/AuthModal";
import { isLoggedIn } from "../utils/auth";

const DESCRIPTION =
  "Your all-in-one-powered developer productivity platform. Track coding contests, monitor GitHub activity, analyze LeetCode & Codeforces stats, and get intelligent insights - all in one beautiful dashboard.";

const FEATURES = [
  {
    icon: Trophy,
    title: "Contest Tracking",
    desc: "Never miss a contest. Real-time tracking across LeetCode, Codeforces, CodeChef & more.",
  },
  {
    icon: GitBranch,
    title: "GitHub Insights",
    desc: "Monitor contributions, pull requests, and commit streaks automatically.",
  },
  {
    icon: BarChart3,
    title: "Platform Analytics",
    desc: "Deep-dive into your rating history, problem stats, and solving patterns.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Automated email reminders and smart inactivity alerts to keep you on track.",
  },
  {
    icon: Zap,
    title: "Real-Time Feed",
    desc: "Live activity feed powered by WebSockets for instant platform updates.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT authentication with Google OAuth. Your data stays protected.",
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
    <div className="-mt-6 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_34%),var(--color-buttermilk)]">
      <LampContainer className="bg-transparent">
        <section className="relative flex flex-1 items-center justify-center px-6 pb-10 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            

            <motion.h1
              initial={{ opacity: 0.5, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="font-display text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.94] text-[var(--color-charcoal)]"
            >
              DevScheduler
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.65 }}
              className="mx-auto mt-6 max-w-2xl"
            >
              <TextGenerateEffect words={DESCRIPTION} duration={0.75} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ y: -1, boxShadow: "var(--shadow-subtle)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ink-black)] bg-[var(--color-canvas-white)] px-6 py-3 text-sm font-semibold text-[var(--color-ink-black)] shadow-[var(--shadow-subtle-3)]"
              >
                <Sparkles size={16} />
                Get Started
                <ArrowRight size={16} />
              </motion.button>

              <motion.button
                onClick={() =>
                  document
                    .getElementById("features-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                whileHover={{ y: -1, backgroundColor: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ash-gray)] bg-[rgba(255,255,255,0.32)] px-6 py-3 text-sm font-semibold text-[var(--color-charcoal)]"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </section>
      </LampContainer>

      <section
        id="features-section"
        className=" -mt-10 relative px-6 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-18 lg:pt-14"
      >
        <div className="mx-auto max-w-9xl">
          <div className="display flex flex-col items-center text-center lineheight-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55 }}
            >
              <p className="  align-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate-blue)] lineheight-3">
                Everything you need to level up
              </p>
              <h2 className="  font-display mt-3 max-w-[1200px] text-[clamp(1.9rem,3.7vw,3.12rem)] leading-[0.98] text-[var(--color-charcoal)] lineheight-1">
                A calmer, clearer home for your entire developer routine
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="  display flex justify-center max-w-3xl pt-2 text-base leading-8 text-[var(--color-cool-gray)]"
            >
              Stay updated with your developer journey every day using DevScheduler.
              Get smart reminders to solve coding problems and track your activity
              across LeetCode, CodeChef, Codeforces, and GitHub. Monitor your
              daily progress in real time, schedule automated emails, and stay
              consistent with your goals. All your productivity, insights, and
              coding growth - in one powerful and professional dashboard.
            </motion.p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  whileHover={{ y: -3 }}
                  className="group rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[var(--shadow-subtle-3)] transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]">
                      <Icon size={20} className="text-[var(--color-charcoal)]" />
                    </div>
                    <span className="rounded-full border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[var(--color-charcoal)]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-cool-gray)]">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-14 sm:px-8 lg:px-12 lg:pb-18">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-6xl rounded-[30px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_20px_50px_rgba(27,25,23,0.06)] sm:p-8 lg:p-10"
        >
         <div className="flex flex-col items-center text-center gap-8">
            <div>
              <p className=" text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate-blue)]">
                Ready to track your progress?
              </p>
              <h2 className="font-display mt-3 max-w-[900px] text-[clamp(1.7rem,3.8vw,2.7rem)] leading-[0.98] text-[var(--color-charcoal)]">
                Keep your workflow organized without losing the soft, bright feel.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-cool-gray)]">
                Join DevScheduler and take control of your competitive programming
                journey today.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end lg:self-center">
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ y: -1, boxShadow: "var(--shadow-subtle)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ink-black)] bg-[var(--color-canvas-white)] px-6 py-3 text-sm font-semibold text-[var(--color-ink-black)] shadow-[var(--shadow-subtle-3)]"
              >
                <Sparkles size={16} />
                Get Started
                <ArrowRight size={16} />
              </motion.button>

              <button
                onClick={() =>
                  document
                    .getElementById("features-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ash-gray)] bg-[transparent] px-6 py-3 text-sm font-semibold text-[var(--color-charcoal)]"
              >
                Learn More
              </button>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-8 max-w-6xl border-t border-[rgba(27,25,23,0.08)] pt-6">
          <p className="text-center text-xs text-[var(--color-cool-gray)]">
            Copyright 2026 DevScheduler. Built with passion for developers.
          </p>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default LandingPage;
