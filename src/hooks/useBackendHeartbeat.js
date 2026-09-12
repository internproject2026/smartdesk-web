import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api/networkApi";

const POLL_INTERVAL_MS = 10000;

/**
 * Polls the local backend's /api/health endpoint on an interval.
 *
 * This is the piece useOnlineStatus's own comment called out as missing:
 * navigator.onLine only reflects whether a network interface is "up," not
 * whether our actual backend is reachable. Combining this with
 * useOnlineStatus gives the three-state signal the proposal's hybrid
 * routing logic (R(q, C)) needs: fully online (browser + backend both
 * reachable), backend-only (offline internet but local backend running),
 * or fully offline.
 */
export function useBackendHeartbeat() {
  const [isReachable, setIsReachable] = useState(null); // null = not checked yet

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const reachable = await checkBackendHealth();
      if (!cancelled) setIsReachable(reachable);
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return isReachable;
}
