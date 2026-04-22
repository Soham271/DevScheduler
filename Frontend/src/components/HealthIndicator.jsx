import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const HealthIndicator = () => {
  const [status, setStatus] = useState('checking');

  const check = useCallback(async () => {
    try { await api.checkHealth(); setStatus('online'); } catch { setStatus('offline'); }
  }, []);

  useEffect(() => { check(); const id = setInterval(check, 30000); return () => clearInterval(id); }, [check]);

  const dotClass = status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_theme(colors.emerald.400)]' :
    status === 'offline' ? 'bg-red-400 shadow-[0_0_8px_theme(colors.red.400)]' : 'bg-gray-300 animate-pulse';
  const labelClass = status === 'online' ? 'text-emerald-600' : status === 'offline' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold" title={`Backend: ${status}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      <span className={labelClass}>{status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : '...'}</span>
    </div>
  );
};

export default HealthIndicator;
