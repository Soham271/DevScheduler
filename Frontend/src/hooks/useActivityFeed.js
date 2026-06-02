import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';

const API_BASE = 'http://localhost:8080';


export function useActivityFeed(limit = 20) {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const eventSourceRef = useRef(null);

  
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getActivities(0, limit);
      setActivities(data.activities || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('[ActivityFeed] Failed to fetch initial activities:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  
  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const offset = activities.length;
      const data = await api.getActivities(offset, limit);
      const newItems = data.activities || [];
      if (newItems.length > 0) {
        setActivities(prev => [...prev, ...newItems]);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('[ActivityFeed] Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [activities.length, limit, loadingMore]);

  
  const markAsRead = useCallback(async (id) => {
    try {
      await api.markActivityRead(id);
      setActivities(prev =>
        prev.map(a => (a.id === id ? { ...a, read: true } : a))
      );
    } catch (err) {
      console.error('[ActivityFeed] Failed to mark as read:', err);
    }
  }, []);

  
  const clearAll = useCallback(async () => {
    try {
      await api.clearActivities();
      setActivities([]);
      setTotal(0);
    } catch (err) {
      console.error('[ActivityFeed] Failed to clear:', err);
    }
  }, []);

  
  useEffect(() => {
    fetchInitial();

    
    const es = new EventSource(`${API_BASE}/activities/stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const activity = JSON.parse(event.data);
        
        setActivities(prev => [activity, ...prev]);
        setTotal(prev => prev + 1);
      } catch (err) {
        console.error('[ActivityFeed] Failed to parse SSE event:', err);
      }
    };

    es.onerror = () => {
      console.warn('[ActivityFeed] SSE connection error — will auto-reconnect');
    };

    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [fetchInitial]);

  
  const unreadCount = activities.filter(a => !a.read).length;
  const hasMore = activities.length < total;

  return {
    activities,
    unreadCount,
    total,
    loading,
    loadingMore,
    hasMore,
    markAsRead,
    clearAll,
    loadMore,
    refresh: fetchInitial,
  };
}
