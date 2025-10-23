import { useEffect, useRef, useState } from 'react';

// Subscribe to SSE price stream for given symbols. Returns a map: { [symbol]: { price, change, changePercent, timestamp, name } }
export default function usePriceStream(symbols) {
  const [quotes, setQuotes] = useState({});
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) {
      return;
    }

    // Close any existing stream before opening a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const params = new URLSearchParams({ symbols: symbols.join(',') });
    // Use absolute URL to avoid issues with Vite proxy when using EventSource
    const url = `${window.location.protocol}//${window.location.hostname}:3001/api/stream/prices?${params.toString()}`;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (payload && payload.type === 'quotes' && Array.isArray(payload.quotes)) {
          const next = { ...quotes };
          payload.quotes.forEach(q => {
            next[q.symbol] = q;
          });
          setQuotes(next);
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    es.addEventListener('error', () => {
      // Connection errors are expected occasionally; let it auto-reconnect
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(symbols) ? symbols.join(',') : symbols]);

  return quotes;
}
