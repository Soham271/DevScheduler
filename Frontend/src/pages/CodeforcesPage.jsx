import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getLocalProfile } from '../utils/auth';
import {
  Activity, BarChart3, Flame, Trophy, Calendar,
  CheckCircle2, XCircle, Clock, Zap, TrendingUp,
  AlertTriangle, ChevronRight, ChevronDown, ChevronUp, Search, Tag
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  Stats Card
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ label, value, subtitle, color = 'text-[var(--color-charcoal)]', icon: Icon }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-5 hover:shadow-[var(--shadow-subtle)] transition-shadow group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-[var(--color-cool-gray)] uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />}
    </div>
    <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
    {subtitle && <p className="text-xs text-[var(--color-cool-gray)] mt-1">{subtitle}</p>}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
//  Rank Color Helper
// ═══════════════════════════════════════════════════════════════
const getRankColor = (rank) => {
  if (!rank) return 'text-[var(--color-cool-gray)]';
  const r = rank.toLowerCase();
  if (r.includes('legendary')) return 'text-red-600';
  if (r.includes('international')) return 'text-red-500';
  if (r.includes('grandmaster')) return 'text-red-400';
  if (r.includes('master')) return 'text-amber-500';
  if (r.includes('candidate')) return 'text-violet-500';
  if (r.includes('expert')) return 'text-blue-500';
  if (r.includes('specialist')) return 'text-cyan-500';
  if (r.includes('pupil')) return 'text-green-500';
  return 'text-[var(--color-cool-gray)]';
};

