import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ContestCountdown from '../components/ContestCountdown';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadContests = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const result = await api.getContests('all');
      setContests(result?.contests || []);
    } catch (err) {
      setError(err.message || 'Failed to load contests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 animate-fade-in-up">
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="flex items-center gap-1 text-xs font-bold text-brand-500 uppercase tracking-wider">
              <Trophy size={12} /> Contest Arena
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">All Live Contests</h1>
            <p className="text-sm text-gray-500 mt-1">Track upcoming LeetCode and CodeChef contests in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors no-underline">
              <ArrowLeft size={15} /> Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => loadContests(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? 'icon-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">{error}</div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 text-sm">
          Loading contests...
        </div>
      ) : contests.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contests.map((contest) => (
            <ContestCountdown key={`${contest.platform}-${contest.name}-${contest.scheduled_at}`} contest={contest} />
          ))}
        </section>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500 text-sm">
          No contests available right now.
        </div>
      )}
    </div>
  );
};

export default Contests;
