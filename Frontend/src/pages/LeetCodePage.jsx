import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getLocalProfile } from '../utils/auth';
import {
  Code2, BarChart3, Activity, Flame, Trophy, Calendar,
  CheckCircle2, XCircle, Clock, Zap, TrendingUp,
  AlertTriangle, ChevronRight, ChevronDown, ChevronUp, Search, UserPlus
} from 'lucide-react';




const ContributionHeatmap = ({ calendar }) => {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, months } = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks = [];
    let currentWeek = [];
    const monthLabels = [];
    let lastMonth = -1;
    let current = new Date(startDate);

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      const count = calendar?.[dateStr] || 0;
      const month = current.getMonth();

      if (month !== lastMonth) {
        monthLabels.push({ label: current.toLocaleString('en', { month: 'short' }), weekIndex: weeks.length });
        lastMonth = month;
      }

      currentWeek.push({ date: dateStr, count, day: current.getDay() });

      if (current.getDay() === 6 || current.getTime() === today.getTime()) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);
    return { weeks, months: monthLabels };
  }, [calendar]);

  const getColor = (count) => {
    if (count === 0) return 'bg-[var(--color-ash-gray)]';
    if (count <= 3) return 'bg-orange-200';
    if (count <= 6) return 'bg-orange-300';
    if (count <= 10) return 'bg-orange-400';
    return 'bg-orange-500';
  };

  const totalSubmissions = useMemo(() => {
    if (!calendar) return 0;
    return Object.values(calendar).reduce((sum, c) => sum + c, 0);
  }, [calendar]);

  return (
    <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[var(--color-charcoal)]">
          {totalSubmissions.toLocaleString()} submissions in the past year
        </h3>
        <span className="text-xs text-[var(--color-cool-gray)]">Submission activity</span>
      </div>

      <div className="overflow-x-auto pb-2">
        {}
        <div className="h-4 relative mb-1 ml-8">
          {months.map((m, i) => (
            <div key={i} className="text-[10px] text-[var(--color-cool-gray)] font-medium absolute" style={{ left: `${m.weekIndex * 13}px` }}>
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-[2px] relative">
          {}
          <div className="flex flex-col gap-[2px] mr-1 pt-0">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div key={i} className="h-[11px] text-[9px] text-[var(--color-cool-gray)] leading-[11px] w-6 text-right pr-1">{d}</div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }).map((_, di) => {
                const cell = week.find(c => c.day === di);
                if (!cell) return <div key={di} className="w-[11px] h-[11px]" />;
                return (
                  <div
                    key={di}
                    className={`w-[11px] h-[11px] rounded-sm ${getColor(cell.count)} cursor-pointer transition-transform hover:scale-150 hover:z-10 relative`}
                    onMouseEnter={(e) => {
                      const rect = e.target.getBoundingClientRect();
                      setTooltip({ x: rect.left, y: rect.top - 45, date: cell.date, count: cell.count });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="text-[10px] text-[var(--color-cool-gray)] mr-1">Less</span>
          {['bg-[var(--color-ash-gray)]', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'].map((c, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-[var(--color-cool-gray)] ml-1">More</span>
        </div>
      </div>

      {}
      {tooltip && (
        <div className="fixed z-50 px-3 py-1.5 rounded-lg bg-gray-900 text-[var(--color-canvas-white)] text-xs shadow-lg pointer-events-none"
          style={{ left: tooltip.x - 40, top: tooltip.y }}>
          <strong>{tooltip.count} submission{tooltip.count !== 1 ? 's' : ''}</strong> on {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  );
};




const StatCard = ({ label, value, subtitle, color = 'text-[var(--color-charcoal)]', icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-5 hover:shadow-[var(--shadow-subtle)] transition-shadow group"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-[var(--color-cool-gray)] uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className="text-gray-300 group-hover:text-orange-400 transition-colors" />}
    </div>
    <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
    {subtitle && <p className="text-xs text-[var(--color-cool-gray)] mt-1">{subtitle}</p>}
  </motion.div>
);




const InactiveCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-[var(--color-charcoal)] rounded-[12px] border border-orange-200/60 p-6"
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-[12px] bg-orange-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={22} className="text-orange-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[var(--color-charcoal)]">You are inactive today</h3>
        <p className="text-sm text-[var(--color-slate-blue)] mt-1">You haven't solved any LeetCode problems today.</p>
        <p className="text-sm text-orange-600 font-medium mt-2">Solve at least one problem to continue your streak! 💪</p>
      </div>
    </div>
  </motion.div>
);




const SubmissionCard = ({ submission }) => {
  const isAccepted = submission.status === 'Accepted';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[var(--color-canvas-white)] border border-[var(--color-ash-gray)] hover:shadow-[var(--shadow-subtle-3)] transition group"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-50' : 'bg-red-50'}`}>
        {isAccepted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={`https://leetcode.com/problems/${submission.title_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--color-charcoal)] truncate hover:text-orange-500 transition-colors no-underline block"
        >
          {submission.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isAccepted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {submission.status}
          </span>
          <span className="text-[10px] text-[var(--color-cool-gray)] uppercase font-medium">{submission.language}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-xs text-[var(--color-cool-gray)]">
          <Clock size={12} />
          <span>{submission.time_ago}</span>
        </div>
        <a
          href={`https://leetcode.com/problems/${submission.title_slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-[16px] bg-[var(--color-buttermilk)] flex items-center justify-center text-[var(--color-cool-gray)] hover:text-orange-500 hover:bg-orange-50 transition-colors"
        >
          <ChevronRight size={16} />
        </a>
      </div>
    </motion.div>
  );
};




const ContestCard = ({ contest }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 px-4 py-3 rounded-[12px] bg-[var(--color-canvas-white)] border border-[var(--color-ash-gray)] hover:shadow-[var(--shadow-subtle-3)] transition"
  >
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
      <Trophy size={16} className="text-blue-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate">{contest.title}</p>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-xs text-[var(--color-cool-gray)]">Rank #{contest.ranking}</span>
        <span className="text-xs text-[var(--color-cool-gray)]">{contest.problems_solved}/{contest.total_problems} solved</span>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-bold text-[var(--color-charcoal)]">{Math.round(contest.rating)}</p>
      <p className="text-[10px] text-[var(--color-cool-gray)]">Rating</p>
    </div>
  </motion.div>
);




const LeetCodePage = () => {
  const stored = getLocalProfile();
  const [username, setUsername] = useState(stored?.leetcode_username || '');
  const [profile, setProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showAllContests, setShowAllContests] = useState(false);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username && location.state?.autoAnalyze) {
      const u = location.state.username;
      setUsername(u);
      
      const runAutoAnalyze = async () => {
        setAnalyzing(true);
        setError('');
        setProfile(null);
        try {
          const data = await api.leetcodeAnalyze(u);
          setProfile(data.profile);
        } catch (err) {
          setError(err.message || 'Failed to analyze LeetCode profile.');
        } finally {
          setAnalyzing(false);
        }
      };
      
      // Only run if we don't already have the profile for this user
      if (!profile || profile.username !== u) {
        runAutoAnalyze();
      }
    }
  }, [location.state, profile]);

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) {
      setError('Please enter a LeetCode username.');
      return;
    }
    setAnalyzing(true);
    setError('');
    setProfile(null);
    try {
      const data = await api.leetcodeAnalyze(u);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message || 'Failed to analyze LeetCode profile.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-charcoal)]" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--color-charcoal)] flex items-center justify-center shadow-lg">
            <Code2 size={22} className="text-[var(--color-canvas-white)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-charcoal)]">LeetCode Intelligence</h1>
              <span className="px-2 py-0.5 rounded-[16px] text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600">Live</span>
            </div>
            <p className="text-sm text-[var(--color-cool-gray)] mt-0.5">Track your coding consistency, submissions, contests, and LeetCode activity.</p>
          </div>
        </div>
      </motion.header>

      {/* Analyze Section */}
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6">
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-bold text-orange-500 uppercase tracking-wider"><Zap size={12} /> LeetCode Analysis</span>
          <h2 className="text-lg font-bold text-[var(--color-charcoal)] mt-0.5">Analyze Profile</h2>
        </div>

        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter LeetCode username"
              className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition placeholder:text-[var(--color-cool-gray)]"
            />
          </div>
          <button
            type="submit"
            disabled={analyzing || !username.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)] text-sm font-semibold shadow-[var(--shadow-subtle-3)] hover:shadow-[var(--shadow-subtle)] transition disabled:opacity-50"
          >
            {analyzing ? <><Activity size={15} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={15} /> Analyze</>}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
        )}

        {!profile && !error && !analyzing && (
          <div className="mt-5 flex items-center gap-4 p-5 rounded-[12px] border-2 border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]/50">
            <Search size={20} className="text-orange-400 shrink-0" />
            <div>
              <strong className="text-sm text-[var(--color-charcoal)] block">No analysis yet</strong>
              <p className="text-xs text-[var(--color-cool-gray)] mt-0.5">Enter your LeetCode username and hit Analyze to get insights.</p>
            </div>
          </div>
        )}
      </section>

      {/* Results */}
      <AnimatePresence>
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5"
          >
            {/* Inactive State */}
            {!profile.is_active_today && <InactiveCard />}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Code2} label="Total Solved" value={profile.total_solved} subtitle={`of ${(profile.easy_total + profile.medium_total + profile.hard_total).toLocaleString()}`} color="text-[var(--color-charcoal)]" />
              <StatCard icon={CheckCircle2} label="Easy" value={profile.easy_solved} subtitle={`/ ${profile.easy_total}`} color="text-emerald-600" />
              <StatCard icon={TrendingUp} label="Medium" value={profile.medium_solved} subtitle={`/ ${profile.medium_total}`} color="text-amber-600" />
              <StatCard icon={Flame} label="Hard" value={profile.hard_solved} subtitle={`/ ${profile.hard_total}`} color="text-red-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={BarChart3} label="Acceptance" value={`${profile.acceptance_rate.toFixed(1)}%`} subtitle="Success rate" />
              <StatCard icon={Trophy} label="Contest Rating" value={profile.contest_rating || '-'} subtitle={profile.contest_count ? `${profile.contest_count} contests` : 'No contests'} />
              <StatCard icon={Flame} label="Current Streak" value={`${profile.current_streak}d`} subtitle={`Max: ${profile.max_streak}d`} color="text-orange-500" />
              <StatCard icon={Calendar} label="Active Days" value={profile.active_days} subtitle="In the past year" />
            </div>

            {}
            <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
              <h3 className="text-base font-bold text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" /> Streak Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-[12px] bg-orange-50/50 border border-orange-100">
                  <p className="text-3xl font-bold text-orange-500">{profile.current_streak}</p>
                  <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Current Streak</p>
                </div>
                <div className="text-center p-4 rounded-[12px] bg-amber-50/50 border border-amber-100">
                  <p className="text-3xl font-bold text-amber-500">{profile.max_streak}</p>
                  <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Max Streak</p>
                </div>
                <div className="text-center p-4 rounded-[12px] bg-yellow-50/50 border border-yellow-100">
                  <p className="text-3xl font-bold text-yellow-600">{profile.active_days}</p>
                  <p className="text-xs text-[var(--color-cool-gray)] mt-1 font-medium">Active Days</p>
                </div>
              </div>
            </div>

            {}
            {profile.is_active_today && profile.submission_calendar && (
              <ContributionHeatmap calendar={profile.submission_calendar} />
            )}

            {}
            {profile.recent_submissions && profile.recent_submissions.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Recent Submissions
                  </h3>
                  <button
                    onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                  >
                    {showAllSubmissions ? 'Show Less' : 'Show All'}
                    {showAllSubmissions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {showAllSubmissions && (
                  <div className="flex flex-col gap-2 mt-4">
                    {profile.recent_submissions.map((sub, i) => (
                      <SubmissionCard key={i} submission={sub} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {}
            {profile.contest_history && profile.contest_history.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Contest History
                  </h3>
                  <button
                    onClick={() => setShowAllContests(!showAllContests)}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
                  >
                    {showAllContests ? 'Show Less' : 'Show All'}
                    {showAllContests ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {showAllContests && (
                  <div className="flex flex-col gap-2 mt-4">
                    {[...profile.contest_history]
                      .reverse()
                      .map((contest, i) => (
                        <ContestCard key={i} contest={contest} />
                      ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeetCodePage;
