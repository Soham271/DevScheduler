import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getLocalProfile, getUserEmail } from '../utils/auth';
import { Activity, Bell, Code2, Eye, Terminal, UserPlus } from 'lucide-react';

const pCfg = {
  leetcode: { label: 'LeetCode', icon: Code2, field: 'leetcode_username' },
  codechef: { label: 'CodeChef', icon: Terminal, field: 'codechef_username' },
  codeforces: { label: 'Codeforces', icon: Activity, field: 'codeforces_username' },
  gfg: { label: 'GeeksForGeeks', icon: Code2, field: 'gfg_username' },
};

const Watch = () => {
  const email = getUserEmail();
  const stored = getLocalProfile();
  const [plat, setPlat] = useState('leetcode');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reging, setReging] = useState(false);
  const [status, setStatus] = useState(null);

  const username = useMemo(() => {
    if (!stored) return '';
    return stored[pCfg[plat].field] || '';
  }, [stored, plat]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getRegisteredUsers();
      setUsers(res?.users || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const doMonitor = async () => {
    if (!username?.trim()) {
      setStatus({ t: 'err', m: `No ${pCfg[plat].label} username found in your profile.` });
      return;
    }
    if (!email) {
      setStatus({ t: 'err', m: 'Login email not found.' });
      return;
    }
    setReging(true);
    setStatus(null);
    try {
      await api.registerUser(plat, username.trim(), email);
      setStatus({ t: 'ok', m: `Monitoring enabled for ${username}.` });
      await load();
    } catch (err) {
      setStatus({ t: 'err', m: err.message || 'Failed.' });
    } finally {
      setReging(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-5">
          <span className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-1"><Eye size={12} /> Monitoring</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Watched Handles</h1>
          <p className="text-sm text-gray-500 mt-1">Use your profile handles and start watching activity.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(pCfg).map(([k, cfg]) => {
            const I = cfg.icon;
            return (
              <button key={k} onClick={() => setPlat(k)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${plat === k ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                <I size={13} /> {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4">
          <p className="text-sm text-gray-600">Selected handle: <strong>{username || 'Not set in profile'}</strong></p>
          <button onClick={doMonitor} disabled={reging} className="mt-3 flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm">
            {reging ? <Activity size={15} className="icon-spin" /> : <UserPlus size={15} />} Monitor This Handle
          </button>
        </div>

        {status && <div className={`mt-3 p-3 rounded-xl text-sm text-center ${status.t === 'ok' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{status.m}</div>}
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5"><Bell size={16} /> Active Watches</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading watches...</p>
        ) : users.length > 0 ? (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={`${u.platform}-${u.username}`} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${u.platform === 'leetcode' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  <strong className="text-sm text-gray-900">{u.username}</strong>
                  <span className="text-xs text-gray-400">{pCfg[u.platform]?.label || u.platform}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-500">Watching</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Eye size={18} className="text-gray-300" />
            <p className="text-sm text-gray-500">No monitored users yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Watch;
