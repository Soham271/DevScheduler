import React, { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

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

            <div className="mx-auto mt-6 max-w-2xl">
              <TextGenerateEffect words={DESCRIPTION} duration={0.75} />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ink-black)] bg-[var(--color-canvas-white)] px-6 py-3 text-sm font-semibold text-[var(--color-ink-black)] shadow-[var(--shadow-subtle-3)] transition-transform duration-200 hover:-translate-y-0.5"
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
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ash-gray)] bg-[rgba(255,255,255,0.32)] px-6 py-3 text-sm font-semibold text-[var(--color-charcoal)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </LampContainer>

      <section
        id="features-section"
        className=" -mt-10 relative px-6 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-18 lg:pt-14"
      >
        <div className="mx-auto max-w-9xl">
          <div className="display flex flex-col items-center text-center lineheight-1">
            <div data-scroll-fade>
              <p className="  align-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-slate-blue)] lineheight-3">
                Everything you need to level up
              </p>
              <h2 className="  font-display mt-3 max-w-[1200px] text-[clamp(1.9rem,3.7vw,3.12rem)] leading-[0.98] text-[var(--color-charcoal)] lineheight-1">
                A calmer, clearer home for your entire developer routine
              </h2>
            </div>

            <p
              data-scroll-fade
              className="  display flex justify-center max-w-3xl pt-2 text-base leading-8 text-[var(--color-cool-gray)]"
            >
              Stay updated with your developer journey every day using DevScheduler.
              Get smart reminders to solve coding problems and track your activity
              across LeetCode, CodeChef, Codeforces, and GitHub. Monitor your
              daily progress in real time, schedule automated emails, and stay
              consistent with your goals. All your productivity, insights, and
              coding growth - in one powerful and professional dashboard.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  data-feature-card
                  className="group rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] p-6 shadow-[var(--shadow-subtle-3)] transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]">
                      <Icon size={20} className="text-[var(--color-charcoal)]" />
                    </div>
                   
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

      <section className="px-6 pb-14 sm:px-8 lg:px-12 lg:pb-18">
        <div
          data-scroll-fade
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
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ink-black)] bg-[var(--color-canvas-white)] px-6 py-3 text-sm font-semibold text-[var(--color-ink-black)] shadow-[var(--shadow-subtle-3)] transition-transform duration-200 hover:-translate-y-0.5"
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
                className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-ash-gray)] bg-[transparent] px-6 py-3 text-sm font-semibold text-[var(--color-charcoal)]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

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
