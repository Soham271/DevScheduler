import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { getLocalProfile } from '../utils/auth';
import {
  Activity, BarChart3, Flame, Trophy, Calendar,
  Zap, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Search, Star, Globe, MapPin, Award, Code2, GraduationCap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  Stats Card
// ═══════════════════════════════════════════════════════════════
const StatCard = ({ label, value, subtitle, color = 'text-gray-900', icon: Icon }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />}
    </div>
    <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
//  Main GeeksForGeeks Intelligence Page
// ═══════════════════════════════════════════════════════════════
const GFGPage = () => {
  const stored = getLocalProfile();
  const [username, setUsername] = useState(stored?.gfg_username || '');
  const [profile, setProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username && location.state?.autoAnalyze) {
      const u = location.state.username;
      setUsername(u);
      const run = async () => {
        setAnalyzing(true); setError(''); setProfile(null);
        try { const data = await api.gfgAnalyze(u); setProfile(data.profile); }
        catch (err) { setError(err.message || 'Failed to analyze.'); }
        finally { setAnalyzing(false); }
      };
      if (!profile || profile.username !== u) run();
    }
  }, [location.state]);

  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = username.trim();
    if (!u) { setError('Please enter a GeeksForGeeks username.'); return; }
    setAnalyzing(true); setError(''); setProfile(null);
    try { const data = await api.gfgAnalyze(u); setProfile(data.profile); }
    catch (err) { setError(err.message || 'Failed to analyze.'); }
    finally { setAnalyzing(false); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-400 to-green-600" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <Code2 size={22} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">GeeksForGeeks Intelligence</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">Live</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Track your coding score, streaks, and problem-solving progress.</p>
          </div>
        </div>
      </motion.header>

      {/* Analyze */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <span className="flex items-center gap-1 text-xs font-bold text-green-500 uppercase tracking-wider"><Zap size={12} /> GFG Analysis</span>
          <h2 className="text-lg font-bold text-gray-900 mt-0.5">Analyze Profile</h2>
        </div>
        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GeeksForGeeks username"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 transition placeholder:text-gray-400" />
          </div>
          <button type="submit" disabled={analyzing || !username.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-50">
            {analyzing ? <><Activity size={15} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={15} /> Analyze</>}
          </button>
        </form>
        {error && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>}
        {!profile && !error && !analyzing && (
          <div className="mt-5 flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Search size={20} className="text-green-400 shrink-0" />
            <div><strong className="text-sm text-gray-700 block">No analysis yet</strong><p className="text-xs text-gray-500 mt-0.5">Enter your GeeksForGeeks username and hit Analyze.</p></div>
          </div>
        )}
      </section>

      {/* Results */}
      <AnimatePresence>
        {profile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
            
            {/* Institute Banner */}
            {profile.institute && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{profile.institute}</h3>
                    {profile.institute_rank > 0 && (
                      <p className="text-sm text-gray-500">Institute Rank: #{profile.institute_rank}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Award} label="Coding Score" value={profile.coding_score || 0} subtitle="Overall score" color="text-green-600" />
              <StatCard icon={Trophy} label="Problems Solved" value={profile.total_solved || 0} subtitle="Total problems" />
              <StatCard icon={Flame} label="Current Streak" value={`${profile.current_streak || 0}d`} subtitle={`Max: ${profile.max_streak || 0}d`} color="text-orange-500" />
              <StatCard icon={TrendingUp} label="Monthly Coding" value={profile.monthly_coding || 0} subtitle="Score this month" color="text-blue-500" />
            </div>

            {/* Difficulty Breakdown */}
            {(profile.easy_solved > 0 || profile.medium_solved > 0 || profile.hard_solved > 0) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-3xl font-bold text-emerald-500">{profile.easy_solved}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Easy Solved</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <p className="text-3xl font-bold text-amber-500">{profile.medium_solved}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Medium Solved</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-50/50 border border-red-100">
                  <p className="text-3xl font-bold text-red-500">{profile.hard_solved}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Hard Solved</p>
                </div>
              </div>
            )}

            {/* Languages Used */}
            {profile.languages_used?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code2 size={18} className="text-green-500" /> Languages Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages_used.map((lang, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GFGPage;
