import React from "react";
import { Bell, Bot, Clock, Mail, Radio, Trophy, Zap } from "lucide-react";

const GithubIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const typeIcons = {
  contest: Trophy,
  reminder: Bell,
  productivity: Zap,
  email: Mail,
  ai: Bot,
  system: Radio,
  github: GithubIcon,
};

const typeColors = {
  contest: { bg: "rgba(250,242,236,1)", color: "#1b1917" },
  reminder: { bg: "rgba(250,242,236,1)", color: "#1b1917" },
  productivity: { bg: "rgba(250,242,236,1)", color: "#1b1917" },
  email: { bg: "rgba(255,255,255,1)", color: "#1b1917" },
  ai: { bg: "rgba(255,255,255,1)", color: "#1b1917" },
  system: { bg: "rgba(255,255,255,1)", color: "#1b1917" },
  github: { bg: "rgba(255,255,255,1)", color: "#1b1917" },
};

function timeAgo(unixTs) {
  const seconds = Math.floor(Date.now() / 1000 - unixTs);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const ActivityItem = ({ activity, onMarkRead }) => {
  const Icon = typeIcons[activity.type] || Radio;
  const tone = typeColors[activity.type] || typeColors.system;

  return (
    <button
      type="button"
      onClick={() => !activity.read && onMarkRead?.(activity.id)}

      className={`relative z-10 w-full rounded-[20px] border p-4 text-left transition-all duration-200 cursor-pointer hover:border-l-2 hover:border-l-[#10b981] hover:bg-[#F0FDF4] ${activity.read
        ? "border-[var(--color-ash-gray)] bg-[rgba(255,255,255,0.62)]"
        : "border-[rgba(27,25,23,0.12)] bg-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)]"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] border border-[var(--color-ash-gray)]"
          style={{ background: tone.bg }}
        >
          <Icon size={16} style={{ color: tone.color }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[var(--color-charcoal)]">
              {activity.title}
            </span>
            {!activity.read && (
              <span className="h-2 w-2 rounded-full bg-[var(--color-field-green)] shadow-[0_0_8px_rgba(43,62,167,0.35)]" />
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--color-cool-gray)]">
            {activity.message}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-cool-gray)]">
              <Clock size={11} />
              {timeAgo(activity.created_at)}
            </span>
            <span className="rounded-full border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
              {activity.type}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ActivityItem;
