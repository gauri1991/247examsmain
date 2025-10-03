import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '@/lib/api';
import { showErrorToast } from '@/lib/error-handler';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

interface UseOptimizedDataOptions {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  retries?: number;
  debounceMs?: number;
  dependencies?: any[];
  enabled?: boolean;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, duration: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + duration
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
  
  size() {
    return this.cache.size;
  }
}

const globalCache = new DataCache();

export function useOptimizedData<T>(
  endpoint: string,
  options: UseOptimizedDataOptions = {}
) {
  const {
    cacheKey = endpoint,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    retries = 2,
    debounceMs = 300,
    dependencies = [],
    enabled = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check cache first
    if (!force) {
      const cached = globalCache.get<T>(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        setError(null);
        return cached;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await apiRequest(endpoint, {
        retries,
        signal: abortControllerRef.current.signal
      });

      const responseData = response as T;

      // Cache the response
      globalCache.set(cacheKey, responseData, cacheDuration);
      
      setData(responseData);
      setLastFetch(Date.now());
      setError(null);
      
      return responseData;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Optimized data fetch error:', err);
        setError(err);
        showErrorToast(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, cacheKey, cacheDuration, retries, enabled]);

  const debouncedFetch = useCallback((force = false) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData(force);
    }, debounceMs);
  }, [fetchData, debounceMs]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    globalCache.clear(cacheKey);
  }, [cacheKey]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    if (enabled) {
      debouncedFetch();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, ...dependencies, debouncedFetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache,
    lastFetch,
    isStale: lastFetch > 0 && Date.now() - lastFetch > cacheDuration
  };
}

// Specialized hooks for common data
export function useDashboardStats(userId?: string) {
  return useOptimizedData('/auth/dashboard/stats/', {
    cacheKey: `dashboard-stats-${userId}`,
    cacheDuration: 2 * 60 * 1000, // 2 minutes
    dependencies: [userId]
  });
}

export function useRecentActivity(userId?: string) {
  return useOptimizedData('/auth/dashboard/activity/', {
    cacheKey: `recent-activity-${userId}`,
    cacheDuration: 1 * 60 * 1000, // 1 minute
    dependencies: [userId]
  });
}

export function useExams(filters?: any) {
  const filterKey = filters ? JSON.stringify(filters) : 'all';
  return useOptimizedData('/exams/exams/', {
    cacheKey: `exams-${filterKey}`,
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    dependencies: [filterKey]
  });
}

export function useExamCategories() {
  return useOptimizedData('/exams/exams/categories/', {
    cacheKey: 'exam-categories',
    cacheDuration: 30 * 60 * 1000, // 30 minutes - categories change rarely
  });
}

export function useTestAttempts(userId?: string) {
  return useOptimizedData('/exams/attempts/', {
    cacheKey: `test-attempts-${userId}`,
    cacheDuration: 30 * 1000, // 30 seconds - frequently updated
    dependencies: [userId]
  });
}

// Cache management utilities
export const cacheUtils = {
  clear: (pattern?: string) => globalCache.clear(pattern),
  size: () => globalCache.size(),
  invalidateUserData: (userId: string) => {
    globalCache.clear(`dashboard-stats-${userId}`);
    globalCache.clear(`recent-activity-${userId}`);
    globalCache.clear(`test-attempts-${userId}`);
  },
  invalidateExamData: () => {
    globalCache.clear('exams-');
    globalCache.clear('exam-categories');
  }
};