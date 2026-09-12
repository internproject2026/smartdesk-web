import { useEffect, useState } from 'react';

/**
 * Tracks connectivity using the browser's online/offline events.
 *
 * Note: `navigator.onLine` only reflects whether the device has a network
 * interface that's "up" — it does NOT guarantee the backend/API is actually
 * reachable. Later (API integration phase) we'll layer a lightweight
 * heartbeat check on top of this for a truer "is our backend reachable"
 * signal. For Phase 1 this is a reasonable, honest starting point.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
