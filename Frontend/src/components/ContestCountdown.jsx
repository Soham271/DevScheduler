import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Clock, Zap, ExternalLink } from 'lucide-react';

const platformStyle = {
  leetcode: { label: 'LeetCode', dot: 'bg-amber-400', text: 'text-amber-600', border: 'border-l-amber-400', badge: 'bg-amber-50 text-amber-700' },
  codechef: { label: 'CodeChef', dot: 'bg-red-400', text: 'text-red-600', border: 'border-l-red-400', badge: 'bg-red-50 text-red-700' },
  codeforces: { label: 'Codeforces', dot: 'bg-blue-400', text: 'text-blue-600', border: 'border-l-blue-400', badge: 'bg-blue-50 text-blue-700' },
  devpost: { label: 'Devpost', dot: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-l-indigo-500', badge: 'bg-indigo-50 text-indigo-700' },
  hackerearth: { label: 'HackerEarth', dot: 'bg-purple-500', text: 'text-purple-600', border: 'border-l-purple-500', badge: 'bg-purple-50 text-purple-700' },
  gfg: { label: 'GeeksForGeeks', dot: 'bg-green-500', text: 'text-green-600', border: 'border-l-green-500', badge: 'bg-green-50 text-green-700' },
};

const FALLBACK_URL = {
  leetcode: 'https://leetcode.com/contest/',
  codechef: 'https://www.codechef.com/contests',
  codeforces: 'https://codeforces.com/contests',
  devpost: 'https://devpost.com/hackathons',
  hackerearth: 'https://www.hackerearth.com/challenges/',
  gfg: 'https://practice.geeksforgeeks.org/contest',
};

const parseDate = (str) => {
  if (!str) return null;
  let d = new Date(str);
  if (!isNaN(d)) return d;
  d = new Date(str.replace(/\s*IST\s*$/i, ''));
  return isNaN(d) ? null : d;
};
const pad = (n) => String(n).padStart(2, '0');

const ContestCountdown = ({ contest }) => {
  const isHackathon = contest.type === 'hackathon';
  const target = useMemo(() => parseDate(contest.scheduled_at), [contest.scheduled_at]);
  const [rem, setRem] = useState(() => target ? Math.max(0, Math.floor((target - Date.now()) / 1000)) : null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setRem(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const p = platformStyle[contest.platform] || { label: contest.platform, dot: 'bg-gray-400', text: 'text-gray-600', border: 'border-l-gray-400', badge: 'bg-gray-50 text-gray-700' };
  const d = rem !== null ? Math.floor(rem / 86400) : 0;
  const h = rem !== null ? Math.floor((rem % 86400) / 3600) : 0;
  const m = rem !== null ? Math.floor((rem % 3600) / 60) : 0;
  const s = rem !== null ? rem % 60 : 0;

  const urgency = rem === null ? '' : rem <= 0 ? 'ring-2 ring-red-300' : rem < 3600 ? 'ring-2 ring-red-200' : rem < 86400 ? 'ring-1 ring-amber-200' : '';
  const numColor = rem === null ? 'text-gray-900' : rem < 3600 ? 'text-red-600' : rem < 86400 ? 'text-amber-600' : 'text-emerald-600';
  const contestUrl = contest.url || contest.link || contest.contest_url || FALLBACK_URL[contest.platform];

  return (
    <div className={`bg-white border border-gray-100 ${p.border} border-l-4 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${urgency}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${p.text}`}>
            {isHackathon ? <Zap size={13} /> : <Trophy size={13} />}
            {p.label}
          </div>
          {/* Type badge */}
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${p.badge}`}>
            {isHackathon ? 'Hackathon' : 'Contest'}
          </span>
        </div>
        <Clock size={13} className="text-gray-300" />
      </div>

      {/* Contest / Hackathon name */}
      <h4 className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-2">{contest.name}</h4>
      <p className="text-xs text-gray-400 mb-3">{contest.scheduled_at}</p>

      {/* Link */}
      {contestUrl && (
        <a
          href={contestUrl}
          target="_blank"
          rel="noreferrer"
          className={`inline-flex items-center gap-1 text-xs font-medium mb-3 hover:underline ${p.text}`}
        >
          <ExternalLink size={11} /> View {isHackathon ? 'Hackathon' : 'Contest'}
        </a>
      )}

      {/* Countdown tiles */}
      {rem !== null && rem > 0 ? (
        <div className="flex gap-2">
          {d > 0 && (
            <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
              <strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(d)}</strong>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">days</span>
            </div>
          )}
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
            <strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(h)}</strong>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">hrs</span>
          </div>
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
            <strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(m)}</strong>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">min</span>
          </div>
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100">
            <strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(s)}</strong>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">sec</span>
          </div>
        </div>
      ) : rem === 0 ? (
        <div className="text-center py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm animate-pulse">🔴 Starting now!</div>
      ) : (
        <div className={`text-center py-2 font-semibold text-sm ${p.text}`}>{contest.time_remaining}</div>
      )}
    </div>
  );
};

export default ContestCountdown;
