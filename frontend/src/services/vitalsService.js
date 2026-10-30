// Native Zero-Dependency Web Vitals & Client Latency Reporter
// Measures LCP, INP/FID, CLS, FCP, TTFB natively via browser PerformanceObserver

let initialized = false;

export const initClientPerformanceMonitoring = (apiBaseUrl) => {
  if (initialized || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }
  initialized = true;

  const reportVital = (name, value, rating = 'good') => {
    try {
      const payload = JSON.stringify({
        name,
        value: Math.round(value * 100) / 100,
        rating,
        path: window.location.pathname,
      });

      const endpoint = `${apiBaseUrl || '/api'}/performance/vitals`.replace(/([^:]\/)\/+/g, '$1');

      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking
    }
  };

  try {
    // 1. Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime;
        const rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
        reportVital('LCP', value, rating);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 2. Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      const rating = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor';
      reportVital('CLS', clsValue, rating);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 3. First Contentful Paint (FCP)
    const paintObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const rating = entry.startTime <= 1800 ? 'good' : entry.startTime <= 3000 ? 'needs-improvement' : 'poor';
          reportVital('FCP', entry.startTime, rating);
        }
      }
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    // 4. Time To First Byte (TTFB) & DOM Navigation Latency
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        if (navEntry) {
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          if (ttfb > 0) {
            const rating = ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor';
            reportVital('TTFB', ttfb, rating);
          }
        }
      }, 0);
    });

    // 5. First Input Delay (FID) / INP
    const fidObserver = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0];
      if (firstInput) {
        const delay = firstInput.processingStart - firstInput.startTime;
        const rating = delay <= 100 ? 'good' : delay <= 300 ? 'needs-improvement' : 'poor';
        reportVital('INP', delay, rating);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (err) {
    console.debug('[Vitals] PerformanceObserver initialization skipped:', err.message);
  }
};
