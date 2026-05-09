import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getUserEmail, getLocalProfile, saveProfileLocally } from '../utils/auth';
import StatsCard from '../components/StatsCard';
import ContestCountdown from '../components/ContestCountdown';
import TierBadge from '../components/TierBadge';
import HealthIndicator from '../components/HealthIndicator';
import ActionButton from '../components/ActionButton';
import { Activity, AlertTriangle, BarChart3, Bell, Calendar, ChevronDown, ChevronUp, Clock, Code2, Eye, Flame, Mail, RefreshCw, Save, Search, Send, Sparkles, Terminal, Trophy, UserPlus, Users, Zap } from 'lucide-react';

const pCfg = { leetcode: { label: 'LeetCode', icon: Code2, ph: 'Enter LeetCode username' }, codechef: { label: 'CodeChef', icon: Terminal, ph: 'Enter CodeChef username' }, codeforces: { label: 'Codeforces', icon: Activity, ph: 'Enter Codeforces handle' }, gfg: { label: 'GeeksForGeeks', icon: Code2, ph: 'Enter GFG username' } };
const norm = (p) => { const r = p?.analysis || {}; const fp = { username: p?.username || '', platform: p?.platform || '', submissions_today: p?.submissions_today, is_inactive_today: p?.is_inactive_today }; const pr = r.profile || fp; const inactive = Boolean(p?.is_inactive_today ?? r.is_inactive_today ?? pr.is_inactive_today); const hidden = Boolean(p?.profile_hidden || (inactive && !p?.analysis)); const msgs = [...(r.messages || [])]; if (p?.warning) msgs.push({ category: 'warning', text: p.warning }); if (p?.suggestion) msgs.push({ category: 'suggestion', text: p.suggestion }); return { headline: p?.message || r.message || 'Analysis complete', platform: pr.platform || r.platform || p?.platform, username: pr.username || r.username || p?.username, profile: pr, profileHidden: hidden, contests: r.contests || p?.contests || [], messages: msgs, performanceLevel: r.performance_level || p?.performance_level || p?.classification, ratingLevel: r.rating_level || p?.rating_level, isInactiveToday: inactive, isMockData: Boolean(pr.is_mock_data) }; };

const x = () => { return 10; }

