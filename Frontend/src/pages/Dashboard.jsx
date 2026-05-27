import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronRight,
  Code2,
  Eye,
  Flame,
  Search,
  Sparkles,
  Terminal,
  Trophy,
  UserPlus,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { getLocalProfile, getUserEmail } from "../utils/auth";
import StatsCard from "../components/StatsCard";
import TierBadge from "../components/TierBadge";
import HealthIndicator from "../components/HealthIndicator";
import ActionButton from "../components/ActionButton";
import ActivityFeed from "../components/ActivityFeed";

const pCfg = {
  leetcode: { label: "LeetCode", icon: Code2, ph: "Enter LeetCode username" },
  codechef: { label: "CodeChef", icon: Terminal, ph: "Enter CodeChef username" },
  codeforces: { label: "Codeforces", icon: Activity, ph: "Enter Codeforces handle" },
  gfg: { label: "GeeksForGeeks", icon: Code2, ph: "Enter GFG username" },
};

const norm = (p) => {
  const r = p?.analysis || {};
  const fp = {
    username: p?.username || "",
    platform: p?.platform || "",
    submissions_today: p?.submissions_today,
    is_inactive_today: p?.is_inactive_today,
  };
  const pr = r.profile || fp;
  const inactive = Boolean(
    p?.is_inactive_today ?? r.is_inactive_today ?? pr.is_inactive_today
  );
  const hidden = Boolean(p?.profile_hidden || (inactive && !p?.analysis));
  const msgs = [...(r.messages || [])];
  if (p?.warning) msgs.push({ category: "warning", text: p.warning });
  if (p?.suggestion) msgs.push({ category: "suggestion", text: p.suggestion });
  return {
    headline: p?.message || r.message || "Analysis complete",
    platform: pr.platform || r.platform || p?.platform,
    username: pr.username || r.username || p?.username,
    profile: pr,
    profileHidden: hidden,
    messages: msgs,
    performanceLevel: r.performance_level || p?.performance_level || p?.classification,
    ratingLevel: r.rating_level || p?.rating_level,
    isInactiveToday: inactive,
    isMockData: Boolean(pr.is_mock_data),
  };
};

const shellCard =
  "rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.74)] shadow-[0_12px_30px_rgba(27,25,23,0.06)]";

