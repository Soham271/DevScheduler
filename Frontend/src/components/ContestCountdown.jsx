import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Clock } from 'lucide-react';

const platformStyle = {
  leetcode: { label: 'LeetCode', dot: 'bg-amber-400', text: 'text-amber-600', border: 'border-l-amber-400' },
  codechef: { label: 'CodeChef', dot: 'bg-red-400', text: 'text-red-600', border: 'border-l-red-400' },
};

const parseDate = (str) => {
  if (!str) return null;
  let d = new Date(str);
  if (!isNaN(d)) return d;
  d = new Date(str.replace(/\s*IST\s*$/i, ''));
  return isNaN(d) ? null : d;
};
const pad = (n) => String(n).padStart(2, '0');
const FALLBACK_PLATFORM_URL = {
  leetcode: 'https://leetcode.com/contest/',
  codechef: 'https://www.codechef.com/contests',
  codeforces: 'https://codeforces.com/contests',
  gfg: 'https://practice.geeksforgeeks.org/contest',
};

const ContestCountdown = ({ contest }) => {
  const target = useMemo(() => parseDate(contest.scheduled_at), [contest.scheduled_at]);
  const [rem, setRem] = useState(() => target ? Math.max(0, Math.floor((target - Date.now()) / 1000)) : null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setRem(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const p = platformStyle[contest.platform] || { label: contest.platform, dot: 'bg-gray-400', text: 'text-gray-600', border: 'border-l-gray-400' };
  const d = rem !== null ? Math.floor(rem / 86400) : 0;
  const h = rem !== null ? Math.floor((rem % 86400) / 3600) : 0;
  const m = rem !== null ? Math.floor((rem % 3600) / 60) : 0;
  const s = rem !== null ? rem % 60 : 0;

  const urgency = rem === null ? '' : rem <= 0 ? 'ring-2 ring-red-300' : rem < 3600 ? 'ring-2 ring-red-200' : rem < 86400 ? 'ring-1 ring-amber-200' : '';
  const numColor = rem === null ? 'text-gray-900' : rem < 3600 ? 'text-red-600' : rem < 86400 ? 'text-amber-600' : 'text-emerald-600';
  const contestUrl = contest.url || contest.link || contest.contest_url || FALLBACK_PLATFORM_URL[contest.platform];

  return (
    <div className={`bg-white border border-gray-100 ${p.border} border-l-4 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${urgency}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${p.text}`}>
          <Trophy size={13} /> {p.label}
        </div>
        <Clock size={13} className="text-gray-300" />
      </div>
      <h4 className="font-bold text-gray-900 text-sm mb-0.5">{contest.name}</h4>
      <p className="text-xs text-gray-400 mb-3">{contest.scheduled_at}</p>
      {contestUrl && (
        <a
          href={contestUrl}
          target="_blank"
          rel="noreferrer"
          className="block text-xs text-blue-600 hover:text-blue-700 hover:underline truncate mb-3"
          title={contestUrl}
        >
          {contestUrl}
        </a>
      )}

      {rem !== null && rem > 0 ? (
        <div className="flex gap-2">
          {d > 0 && <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100"><strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(d)}</strong><span className="text-[10px] text-gray-400 uppercase font-semibold">days</span></div>}
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100"><strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(h)}</strong><span className="text-[10px] text-gray-400 uppercase font-semibold">hrs</span></div>
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100"><strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(m)}</strong><span className="text-[10px] text-gray-400 uppercase font-semibold">min</span></div>
          <div className="flex-1 text-center py-2 bg-gray-50 rounded-lg border border-gray-100"><strong className={`block text-lg font-extrabold tabular-nums ${numColor}`}>{pad(s)}</strong><span className="text-[10px] text-gray-400 uppercase font-semibold">sec</span></div>
        </div>
      ) : rem === 0 ? (
        <div className="text-center py-2 rounded-lg bg-red-50 text-red-600 font-bold text-sm animate-pulse">🔴 Starting now!</div>
      ) : (
        <div className="text-center py-2 text-brand-600 font-semibold text-sm">{contest.time_remaining}</div>
      )}
    </div>
  );
};

export default ContestCountdown;
