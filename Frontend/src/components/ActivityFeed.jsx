import React, { useState } from "react";
import {
  Activity,
  Bell,
  ChevronDown,
  Mail,
  Radio,
  Sparkles,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";
import ActivityItem from "./ActivityItem";
import { useActivityFeed } from "../hooks/useActivityFeed";

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

const filters = [
  { key: "all", label: "All", icon: Radio },
  { key: "contest", label: "Contests", icon: Trophy },
  { key: "github", label: "GitHub", icon: GithubIcon },
  { key: "reminder", label: "Reminders", icon: Bell },
  { key: "productivity", label: "Productivity", icon: Zap },
  { key: "email", label: "Email", icon: Mail },
];

const ActivityFeed = () => {
  const { activities, unreadCount, loading, loadingMore, hasMore, markAsRead, clearAll, loadMore } =
    useActivityFeed(30);
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all" ? activities : activities.filter((a) => a.type === activeFilter);

  return (
    <section className="rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.74)] p-5 shadow-[0_12px_30px_rgba(27,25,23,0.06)] sm:p-6 flex flex-col min-h-[620px]">
      <div className="flex flex-col gap-4 border-b border-[rgba(27,25,23,0.08)] pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-slate-blue)]">
              <Sparkles size={12} />
              Live Feed
            </span>
            <h2
              className="mt-2 text-3xl leading-[1.05] text-[var(--color-charcoal)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Activity Feed
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[var(--color-canvas-white)] px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              Live
            </div>
            {activities.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-ash-gray)] px-3 py-1.5 text-xs font-medium text-[var(--color-cool-gray)] transition hover:bg-[#fff1f2] hover:text-[#be123c]"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => {
              const Icon = f.icon;
              const count =
                f.key === "all"
                  ? activities.length
                  : activities.filter((a) => a.type === f.key).length;
              const active = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)]"
                      : "border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-[var(--color-slate-blue)] hover:text-[var(--color-charcoal)]"
                  }`}
                >
                  <Icon size={13} />
                  {f.label}
                  {count > 0 && <span className={active ? "text-[rgba(255,255,255,0.7)]" : "text-[var(--color-cool-gray)]"}>{count}</span>}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-3 py-2 text-xs font-semibold text-[var(--color-charcoal)]">
              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[rgba(27,25,23,0.12)] scrollbar-track-transparent">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12">
            <Activity size={16} className="icon-spin text-[var(--color-field-green)]" />
            <span className="text-sm text-[var(--color-cool-gray)]">Loading feed...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center gap-4 rounded-[20px] border border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] p-5">
            <Radio size={20} className="shrink-0 text-[var(--color-field-green)]" />
            <div>
              <strong className="block text-sm text-[var(--color-charcoal)]">No activity yet</strong>
              <p className="mt-1 text-xs text-[var(--color-cool-gray)]">
                Events will appear here in real time as the system processes jobs,
                sends reminders, and tracks your coding progress.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} onMarkRead={markAsRead} />
          ))
        )}
      </div>

      {hasMore && filtered.length > 0 && !loading && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--color-charcoal)] bg-[var(--color-canvas-white)] px-5 py-3 text-sm font-semibold text-[var(--color-charcoal)] shadow-[var(--shadow-subtle-3)] transition hover:bg-[var(--color-buttermilk)] disabled:opacity-50"
          >
            {loadingMore ? <Activity size={14} className="icon-spin" /> : <ChevronDown size={14} />}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;