const Dashboard = () => {
  const email = getUserEmail();
  const stored = getLocalProfile();
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  const [profile, setProfile] = useState({
    leetcode_username: "",
    codechef_username: "",
    codeforces_username: "",
    gfg_username: "",
    ...(stored || {}),
  });
  const [plat, setPlat] = useState(
    stored?.codechef_username && !stored?.leetcode_username ? "codechef" : "leetcode"
  );
  const [analysis, setAnalysis] = useState(null);
  const [aErr, setAErr] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [contestsCount, setContestsCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [mStatus, setMStatus] = useState(null);
  const [reging, setReging] = useState(false);

  const uname =
    plat === "leetcode"
      ? profile.leetcode_username
      : plat === "codechef"
        ? profile.codechef_username
        : plat === "codeforces"
          ? profile.codeforces_username
          : profile.gfg_username;
  const PIcon = pCfg[plat].icon;

  const load = useCallback(async () => {
    setRefreshing(true);
    const [cr, ur] = await Promise.allSettled([
      api.getContests("all"),
      api.getRegisteredUsers(),
    ]);
    if (cr.status === "fulfilled") setContestsCount(cr.value?.contests?.length || 0);
    if (ur.status === "fulfilled") setWatchCount(ur.value?.users?.length || 0);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upd = (f, v) => setProfile((c) => ({ ...c, [f]: v }));

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = uname?.trim();
    if (!u) {
      setAErr(`Add a ${pCfg[plat].label} username first.`);
      return;
    }
    setAnalyzing(true);
    setAErr("");
    setAnalysis(null);
    try {
      const d = await api.analyzeUser(plat, u);
      setAnalysis(norm(d));
    } catch (err) {
      setAErr(err.message || "Failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const doMonitor = async () => {
    const u = uname?.trim();
    if (!u) {
      setMStatus({ t: "err", m: `Add a ${pCfg[plat].label} username first.` });
      return;
    }
    if (!email) {
      setMStatus({ t: "err", m: "Login email not found." });
      return;
    }
    setReging(true);
    setMStatus(null);
    try {
      await api.registerUser(plat, u, email);
      setMStatus({ t: "ok", m: `Monitoring enabled for ${u}.` });
      await load();
    } catch (err) {
      setMStatus({ t: "err", m: err.message || "Failed." });
    } finally {
      setReging(false);
    }
  };

  const Status = ({ s }) =>
    s ? (
      <div
        className={`mt-4 rounded-[18px] px-4 py-3 text-sm ${
          s.t === "ok"
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {s.m}
      </div>
    ) : null;

  return (
  <div className="mx-auto w-full max-w-[1440px] animate-fade-in-up px-6 py-6">
   <div className="grid gap-6">
        <section className={`${shellCard} p-5 sm:p-6`}>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-[rgba(27,25,23,0.08)] bg-[var(--color-charcoal)] text-2xl font-bold uppercase text-[var(--color-canvas-white)] shadow-[var(--shadow-subtle-3)]">
                    {initial}
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-slate-blue)]">
                      <Sparkles size={12} />
                      DevScheduler
                    </span>
                    <h1
                      className="mt-1 text-[clamp(2rem,4vw,3.25rem)] leading-[1.02] text-[var(--color-charcoal)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Welcome back{email ? `, ${email.split("@")[0]}` : ""}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-cool-gray)]">
                      Keep your contests, activity, analysis, and reminders in one
                      calm workspace.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <HealthIndicator />
                  <div className="rounded-full border border-[var(--color-ash-gray)] bg-[rgba(255,255,255,0.7)] px-4 py-2 text-xs font-semibold text-[var(--color-slate-blue)]">
                    {refreshing ? "Refreshing" : "Workspace ready"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[20px] border border-[rgba(27,25,23,0.08)] bg-[var(--color-canvas-white)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                    Email
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-[var(--color-charcoal)]">
                    {email || "DevFlow User"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[rgba(27,25,23,0.08)] bg-[var(--color-canvas-white)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                    Analysis focus
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-charcoal)]">
                    {pCfg[plat].label}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[rgba(27,25,23,0.08)] bg-[var(--color-canvas-white)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                    Monitoring
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--color-charcoal)]">
                    {watchCount} watched handles
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[24px] border border-[rgba(27,25,23,0.08)] bg-[var(--color-canvas-white)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                      Today at a glance
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-charcoal)]">
                      Current workspace summary
                    </p>
                  </div>
                  <Eye size={16} className="text-[var(--color-charcoal)]" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-4 py-3">
                    <span className="text-sm text-[var(--color-cool-gray)]">
                      Upcoming contests
                    </span>
                    <span className="text-lg font-semibold text-[var(--color-charcoal)]">
                      {contestsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-4 py-3">
                    <span className="text-sm text-[var(--color-cool-gray)]">
                      Current platform
                    </span>
                    <span className="text-lg font-semibold text-[var(--color-charcoal)]">
                      {pCfg[plat].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-4 py-3">
                    <span className="text-sm text-[var(--color-cool-gray)]">
                      Latest status
                    </span>
                    <span className="text-lg font-semibold text-[var(--color-charcoal)]">
                      {analysis ? (analysis.isInactiveToday ? "Inactive" : "Active") : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

<section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            icon={Code2}
            label="Problems Solved"
            variant="purple"
            value={analysis?.profile?.total_solved ?? "-"}
            subtitle={
              analysis ? `on ${pCfg[analysis.platform]?.label || analysis.platform}` : "Run analysis"
            }
          />
          <StatsCard
            icon={Trophy}
            label="Contest Rating"
            variant="cyan"
            value={analysis?.profile?.rating ?? "-"}
            subtitle={analysis?.ratingLevel ? `${analysis.ratingLevel} tier` : "Run analysis"}
          />
          <StatsCard
            icon={Flame}
            label="Today's Activity"
            variant={analysis?.isInactiveToday === false ? "emerald" : "amber"}
            value={analysis ? (analysis.isInactiveToday ? "Inactive" : "Active") : "-"}
            subtitle={
              analysis?.isInactiveToday
                ? "Solve 1 problem!"
                : analysis
                  ? "Keep going!"
                  : "Run analysis"
            }
          />
          <StatsCard
            icon={Calendar}
            label="Upcoming Contests"
            variant="rose"
            value={contestsCount || "-"}
            subtitle={`${watchCount} watched handles`}
          />
        </section>

        <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className={`${shellCard} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 border-b border-[rgba(27,25,23,0.08)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-slate-blue)]">
                  <Zap size={12} />
                  Intelligence
                </span>
                <h2
                  className="mt-2 text-3xl leading-[1.05] text-[var(--color-charcoal)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Analyze Profile
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-cool-gray)]">
                  Choose a platform, enter the same username fields, and run the
                  existing analysis flow with a cleaner workspace.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {Object.entries(pCfg).map(([k, c]) => {
                  const I = c.icon;
                  const active = plat === k;
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setPlat(k);
                        setAErr("");
                        setMStatus(null);
                      }}
                      className={`inline-flex items-center justify-center gap-2 rounded-[16px] border px-4 py-2.5 text-xs font-semibold transition ${
                        active
                          ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)]"
                          : "border-[var(--color-ash-gray)] bg-[rgba(255,255,255,0.6)] text-[var(--color-slate-blue)] hover:text-[var(--color-charcoal)]"
                      }`}
                    >
                      <I size={14} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <form onSubmit={doAnalyze} className="space-y-4">
                  <div className="rounded-[22px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] p-4">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                      Username
                    </label>
                    <div className="relative">
                      <PIcon
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)]"
                        size={17}
                      />
                      <input
                        type="text"
                        value={uname}
                        placeholder={pCfg[plat].ph}
                        onChange={(e) => upd(`${plat}_username`, e.target.value)}
                        className="w-full rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] py-3 pl-11 pr-4 text-sm text-[var(--color-charcoal)] outline-none transition focus:border-[var(--color-field-green)] focus:ring-1 focus:ring-[var(--color-field-green)] placeholder:text-[var(--color-cool-gray)]"
                      />
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-cool-gray)]">
                      Use the same profile data and logic already wired into your app.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <ActionButton
                      type="submit"
                      disabled={analyzing || !uname?.trim()}
                      className="w-full sm:w-auto"
                    >
                      {analyzing ? (
                        <>
                          <Activity size={15} className="icon-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart3 size={15} />
                          Analyze
                        </>
                      )}
                    </ActionButton>

                    <button
                      type="button"
                      onClick={doMonitor}
                      disabled={reging}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] border border-[var(--color-charcoal)] bg-[var(--color-buttermilk)] px-5 py-3 text-sm font-semibold text-[var(--color-charcoal)] shadow-[var(--shadow-subtle-3)] transition hover:bg-[var(--color-canvas-white)] disabled:opacity-50 sm:w-auto"
                    >
                      {reging ? (
                        <Activity size={15} className="icon-spin" />
                      ) : (
                        <UserPlus size={15} />
                      )}
                      Monitor
                    </button>
                  </div>
                </form>

                {aErr && (
                  <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {aErr}
                  </div>
                )}
                <Status s={mStatus} />
              </div>
