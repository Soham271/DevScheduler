import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getUserEmail, getLocalProfile } from '../utils/auth';
import StatsCard from '../components/StatsCard';
import TierBadge from '../components/TierBadge';
import HealthIndicator from '../components/HealthIndicator';
import ActionButton from '../components/ActionButton';
import ActivityFeed from '../components/ActivityFeed';
import { Activity, AlertTriangle, BarChart3, Calendar, ChevronRight, Code2, Eye, Flame, RefreshCw, Search, Sparkles, Terminal, Trophy, UserPlus, Zap } from 'lucide-react';

const pCfg = {
  leetcode: { label: 'LeetCode', icon: Code2, ph: 'Enter LeetCode username' },
  codechef: { label: 'CodeChef', icon: Terminal, ph: 'Enter CodeChef username' },
  codeforces: { label: 'Codeforces', icon: Activity, ph: 'Enter Codeforces handle' },
  gfg: { label: 'GeeksForGeeks', icon: Code2, ph: 'Enter GFG username' },
};

const norm = (p) => {
  const r = p?.analysis || {};
  const fp = { username: p?.username || '', platform: p?.platform || '', submissions_today: p?.submissions_today, is_inactive_today: p?.is_inactive_today };
  const pr = r.profile || fp;
  const inactive = Boolean(p?.is_inactive_today ?? r.is_inactive_today ?? pr.is_inactive_today);
  const hidden = Boolean(p?.profile_hidden || (inactive && !p?.analysis));
  const msgs = [...(r.messages || [])];
  if (p?.warning) msgs.push({ category: 'warning', text: p.warning });
  if (p?.suggestion) msgs.push({ category: 'suggestion', text: p.suggestion });
  return {
    headline: p?.message || r.message || 'Analysis complete',
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

const AnalysisAlert = ({ pf, dt }) => {
  const cap = pf.charAt(0).toUpperCase() + pf.slice(1);
  return (
    <div className="mt-5 p-5 rounded-xl bg-amber-50 border border-amber-200 flex gap-4 items-start animate-fade-in">
      <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase">{pCfg[pf]?.label || cap}</span>
        <h3 className="font-bold text-gray-900 mt-0.5">{dt.headline}</h3>
        {dt.messages.map((m, i) => (
          <p key={i} className="text-sm text-gray-600 mt-2 leading-relaxed">{m.text.replace(/LeetCode/gi, cap)}</p>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const email = getUserEmail();
  const stored = getLocalProfile();
  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const [profile, setProfile] = useState({ leetcode_username: '', codechef_username: '', codeforces_username: '', gfg_username: '', ...(stored || {}) });
  const [plat, setPlat] = useState(stored?.codechef_username && !stored?.leetcode_username ? 'codechef' : 'leetcode');
  const [analysis, setAnalysis] = useState(null);
  const [aErr, setAErr] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [contestsCount, setContestsCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [mStatus, setMStatus] = useState(null);
  const [reging, setReging] = useState(false);

  const uname = plat === 'leetcode' ? profile.leetcode_username : plat === 'codechef' ? profile.codechef_username : plat === 'codeforces' ? profile.codeforces_username : profile.gfg_username;
  const PIcon = pCfg[plat].icon;

  const load = useCallback(async () => {
    setRefreshing(true);
    const [cr, ur] = await Promise.allSettled([api.getContests('all'), api.getRegisteredUsers()]);
    if (cr.status === 'fulfilled') setContestsCount(cr.value?.contests?.length || 0);
    if (ur.status === 'fulfilled') setWatchCount(ur.value?.users?.length || 0);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const upd = (f, v) => setProfile((c) => ({ ...c, [f]: v }));
  const doAnalyze = async (e) => {
    e.preventDefault();
    const u = uname?.trim();
    if (!u) {
      setAErr(`Add a ${pCfg[plat].label} username first.`);
      return;
    }
    setAnalyzing(true);
    setAErr('');
    setAnalysis(null);
    try {
      const d = await api.analyzeUser(plat, u);
      setAnalysis(norm(d));
    } catch (err) {
      setAErr(err.message || 'Failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const doMonitor = async () => {
    const u = uname?.trim();
    if (!u) {
      setMStatus({ t: 'err', m: `Add a ${pCfg[plat].label} username first.` });
      return;
    }
    if (!email) {
      setMStatus({ t: 'err', m: 'Login email not found.' });
      return;
    }
    setReging(true);
    setMStatus(null);
    try {
      await api.registerUser(plat, u, email);
      setMStatus({ t: 'ok', m: `Monitoring enabled for ${u}.` });
      await load();
    } catch (err) {
      setMStatus({ t: 'err', m: err.message || 'Failed.' });
    } finally {
      setReging(false);
    }
  };

  const Status = ({ s }) => s ? <div className={`mt-3 p-3 rounded-xl text-sm text-center animate-fade-in ${s.t === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{s.m}</div> : null;
  const inp = 'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400';

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-accent-400 to-brand-600" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white text-2xl font-extrabold uppercase shadow-lg">{initial}</div>
          <div>
            <span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Sparkles size={12} /> DevFlow Scheduler</span>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">Welcome back{email ? `, ${email.split('@')[0]}` : ''}</h1>
            <p className="text-sm text-gray-500">{email || 'DevFlow User'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <HealthIndicator />
          <button onClick={load} disabled={refreshing} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm">
            <RefreshCw size={15} className={refreshing ? 'icon-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Code2} label="Problems Solved" variant="purple" value={analysis?.profile?.total_solved ?? '-'} subtitle={analysis ? `on ${pCfg[analysis.platform]?.label || analysis.platform}` : 'Run analysis'} />
        <StatsCard icon={Trophy} label="Contest Rating" variant="cyan" value={analysis?.profile?.rating ?? '-'} subtitle={analysis?.ratingLevel ? `${analysis.ratingLevel} tier` : 'Run analysis'} />
        <StatsCard icon={Flame} label="Today's Activity" variant={analysis?.isInactiveToday === false ? 'emerald' : 'amber'} value={analysis ? (analysis.isInactiveToday ? 'Inactive' : 'Active') : '-'} subtitle={analysis?.isInactiveToday ? 'Solve 1 problem!' : analysis ? 'Keep going!' : 'Run analysis'} />
        <StatsCard icon={Calendar} label="Upcoming Contests" variant="rose" value={contestsCount || '-'} subtitle={`${watchCount} watched handles`} />
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Zap size={12} /> Intelligence</span><h2 className="text-lg font-bold text-gray-900">Analyze Profile</h2></div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {Object.entries(pCfg).map(([k, c]) => { const I = c.icon; return <button key={k} onClick={() => { setPlat(k); setAErr(''); setMStatus(null); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${plat === k ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><I size={13} />{c.label}</button>; })}
          </div>
        </div>

        <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center">
          <div className="relative"><PIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={uname} placeholder={pCfg[plat].ph} onChange={(e) => upd(plat + '_username', e.target.value)} className={inp} /></div>
          <ActionButton type="submit" disabled={analyzing || !uname?.trim()}>{analyzing ? <><Activity size={15} className="icon-spin" />Analyzing...</> : <><BarChart3 size={15} />Analyze</>}</ActionButton>
          <button type="button" onClick={doMonitor} disabled={reging} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm">{reging ? <Activity size={15} className="icon-spin" /> : <UserPlus size={15} />}Monitor</button>
        </form>

        {aErr && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-fade-in">{aErr}</div>}
        <Status s={mStatus} />

        {!analysis && !aErr && <div className="mt-5 flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50"><Search size={20} className="text-brand-400 shrink-0" /><div><strong className="text-sm text-gray-700 block">No analysis yet</strong><p className="text-xs text-gray-500 mt-0.5">Enter your username and hit Analyze to get insights.</p></div></div>}

        {analysis && analysis.isInactiveToday && analysis.profileHidden && <AnalysisAlert pf={analysis.platform} dt={analysis} />}
        {analysis && !analysis.profileHidden && (
          <div className="mt-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div><span className="text-xs font-bold text-gray-400 uppercase block">{pCfg[analysis.platform]?.label}</span><h3 className="font-bold text-gray-900 text-lg">{analysis.username}</h3></div>
              <div className="flex items-center gap-2 flex-wrap">
                {analysis.isMockData && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200">Mock</span>}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${analysis.isInactiveToday ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>{analysis.isInactiveToday ? 'Inactive' : 'Active'}</span>
              </div>
            </div>
            {(analysis.performanceLevel || analysis.ratingLevel) && <div className="flex gap-3 flex-wrap">{analysis.performanceLevel && <TierBadge tier={analysis.performanceLevel} type="performance" />}{analysis.ratingLevel && <TierBadge tier={analysis.ratingLevel} type="rating" />}</div>}
            {pCfg[analysis.platform] && (
              <div className="pt-2">
                <Link 
                  to={`/platforms/${analysis.platform}`} 
                  state={{ username: analysis.username, autoAnalyze: true }}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 w-fit"
                >
                  For more detail <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      <ActivityFeed />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/contests" className="no-underline p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-500">Contests</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1">Open Live Contest Page</h3>
          <p className="text-sm text-gray-500 mt-1">All countdowns in one dedicated screen.</p>
        </Link>
        <Link to="/schedule" className="no-underline p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Schedule</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1">Email Scheduler</h3>
          <p className="text-sm text-gray-500 mt-1">Set date/time with calendar and send reminders.</p>
        </Link>
        <Link to="/watch" className="no-underline p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Watch</p>
          <h3 className="text-lg font-bold text-gray-900 mt-1">Watched Handles</h3>
          <p className="text-sm text-gray-500 mt-1">Monitor handles and manage watch list.</p>
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
