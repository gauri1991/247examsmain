import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  apiCallsCount: number;
  cacheHitRate: number;
}

interface UsePerformanceMonitorOptions {
  trackMemory?: boolean;
  trackInteractions?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor(
  componentName: string,
  options: UsePerformanceMonitorOptions = {}
) {
  const {
    trackMemory = false,
    trackInteractions = false,
    onMetricsUpdate
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    apiCallsCount: 0,
    cacheHitRate: 0
  });

  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());
  const apiCallsRef = useRef<number>(0);
  const cacheHitsRef = useRef<number>(0);
  const interactionStartRef = useRef<number | null>(null);

  // Performance observer for measuring render time
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes(componentName)) {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });

      // Mark the start of component render
      performance.mark(`${componentName}-render-start`);

      return () => {
        observer.disconnect();
        // Mark the end of component render
        performance.mark(`${componentName}-render-end`);
        try {
          performance.measure(
            `${componentName}-render`,
            `${componentName}-render-start`,
            `${componentName}-render-end`
          );
        } catch (error) {
          console.warn('Performance measurement failed:', error);
        }
      };
    }
  }, [componentName]);

  // Track component load time
  useEffect(() => {
    const loadTime = Date.now() - startTimeRef.current;
    setMetrics(prev => ({ ...prev, loadTime }));
  }, []);

  // Track memory usage
  useEffect(() => {
    if (trackMemory && 'memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory?.usedJSHeapSize || 0
        }));
      };

      updateMemory();
      const interval = setInterval(updateMemory, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [trackMemory]);

  // Track user interactions
  useEffect(() => {
    if (!trackInteractions) return;

    const handleInteractionStart = () => {
      interactionStartRef.current = Date.now();
    };

    const handleInteractionEnd = () => {
      if (interactionStartRef.current) {
        const interactionTime = Date.now() - interactionStartRef.current;
        setMetrics(prev => ({ ...prev, interactionTime }));
        interactionStartRef.current = null;
      }
    };

    const events = ['click', 'keydown', 'touchstart'];
    const endEvents = ['click', 'keyup', 'touchend'];

    events.forEach(event => {
      document.addEventListener(event, handleInteractionStart, { passive: true });
    });

    endEvents.forEach(event => {
      document.addEventListener(event, handleInteractionEnd, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteractionStart);
      });
      endEvents.forEach(event => {
        document.removeEventListener(event, handleInteractionEnd);
      });
    };
  }, [trackInteractions]);

  // API call tracking methods
  const trackApiCall = useCallback(() => {
    apiCallsRef.current += 1;
    setMetrics(prev => ({ ...prev, apiCallsCount: apiCallsRef.current }));
  }, []);

  const trackCacheHit = useCallback(() => {
    cacheHitsRef.current += 1;
    const cacheHitRate = apiCallsRef.current > 0 
      ? (cacheHitsRef.current / apiCallsRef.current) * 100 
      : 0;
    setMetrics(prev => ({ ...prev, cacheHitRate }));
  }, []);

  // Report metrics when they update
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Web Vitals monitoring
  const measureWebVitals = () => {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`${componentName} LCP:`, lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        console.warn('LCP observation failed:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          console.log(`${componentName} CLS:`, clsValue);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (error) {
        console.warn('CLS observation failed:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fid = entry.processingStart - entry.startTime;
            console.log(`${componentName} FID:`, fid);
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (error) {
        console.warn('FID observation failed:', error);
      }
    }
  };

  // Resource timing analysis
  const analyzeResourceTiming = () => {
    if (performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn(`${componentName} slow resources:`, slowResources);
      }

      return {
        totalResources: resources.length,
        slowResources: slowResources.length,
        averageLoadTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length
      };
    }
    return null;
  };

  return {
    metrics,
    trackApiCall,
    trackCacheHit,
    measureWebVitals,
    analyzeResourceTiming,
    resetMetrics: () => {
      apiCallsRef.current = 0;
      cacheHitsRef.current = 0;
      setMetrics({
        loadTime: 0,
        renderTime: 0,
        interactionTime: 0,
        apiCallsCount: 0,
        cacheHitRate: 0
      });
    }
  };
}

// Global performance tracking
class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  
  updateMetrics(componentName: string, metrics: PerformanceMetrics) {
    this.metrics.set(componentName, metrics);
  }
  
  getMetrics(componentName?: string) {
    if (componentName) {
      return this.metrics.get(componentName);
    }
    return Object.fromEntries(this.metrics);
  }
  
  getSlowComponents(threshold = 1000) {
    const slow: string[] = [];
    this.metrics.forEach((metrics, name) => {
      if (metrics.loadTime > threshold || metrics.renderTime > threshold) {
        slow.push(name);
      }
    });
    return slow;
  }
  
  generateReport() {
    const report = {
      totalComponents: this.metrics.size,
      slowComponents: this.getSlowComponents(),
      averageLoadTime: 0,
      averageRenderTime: 0,
      totalApiCalls: 0,
      averageCacheHitRate: 0
    };
    
    const values = Array.from(this.metrics.values());
    if (values.length > 0) {
      report.averageLoadTime = values.reduce((sum, m) => sum + m.loadTime, 0) / values.length;
      report.averageRenderTime = values.reduce((sum, m) => sum + m.renderTime, 0) / values.length;
      report.totalApiCalls = values.reduce((sum, m) => sum + m.apiCallsCount, 0);
      report.averageCacheHitRate = values.reduce((sum, m) => sum + m.cacheHitRate, 0) / values.length;
    }
    
    return report;
  }
  
  clear() {
    this.metrics.clear();
  }
}

export const globalPerformanceTracker = new PerformanceTracker();