<div className="rounded-[22px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] p-4 h-fit">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                      Workflow
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-charcoal)]">
                      What happens here
                    </p>
                  </div>
                  <Sparkles size={16} className="text-[var(--color-charcoal)]" />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Pick the platform you want to inspect.",
                    "Enter the existing username field and run Analyze.",
                    "Review summary, status, tiers, and detailed platform drill-down.",
                  ].map((line, index) => (
                    <div
                      key={line}
                      className="flex items-start gap-3 rounded-[18px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] px-3 py-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] text-[11px] font-semibold text-[var(--color-charcoal)]">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-6 text-[var(--color-cool-gray)]">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!analysis && !aErr && (
              <div className="mt-5 flex items-center gap-4 rounded-[20px] border border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] p-5">
                <Search size={20} className="shrink-0 text-[var(--color-field-green)]" />
                <div>
                  <strong className="block text-sm text-[var(--color-charcoal)]">
                    No analysis yet
                  </strong>
                  <p className="mt-1 text-xs text-[var(--color-cool-gray)]">
                    Enter your username and hit Analyze to get insights.
                  </p>
                </div>
              </div>
            )}

            {analysis && analysis.isInactiveToday && analysis.profileHidden && (
              <div className="mt-5 flex gap-4 rounded-[20px] border border-amber-200 bg-amber-50 p-5">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                    {pCfg[analysis.platform]?.label || analysis.platform}
                  </span>
                  <h3 className="mt-1 text-base font-semibold text-[var(--color-charcoal)]">
                    {analysis.headline}
                  </h3>
                  {analysis.messages.map((m, i) => (
                    <p key={i} className="mt-2 text-sm leading-6 text-[var(--color-cool-gray)]">
                      {m.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {analysis && !analysis.profileHidden && (
              <div className="mt-5 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="rounded-[22px] border border-[var(--color-ash-gray)] bg-[var(--color-canvas-white)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                        {pCfg[analysis.platform]?.label}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-[var(--color-charcoal)]">
                        {analysis.username}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-cool-gray)]">
                        {analysis.headline}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {analysis.isMockData && (
                        <span className="rounded-full border border-[var(--color-field-green)] bg-[var(--color-canvas-white)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-field-green)]">
                          Mock
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          analysis.isInactiveToday
                            ? "border border-amber-300 bg-amber-50 text-amber-700"
                            : "border border-emerald-300 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {analysis.isInactiveToday ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-4 py-3">
                      <p className="text-xs text-[var(--color-cool-gray)]">Problems Solved</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--color-charcoal)]">
                        {analysis.profile?.total_solved ?? "-"}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] px-4 py-3">
                      <p className="text-xs text-[var(--color-cool-gray)]">Contest Rating</p>
                      <p className="mt-1 text-lg font-semibold text-[var(--color-charcoal)]">
                        {analysis.profile?.rating ?? "-"}
                      </p>
                    </div>
                  </div>

                  {(analysis.performanceLevel || analysis.ratingLevel) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {analysis.performanceLevel && (
                        <TierBadge tier={analysis.performanceLevel} type="performance" />
                      )}
                      {analysis.ratingLevel && (
                        <TierBadge tier={analysis.ratingLevel} type="rating" />
                      )}
                    </div>
                  )}

                  {pCfg[analysis.platform] && (
                    <div className="mt-5 pt-1">
                      <Link
                        to={`/platforms/${analysis.platform}`}
                        state={{ username: analysis.username, autoAnalyze: true }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-charcoal)] no-underline transition hover:text-[var(--color-field-green)]"
                      >
                        For more detail <ChevronRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>

              <div className="rounded-[22px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] p-4 h-fit">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                        Messages
                      </p>
                      <p className="mt-1 text-sm font-medium text-[var(--color-charcoal)]">
                        Analysis signals
                      </p>
                    </div>
                    <Zap size={16} className="text-[var(--color-charcoal)]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {(analysis.messages?.length ? analysis.messages : [{ category: "info", text: "No additional messages available." }]).map(
                      (m, i) => (
                        <div
                          key={`${m.category}-${i}`}
                          className="rounded-[18px] border border-[rgba(27,25,23,0.08)] bg-[rgba(255,255,255,0.72)] px-4 py-3"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                            {m.category}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-cool-gray)]">
                            {m.text}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        <div className="flex flex-col gap-6">
          <div>
            <ActivityFeed />
          </div>

            <section className="grid gap-6">
              <Link
                to="/contests"
                className={`${shellCard} no-underline p-5 transition hover:-translate-y-[2px]`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                  Contests
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-charcoal)]">
                  Open Live Contest Page
                </h3>
                <p className="mt-1 text-sm text-[var(--color-cool-gray)]">
                  All countdowns in one dedicated screen.
                </p>
              </Link>
              <Link
                to="/schedule"
                className={`${shellCard} no-underline p-5 transition hover:-translate-y-[2px]`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                  Schedule
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-charcoal)]">
                  Email Scheduler
                </h3>
                <p className="mt-1 text-sm text-[var(--color-cool-gray)]">
                  Set date/time with calendar and send reminders.
                </p>
              </Link>
              <Link
                to="/watch"
                className={`${shellCard} no-underline p-5 transition hover:-translate-y-[2px]`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-slate-blue)]">
                  Watch
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-charcoal)]">
                  Watched Handles
                </h3>
                <p className="mt-1 text-sm text-[var(--color-cool-gray)]">
                  Monitor handles and manage watch list.
                </p>
              </Link>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
