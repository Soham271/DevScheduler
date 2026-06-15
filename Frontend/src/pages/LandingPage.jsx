/* DESIGN UPDATE: Complete landing page overhaul — rotating text, social proof badges, condensed features, updated footer */
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  BarChart3,
  Calendar,
  Zap,
} from "lucide-react";
import { TextGenerateEffect } from "../components/ui/TextGenerateEffect";
import { LampContainer } from "../components/ui/Lamp";
import AuthModal from "../components/AuthModal";

import { isLoggedIn } from "../utils/auth";

gsap.registerPlugin(ScrollTrigger);

/* DESIGN UPDATE: shortened subtitle for cleaner hero */
const DESCRIPTION =
  "Your all-in-one developer productivity platform.";

/* DESIGN UPDATE: rotating text phrases */
const ROTATING_PHRASES = [
  "Track contests.",
  "Analyze profiles.",
  "Monitor GitHub.",
  "Schedule reminders.",
];

/* DESIGN UPDATE: condensed to 3 most impactful features */
const FEATURES = [
  {
    icon: BarChart3,
    title: "Profile Analysis",
    desc: "Analyze your Codeforces, LeetCode & CodeChef profiles in one click.",
  },
  {
    icon: Trophy,
    title: "Contest Tracker",
    desc: "5+ upcoming contests tracked live across all platforms.",
  },
  {
    icon: Calendar,
    title: "Smart Reminders",
    desc: "Schedule daily coding reminders straight to your inbox.",
  },
];

/* DESIGN UPDATE: rotating text component */
const RotatingText = ({ phrases, interval = 2500 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, interval);
    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <div className="mt-4 h-8 overflow-hidden">
      <div
        key={index}
        className="text-base font-medium text-[var(--color-cool-gray)]"
        style={{
          animation: "rotateTextIn 2.5s ease forwards",
        }}
      >
        {phrases[index]}
      </div>
    </div>
  );
};

const LandingPage = ({ setIsAuthenticated, setNeedsOnboarding }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      mm.add(
        {
          desktop: "(min-width: 768px)",
          mobile: "(max-width: 767px)",
        },
        (context) => {
          const distance = context.conditions.mobile ? 36 : 60;
          const sections = gsap.utils.toArray("[data-scroll-fade]");
          const cards = gsap.utils.toArray("[data-feature-card]");

          sections.forEach((section) => {
            gsap.fromTo(
              section,
              { autoAlpha: 0, y: distance },
              {
                autoAlpha: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 82%",
                  end: "top 48%",
                  scrub: false,
                  toggleActions: "play none none reverse",
                },
              }
            );
          });

          if (cards.length) {
            gsap.fromTo(
              cards,
              { autoAlpha: 0, y: distance * 0.7 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.9,
                stagger: context.conditions.mobile ? 0.08 : 0.12,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: "#features-section",
                  start: "top 68%",
                  end: "top 34%",
                  scrub: false,
                  toggleActions: "play none none reverse",
                },
              }
            );
          }
        }
      );
    }, page);

    ScrollTrigger.refresh();

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

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
      ref={pageRef}
      className="-mt-6 ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_34%),var(--color-buttermilk)]"
    >
   
      <LampContainer className="bg-transparent">
        <section className="relative flex flex-1 items-center justify-center px-6 pb-10 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            

            <h1 className="font-display text-[clamp(3.1rem,7vw,6.1rem)] leading-[0.94] text-[var(--color-charcoal)]">
              DevScheduler
            </h1>

            {/* DESIGN UPDATE: cleaner subtitle */}
            <div className="mx-auto mt-6 max-w-2xl">
              <TextGenerateEffect words={DESCRIPTION} duration={0.75} />
            </div>

            {/* DESIGN UPDATE: rotating text animation */}
            <RotatingText phrases={ROTATING_PHRASES} interval={2500} />

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {/* DESIGN UPDATE: filled dark pill CTA */}
              <button
                onClick={handleGetStarted}
                className="btn-primary-dark inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-black)] bg-[var(--color-charcoal)] px-7 py-3.5 text-sm font-semibold text-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Get Started
                <ArrowRight size={16} />
              </button>

              {/* DESIGN UPDATE: ghost/outline pill CTA */}
              <button
                onClick={() =>
                  document
                    .getElementById("features-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ash-gray)] bg-transparent px-7 py-3.5 text-sm font-semibold text-[var(--color-charcoal)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-charcoal)]"
              >
                Learn More
              </button>
            </div>

            {/* DESIGN UPDATE: social proof badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-medium text-[var(--color-cool-gray)]">
                🏆 Codeforces
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-medium text-[var(--color-cool-gray)]">
                ⚡ LeetCode
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-medium text-[var(--color-cool-gray)]">
                👾 CodeChef
              </span>
            </div>
          </div>
        </section>
      </LampContainer>

      {/* DESIGN UPDATE: Feature preview strip on slightly darker cream */}
      <section
        id="features-section"
        className="relative px-6 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-18 lg:pt-14"
        style={{ backgroundColor: "#F2EDE4" }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center" data-scroll-fade>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate-blue)]">
              Everything you need to level up
            </p>
            <h2 className="font-display mt-3 max-w-[800px] text-[clamp(1.9rem,3.7vw,3.12rem)] leading-[0.98] text-[var(--color-charcoal)]">
              A calmer, clearer home for your developer routine
            </h2>
          </div>

          {/* DESIGN UPDATE: 3-column feature cards */}
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  data-feature-card
                  className="group rounded-[16px] border border-[rgba(27,25,23,0.08)] bg-white p-6 shadow-[var(--shadow-subtle-3)] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]">
                    <Icon size={20} className="text-[var(--color-charcoal)]" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[var(--color-charcoal)]">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-cool-gray)]">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESIGN UPDATE: CTA section */}
      <section className="px-6 pb-8 sm:px-8 lg:px-12" style={{ backgroundColor: "#F2EDE4" }}>
        <div
          data-scroll-fade
          className="mx-auto max-w-5xl rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_20px_50px_rgba(27,25,23,0.06)] sm:p-8 lg:p-10"
        >
         <div className="flex flex-col items-center text-center gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate-blue)]">
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

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGetStarted}
                className="btn-primary-dark inline-flex items-center gap-2 rounded-full border border-[var(--color-ink-black)] bg-[var(--color-charcoal)] px-7 py-3.5 text-sm font-semibold text-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <Sparkles size={16} />
                Get Started
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() =>
                  document
                    .getElementById("features-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ash-gray)] bg-transparent px-7 py-3.5 text-sm font-semibold text-[var(--color-charcoal)]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* DESIGN UPDATE: single-line footer */}
        <div className="mx-auto mt-8 max-w-5xl pt-6">
          <p className="text-center text-[13px] text-[var(--color-cool-gray)]">
            Built for competitive programmers. © 2025 DevScheduler
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
