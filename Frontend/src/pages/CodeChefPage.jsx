import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getLocalProfile } from '../utils/auth';
import {
  Activity, BarChart3, Flame, Trophy, Calendar,
  Zap, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Search, Star, Globe, MapPin
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';




const StatCard = ({ label, value, subtitle, color = 'text-[var(--color-charcoal)]', icon: Icon }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-5 hover:shadow-[var(--shadow-subtle)] transition-shadow group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-[var(--color-cool-gray)] uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />}
    </div>
    <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
    {subtitle && <p className="text-xs text-[var(--color-cool-gray)] mt-1">{subtitle}</p>}
  </motion.div>
);




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
//  Star Rating Display
// ═══════════════════════════════════════════════════════════════
const StarDisplay = ({ stars }) => {
  if (!stars) return null;
  const count = (stars.match(/★/g) || []).length || parseInt(stars) || 0;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
        <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  Rating Graph
// ═══════════════════════════════════════════════════════════════
const RatingGraph = ({ history }) => {
  if (!history || history.length === 0) return null;

  const data = history.map((c, i) => ({
    name: c.contest_name,
    rating: c.new_rating,
    index: i + 1
  }));

  const minRating = Math.max(0, Math.min(...data.map(d => d.rating)) - 100);
  const maxRating = Math.max(...data.map(d => d.rating)) + 100;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--color-canvas-white)] p-3 rounded-lg shadow-lg border border-[var(--color-ash-gray)] z-50">
          <p className="text-xs font-bold text-[var(--color-charcoal)] mb-1">{payload[0].payload.name}</p>
          <p className="text-sm font-bold text-amber-600">Rating: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6 mb-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-500" /> Rating Graph
        </h3>
        <span className="text-xs font-bold text-[var(--color-cool-gray)] uppercase">
          Participated: {history.length}
        </span>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="index" tick={false} axisLine={false} />
            <YAxis 
              domain={[minRating, maxRating]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#9ca3af' }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
            <ReferenceLine y={1400} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={1600} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={1800} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={2000} stroke="#e5e7eb" strokeDasharray="3 3" />
            <ReferenceLine y={2200} stroke="#e5e7eb" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#d97706" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#d97706', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#b45309' }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};




const CodeChefPage = () => {
  const stored = getLocalProfile();
  const [username, setUsername] = useState(stored?.codechef_username || '');
  const [profile, setProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showAllContests, setShowAllContests] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username && location.state?.autoAnalyze) {
      const u = location.state.username;
      setUsername(u);
      const run = async () => {
        setAnalyzing(true); setError(''); setProfile(null);
        try { const data = await api.codechefAnalyze(u); setProfile(data.profile); }
        catch (err) { setError(err.message || 'Failed to analyze.'); }
        finally { setAnalyzing(false); }
      };
      if (!profile || profile.username !== u) run();
    }
  }, [location.state]);

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) { setError('Please enter a CodeChef username.'); return; }
    setAnalyzing(true); setError(''); setProfile(null);
    try { const data = await api.codechefAnalyze(u); setProfile(data.profile); }
    catch (err) { setError(err.message || 'Failed to analyze.'); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-charcoal)]" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[var(--color-charcoal)] flex items-center justify-center shadow-lg">
            <Trophy size={22} className="text-[var(--color-canvas-white)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--color-charcoal)]">CodeChef Intelligence</h1>
              <span className="px-2 py-0.5 rounded-[16px] text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">Live</span>
            </div>
            <p className="text-sm text-[var(--color-cool-gray)] mt-0.5">Track your CodeChef rating, stars, and contest performance.</p>
          </div>
        </div>
      </motion.header>

      {/* Analyze */}
      <section className="bg-[var(--color-canvas-white)] rounded-[12px] shadow-[var(--shadow-subtle-3)] border border-[var(--color-ash-gray)] p-6">
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 uppercase tracking-wider"><Zap size={12} /> CodeChef Analysis</span>
          <h2 className="text-lg font-bold text-[var(--color-charcoal)] mt-0.5">Analyze Profile</h2>
        </div>
        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-cool-gray)] pointer-events-none" size={17} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter CodeChef username"
              className="w-full pl-10 pr-4 py-3 rounded-[12px] border border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)] text-[var(--color-charcoal)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition placeholder:text-[var(--color-cool-gray)]" />
          </div>
          <button type="submit" disabled={analyzing || !username.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-[12px] bg-[var(--color-charcoal)] text-[var(--color-canvas-white)] text-sm font-semibold shadow-[var(--shadow-subtle-3)] hover:shadow-[var(--shadow-subtle)] transition disabled:opacity-50">
            {analyzing ? <><Activity size={15} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={15} /> Analyze</>}
          </button>
        </form>
        {error && <div className="mt-3 p-3 rounded-[12px] bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>}
        {!profile && !error && !analyzing && (
          <div className="mt-5 flex items-center gap-4 p-5 rounded-[12px] border-2 border-dashed border-[var(--color-ash-gray)] bg-[var(--color-buttermilk)]/50">
            <Search size={20} className="text-amber-400 shrink-0" />
            <div><strong className="text-sm text-[var(--color-charcoal)] block">No analysis yet</strong><p className="text-xs text-[var(--color-cool-gray)] mt-0.5">Enter your CodeChef username and hit Analyze.</p></div>
          </div>
        )}
      </section>

      {/* Results */}
      <AnimatePresence>
        {profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            {/* Star & Rating Banner */}
            <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--color-cool-gray)] uppercase block mb-1">CodeChef Stars</span>
                  <StarDisplay stars={profile.stars} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--color-cool-gray)] uppercase block">Max Rating</span>
                  <h3 className="text-2xl font-bold text-amber-600">{profile.max_rating || '-'}</h3>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={BarChart3} label="Current Rating" value={profile.rating || '-'} subtitle={`Max: ${profile.max_rating || '-'}`} color="text-amber-600" />
              <StatCard icon={Trophy} label="Problems Solved" value={profile.total_solved || '-'} subtitle="Total solved" />
              <StatCard icon={Calendar} label="Contests" value={profile.contest_count || 0} subtitle="Participated" />
              <StatCard icon={Globe} label="Global Rank" value={profile.global_rank ? `#${profile.global_rank}` : '-'} subtitle={profile.country_rank ? `Country: #${profile.country_rank}` : ''} />
            </div>

            {/* Rating Graph */}
            {profile.contest_history?.length > 0 && (
              <RatingGraph history={profile.contest_history} />
            )}

            {/* Contest History */}
            {profile.contest_history?.length > 0 && (
              <div className="bg-[var(--color-canvas-white)] rounded-[12px] border border-[var(--color-ash-gray)] shadow-[var(--shadow-subtle-3)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--color-charcoal)] flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" /> Contest History
                  </h3>
                  <button onClick={() => setShowAllContests(!showAllContests)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1">
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

export default CodeChefPage;