const AnalysisAlert = ({ pf, dt }) => {
  const cap = pf.charAt(0).toUpperCase() + pf.slice(1);
  return (
    <div className="mt-5 p-5 rounded-xl bg-amber-50 border border-amber-200 flex gap-4 items-start animate-fade-in">
      <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase">{pCfg[pf]?.label || cap}</span>
        <h3 className="font-bold text-gray-900 mt-0.5">{dt.headline}</h3>
        {dt.messages.map((m, i) => (
          <p key={i} className="text-sm text-gray-600 mt-2 leading-relaxed">
            {m.text.replace(/LeetCode/gi, cap)}
          </p>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const email = getUserEmail();
  const stored = getLocalProfile();
  const initial = email ? email.charAt(0).toUpperCase() : '?';
  const defSend = useMemo(() => { const d = new Date(Date.now() + 3600000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }, []);

  const [profile, setProfile] = useState({ leetcode_username: '', codechef_username: '', codeforces_username: '', gfg_username: '', ...(stored || {}) });
  const [plat, setPlat] = useState(stored?.codechef_username && !stored?.leetcode_username ? 'codechef' : 'leetcode');
  const [analysis, setAnalysis] = useState(null);
  const [aErr, setAErr] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [contests, setContests] = useState([]);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pStatus, setPStatus] = useState(null);
  const [mStatus, setMStatus] = useState(null);
  const [eStatus, setEStatus] = useState(null);
  const [savingP, setSavingP] = useState(false);
  const [reging, setReging] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [profOpen, setProfOpen] = useState(false);
  const [ef, setEf] = useState({ to: email || '', subject: 'Daily coding reminder', body: 'Time to solve one problem and keep your DevFlow streak alive.', sendAt: defSend });

  const uname = plat === 'leetcode' ? profile.leetcode_username : plat === 'codechef' ? profile.codechef_username : plat === 'codeforces' ? profile.codeforces_username : profile.gfg_username;
  const PIcon = pCfg[plat].icon;

  const load = useCallback(async () => {
    setRefreshing(true);
    const [cr, ur] = await Promise.allSettled([api.getContests('all'), api.getRegisteredUsers()]);
    if (cr.status === 'fulfilled') setContests(cr.value?.contests || []);
    if (ur.status === 'fulfilled') setUsers(ur.value?.users || []);
    setRefreshing(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const upd = (f, v) => { setProfile(c => ({ ...c, [f]: v })); setPStatus(null); };
  const doSaveP = async (e) => { e.preventDefault(); setSavingP(true); setPStatus(null); try { const n = { leetcode_username: profile.leetcode_username.trim(), codechef_username: profile.codechef_username.trim(), codeforces_username: profile.codeforces_username.trim(), gfg_username: profile.gfg_username.trim() }; await api.saveProfile(n); saveProfileLocally(n); setProfile(n); setPStatus({ t: 'ok', m: 'Profile saved.' }); } catch (err) { setPStatus({ t: 'err', m: err.message || 'Failed.' }); } finally { setSavingP(false); } };
  const doAnalyze = async (e) => { e.preventDefault(); const u = uname?.trim(); if (!u) { setAErr(`Add a ${pCfg[plat].label} username first.`); return; } setAnalyzing(true); setAErr(''); setAnalysis(null); try { const d = await api.analyzeUser(plat, u); setAnalysis(norm(d)); } catch (err) { setAErr(err.message || 'Failed.'); } finally { setAnalyzing(false); } };
  const doMonitor = async () => { const u = uname?.trim(); if (!u) { setMStatus({ t: 'err', m: `Add a ${pCfg[plat].label} username first.` }); return; } if (!email) { setMStatus({ t: 'err', m: 'Login email not found.' }); return; } setReging(true); setMStatus(null); try { await api.registerUser(plat, u, email); setMStatus({ t: 'ok', m: `Monitoring enabled for ${u}.` }); await load(); } catch (err) { setMStatus({ t: 'err', m: err.message || 'Failed.' }); } finally { setReging(false); } };
  const doSchedule = async (e) => { e.preventDefault(); setScheduling(true); setEStatus(null); try { const sd = new Date(ef.sendAt); if (isNaN(sd)) throw new Error('Invalid time.'); const d = await api.scheduleEmail({ to: ef.to.trim(), subject: ef.subject.trim(), body: ef.body.trim(), send_at: sd.toISOString() }); setEStatus({ t: 'ok', m: d?.message || 'Scheduled.' }); } catch (err) { setEStatus({ t: 'err', m: err.message || 'Failed.' }); } finally { setScheduling(false); } };
  const doSend = async () => { setSending(true); setEStatus(null); try { const d = await api.sendEmail({ to: ef.to.trim(), subject: ef.subject.trim(), body: ef.body.trim() }); setEStatus({ t: 'ok', m: d?.message || 'Sent.' }); } catch (err) { setEStatus({ t: 'err', m: err.message || 'Failed.' }); } finally { setSending(false); } };

  const Status = ({ s }) => s ? <div className={`mt-3 p-3 rounded-xl text-sm text-center animate-fade-in ${s.t === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{s.m}</div> : null;
  const inp = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition placeholder:text-gray-400";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      {/* Hero */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Code2} label="Problems Solved" variant="purple" value={analysis?.profile?.total_solved ?? '—'} subtitle={analysis ? `on ${pCfg[analysis.platform]?.label || analysis.platform}` : 'Run analysis'} />
        <StatsCard icon={Trophy} label="Contest Rating" variant={analysis?.platform === 'codeforces' ? (analysis.profile.rating >= 2400 ? 'rose' : analysis.profile.rating >= 2100 ? 'amber' : analysis.profile.rating >= 1900 ? 'purple' : analysis.profile.rating >= 1600 ? 'cyan' : analysis.profile.rating >= 1400 ? 'cyan' : analysis.profile.rating >= 1200 ? 'emerald' : 'purple') : 'cyan'} value={analysis?.profile?.rating ?? '—'} subtitle={analysis?.ratingLevel ? `${analysis.ratingLevel} tier` : 'Run analysis'} />
        <StatsCard icon={Flame} label="Today's Activity" variant={analysis?.isInactiveToday === false ? 'emerald' : 'amber'} value={analysis ? (analysis.isInactiveToday ? '⚠ Inactive' : '✓ Active') : '—'} subtitle={analysis?.isInactiveToday ? 'Solve 1 problem!' : analysis ? 'Keep going!' : 'Run analysis'} />
        <StatsCard icon={Calendar} label="Upcoming Contests" variant="rose" value={contests.length || '—'} subtitle={contests.length ? 'across platforms' : 'Loading...'} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
        {/* Left */}
        <div className="flex flex-col gap-5">
          {/* Analyze */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Zap size={12} /> Intelligence</span><h2 className="text-lg font-bold text-gray-900">Analyze Profile</h2></div>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                {Object.entries(pCfg).map(([k, c]) => { const I = c.icon; return <button key={k} onClick={() => { setPlat(k); setAErr(''); setMStatus(null); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${plat === k ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><I size={13} />{c.label}</button>; })}
              </div>
            </div>

            <form onSubmit={doAnalyze} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-center">
              <div className="relative"><PIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={uname} placeholder={pCfg[plat].ph} onChange={e => upd(plat + '_username', e.target.value)} className={inp} /></div>
              <ActionButton type="submit" disabled={analyzing || !uname?.trim()}>{analyzing ? <><Activity size={15} className="icon-spin" />Analyzing...</> : <><BarChart3 size={15} />Analyze</>}</ActionButton>
              <button type="button" onClick={doMonitor} disabled={reging} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm">{reging ? <Activity size={15} className="icon-spin" /> : <UserPlus size={15} />}Monitor</button>
            </form>

            {aErr && <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center animate-fade-in">{aErr}</div>}
            <Status s={mStatus} />

            {!analysis && !aErr && <div className="mt-5 flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50"><Search size={20} className="text-brand-400 shrink-0" /><div><strong className="text-sm text-gray-700 block">No analysis yet</strong><p className="text-xs text-gray-500 mt-0.5">Enter your username and hit Analyze to get insights.</p></div></div>}

            {analysis && analysis.isInactiveToday && analysis.profileHidden && (
              <AnalysisAlert pf={analysis.platform} dt={analysis} />
            )}

            {analysis && !analysis.profileHidden && (
              <div className="mt-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div><span className="text-xs font-bold text-gray-400 uppercase block">{pCfg[analysis.platform]?.label}</span><h3 className="font-bold text-gray-900 text-lg">{analysis.username}</h3></div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {analysis.isMockData && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 border border-brand-200">Mock</span>}
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${analysis.isInactiveToday ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>{analysis.isInactiveToday ? '⚠ Inactive' : '✓ Active'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100"><Trophy size={18} className="text-amber-400 mb-1" /><span className="block text-xs text-gray-500">Rating</span><strong className="text-lg text-gray-900">{analysis.profile.rating ?? 'N/A'}</strong></div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100"><Code2 size={18} className="text-brand-400 mb-1" /><span className="block text-xs text-gray-500">Solved</span><strong className="text-lg text-gray-900">{analysis.profile.total_solved ?? 'N/A'}</strong></div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100"><Flame size={18} className={`mb-1 ${analysis.isInactiveToday ? 'text-amber-400' : 'text-emerald-400'}`} /><span className="block text-xs text-gray-500">Activity</span><strong className="text-lg text-gray-900">{analysis.isInactiveToday ? 'Needs work' : 'On track'}</strong></div>
                </div>

                {(analysis.performanceLevel || analysis.ratingLevel) && <div className="flex gap-3 flex-wrap">{analysis.performanceLevel && <TierBadge tier={analysis.performanceLevel} type="performance" />}{analysis.ratingLevel && <TierBadge tier={analysis.ratingLevel} type="rating" />}</div>}

                {analysis.messages.length > 0 && <div className="space-y-2">{analysis.messages.map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl border bg-white ${m.category === 'warning' ? 'border-l-4 border-l-amber-400 border-gray-100' : m.category === 'motivation' ? 'border-l-4 border-l-emerald-400 border-gray-100' : 'border-l-4 border-l-brand-400 border-gray-100'}`}>
                    <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${m.category === 'warning' ? 'text-amber-500' : m.category === 'motivation' ? 'text-emerald-500' : 'text-brand-500'}`}>{m.category || 'note'}</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{m.text}</p>
                  </div>
                ))}</div>}
              </div>
            )}
          </section>

          {/* Profile collapsible */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setProfOpen(p => !p)} className="w-full flex items-center justify-between p-6 text-left">
              <div><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Users size={12} /> Profile</span><h2 className="text-lg font-bold text-gray-900">Connected Handles</h2></div>
              {profOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {profOpen && <form onSubmit={doSaveP} className="px-6 pb-6 space-y-4 animate-fade-in">
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">LeetCode</label><div className="relative"><Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={profile.leetcode_username} onChange={e => upd('leetcode_username', e.target.value)} placeholder="e.g. neetcode" className={inp} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">CodeChef</label><div className="relative"><Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={profile.codechef_username} onChange={e => upd('codechef_username', e.target.value)} placeholder="e.g. tourist" className={inp} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Codeforces</label><div className="relative"><Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={profile.codeforces_username} onChange={e => upd('codeforces_username', e.target.value)} placeholder="e.g. tourist" className={inp} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">GeeksForGeeks</label><div className="relative"><Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="text" value={profile.gfg_username} onChange={e => upd('gfg_username', e.target.value)} placeholder="e.g. gfg_user" className={inp} /></div></div>
              <ActionButton type="submit" disabled={savingP}>{savingP ? <><Activity size={15} className="icon-spin" />Saving...</> : <><Save size={15} />Save Profile</>}</ActionButton>
              <Status s={pStatus} />
            </form>}
          </section>

          {/* Email collapsible */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => setEmailOpen(p => !p)} className="w-full flex items-center justify-between p-6 text-left">
              <div><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Mail size={12} /> Reminders</span><h2 className="text-lg font-bold text-gray-900">Schedule or Send Email</h2></div>
              {emailOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {emailOpen && <form onSubmit={doSchedule} className="px-6 pb-6 space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="email" value={ef.to} onChange={e => setEf(c => ({ ...c, to: e.target.value }))} placeholder="you@example.com" required className={inp} /></div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label><input type="text" value={ef.subject} onChange={e => setEf(c => ({ ...c, subject: e.target.value }))} placeholder="Subject" required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition placeholder:text-gray-400" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label><textarea value={ef.body} onChange={e => setEf(c => ({ ...c, body: e.target.value }))} placeholder="Write your reminder..." required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition placeholder:text-gray-400 min-h-[100px] resize-y" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Time</label><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} /><input type="datetime-local" value={ef.sendAt} onChange={e => setEf(c => ({ ...c, sendAt: e.target.value }))} required className={inp} /></div></div>
                <div className="flex gap-2">
                  <ActionButton type="submit" disabled={scheduling}>{scheduling ? <><Activity size={15} className="icon-spin" />...</> : <><Calendar size={15} />Schedule</>}</ActionButton>
                  <button type="button" onClick={doSend} disabled={sending} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm">{sending ? <Activity size={15} className="icon-spin" /> : <Send size={15} />}Send Now</button>
                </div>
              </div>
              <Status s={eStatus} />
            </form>}
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Contests */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4"><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Trophy size={12} /> Live Contests</span><h2 className="text-lg font-bold text-gray-900">Upcoming Countdowns</h2></div>
            {contests.length > 0 ? <div className="space-y-3">{contests.map(c => <ContestCountdown key={`${c.platform}-${c.name}`} contest={c} />)}</div>
              : <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50"><Clock size={18} className="text-gray-300" /><p className="text-sm text-gray-500">No contests loaded yet.</p></div>}
          </section>

          {/* Monitor */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-4"><span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider"><Eye size={12} /> Monitoring</span><h2 className="text-lg font-bold text-gray-900">Watched Handles</h2></div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
              <p className="text-sm text-gray-500 mb-3">Register for automated inactivity alerts, contest reminders, and periodic analysis.</p>
              <ActionButton onClick={doMonitor} disabled={reging} className="[&_button]:text-xs [&_button]:py-2">{reging ? <Activity size={14} className="icon-spin" /> : <Bell size={14} />}Monitor Handle</ActionButton>
            </div>
            <Status s={mStatus} />
            {users.length > 0 ? <div className="space-y-2 mt-3">{users.map(u => (
              <div key={`${u.platform}-${u.username}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${u.platform === 'leetcode' ? 'bg-amber-400' : 'bg-red-400'}`} /><strong className="text-sm text-gray-900">{u.username}</strong><span className="text-xs text-gray-400">{pCfg[u.platform]?.label}</span></div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Watching</span>
              </div>
            ))}</div>
              : <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 mt-3"><Users size={18} className="text-gray-300" /><p className="text-sm text-gray-500">No monitored users yet.</p></div>}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