// ═══════════════════════════════════════════════════════════════
//  Submission Card
// ═══════════════════════════════════════════════════════════════
const SubmissionCard = ({ submission }) => {
  const isAccepted = submission.verdict === 'OK';
  const verdictLabel = isAccepted ? 'Accepted' : submission.verdict?.replace(/_/g, ' ') || 'Unknown';
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[var(--color-canvas-white)] border border-[var(--color-ash-gray)] hover:shadow-[var(--shadow-subtle-3)] transition group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-50' : 'bg-red-50'}`}>
        {isAccepted ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <a href={submission.problem_url} target="_blank" rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--color-charcoal)] truncate hover:text-blue-500 transition-colors no-underline block">
          {submission.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isAccepted ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {verdictLabel}
          </span>
          <span className="text-[10px] text-[var(--color-cool-gray)] uppercase font-medium">{submission.language}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1 text-xs text-[var(--color-cool-gray)]">
          <Clock size={12} /><span>{submission.time_ago}</span>
        </div>
        <a href={submission.problem_url} target="_blank" rel="noopener noreferrer"
          className="w-8 h-8 rounded-[16px] bg-[var(--color-buttermilk)] flex items-center justify-center text-[var(--color-cool-gray)] hover:text-blue-500 hover:bg-blue-50 transition-colors">
          <ChevronRight size={16} />
        </a>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Contest Card
// ═══════════════════════════════════════════════════════════════
const ContestCard = ({ contest }) => {
  const change = contest.rating_change;
  const isPositive = change >= 0;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 px-4 py-3 rounded-[12px] bg-[var(--color-canvas-white)] border border-[var(--color-ash-gray)] hover:shadow-[var(--shadow-subtle-3)] transition">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
        <TrendingUp size={16} className={isPositive ? 'text-emerald-500' : 'text-red-400'} style={isPositive ? {} : { transform: 'scaleY(-1)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate">{contest.contest_name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-[var(--color-cool-gray)]">Rank #{contest.rank}</span>
          <span className="text-xs text-[var(--color-cool-gray)]">{contest.old_rating} → {contest.new_rating}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}
        </p>
        <p className="text-[10px] text-[var(--color-cool-gray)]">Rating Δ</p>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Main Codeforces Intelligence Page
// ═══════════════════════════════════════════════════════════════
const CodeforcesPage = () => {
  const stored = getLocalProfile();
  const [username, setUsername] = useState(stored?.codeforces_username || '');
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
      const run = async () => {
        setAnalyzing(true); setError(''); setProfile(null);
        try {
          const data = await api.codeforcesAnalyze(u);
          setProfile(data.profile);
        } catch (err) { setError(err.message || 'Failed to analyze.'); }
        finally { setAnalyzing(false); }
      };
      if (!profile || profile.username !== u) run();
    }
  }, [location.state]);

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) { setError('Please enter a Codeforces handle.'); return; }
    setAnalyzing(true); setError(''); setProfile(null);
    try {
      const data = await api.codeforcesAnalyze(u);
      setProfile(data.profile);
    } catch (err) { setError(err.message || 'Failed to analyze.'); }
    finally { setAnalyzing(false); }
  };

  // Top tag stats (sorted)
  const topTags = profile?.tag_stats
    ? Object.entries(profile.tag_stats).sort((a, b) => b[1] - a[1]).slice(0, 12)
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-charcoal)]" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--color-charcoal)] flex items-center justify-center shadow-lg">
            <BarChart3 size={22} className="text-[var(--color-canvas-white)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-charcoal)]">Codeforces Intelligence</h1>
              <span className="px-2 py-0.5 rounded-[16px] text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600">Live</span>
            </div>
            <p className="text-sm text-[var(--color-cool-gray)] mt-0.5">Competitive programming analytics, rating history, and problem-solving insights.</p>
          </div>
        </div>
      </motion.header>

      {/* Analyze */}
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6">
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-bold text-blue-500 uppercase tracking-wider"><Zap size={12} /> Codeforces Analysis</span>
          <h2 className="text-lg font-bold text-[var(--color-charcoal)] mt-0.5">Analyze Profile</h2>
        </div>
        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <BarChart3 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Codeforces handle"
              className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition placeholder:text-[var(--color-cool-gray)]" />
          </div>
          <button type="submit" disabled={analyzing || !username.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)] text-sm font-semibold shadow-[var(--shadow-subtle-3)] hover:shadow-[var(--shadow-subtle)] transition disabled:opacity-50">
            {analyzing ? <><Activity size={15} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={15} /> Analyze</>}
          </button>
        </form>
        {error && <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>}
        {!profile && !error && !analyzing && (
          <div className="mt-5 flex items-center gap-4 p-5 rounded-[12px] border-2 border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]/50">
            <Search size={20} className="text-blue-400 shrink-0" />
            <div><strong className="text-sm text-[var(--color-charcoal)] block">No analysis yet</strong><p className="text-xs text-[var(--color-cool-gray)] mt-0.5">Enter your Codeforces handle and hit Analyze.</p></div>
          </div>
        )}
      </section>

      {/* Results */}
      <AnimatePresence>
        {profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            {/* Inactive State */}
            {!profile.is_active_today && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--color-charcoal)] rounded-[12px] border border-blue-200/60 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[12px] bg-blue-100 flex items-center justify-center shrink-0"><AlertTriangle size={22} className="text-blue-500" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-charcoal)]">You are inactive today</h3>
                    <p className="text-sm text-[var(--color-slate-blue)] mt-1">No accepted submissions on Codeforces today.</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">Solve a problem to keep your streak alive! 🔥</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rank Banner */}
            <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--color-cool-gray)] uppercase block">Current Rank</span>
                  <h3 className={`text-2xl font-bold capitalize ${getRankColor(profile.rank)}`}>{profile.rank || 'Unrated'}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--color-cool-gray)] uppercase block">Max Rank</span>
                  <h3 className={`text-lg font-bold capitalize ${getRankColor(profile.max_rank)}`}>{profile.max_rank || '-'}</h3>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={BarChart3} label="Rating" value={profile.rating || 'Unrated'} subtitle={`Max: ${profile.max_rating || '-'}`} color="text-blue-600" />
              <StatCard icon={Trophy} label="Total Solved" value={profile.total_solved} subtitle="Unique problems" />
              <StatCard icon={Calendar} label="Contests" value={profile.contest_count} subtitle="Participated" />
              <StatCard icon={Flame} label="Streak" value={`${profile.current_streak}d`} subtitle={`Max: ${profile.max_streak}d`} color="text-orange-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Contribution" value={profile.contribution} subtitle="Community score" />
              <StatCard icon={Activity} label="Active Days" value={profile.active_days} subtitle="With accepted submissions" />
              <StatCard icon={Trophy} label="Friends" value={profile.friend_count} subtitle="Friend of count" />
              <StatCard icon={Flame} label="Today" value={profile.is_active_today ? 'Active ✅' : 'Inactive'} subtitle={profile.is_active_today ? 'Keep it up!' : 'Solve a problem!'} color={profile.is_active_today ? 'text-emerald-600' : 'text-amber-500'} />
            </div>

            {/* Tag Stats */}
            {topTags.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <h3 className="text-base font-bold text-[var(--color-charcoal)] mb-4 flex items-center gap-2">
                  <Tag size={18} className="text-blue-500" /> Problem Tag Distribution
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.map(([tag, count]) => (
                    <span key={tag} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-sm">
                      <span className="font-medium text-[var(--color-charcoal)]">{tag}</span>
                      <span className="text-blue-500 font-bold ml-1.5">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Submissions */}
            {profile.recent_submissions?.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Recent Submissions
                  </h3>
                  <button onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                    {showAllSubmissions ? 'Show Less' : 'Show All'}
                    {showAllSubmissions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {showAllSubmissions && (
                  <div className="flex flex-col gap-2 mt-4">
                    {profile.recent_submissions.map((sub, i) => <SubmissionCard key={i} submission={sub} />)}
                  </div>
                )}
              </div>
            )}

            {/* Contest History */}
            {profile.contest_history?.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Contest History
                  </h3>
                  <button onClick={() => setShowAllContests(!showAllContests)}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
                    {showAllContests ? 'Show Less' : 'Show All'}
                    {showAllContests ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {showAllContests && (
                  <div className="flex flex-col gap-2 mt-4">
                    {[...profile.contest_history].reverse().map((c, i) => <ContestCard key={i} contest={c} />)}
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

export default CodeforcesPage;
