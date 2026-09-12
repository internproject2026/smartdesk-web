import { useCallback, useEffect, useState } from 'react';
import { syncCompressedLogs } from '../services/api/syncLogs';

const STORAGE_KEY = 'smartdesk-history';
const PENDING_SYNC_KEY = 'smartdesk-pending-sync';

/**
 * Diagnostic session history, backed by localStorage for now.
 *
 * NOTE: this is a placeholder persistence layer. The proposal specifies
 * IndexedDB for the offline knowledge/data engine — when that's built,
 * this hook's internals should move to IndexedDB, but the addEntry/entries
 * API here can stay the same so callers (TroubleshootingFlow, History page)
 * don't need to change.
 *
 * New: entries are also queued for sync (PENDING_SYNC_KEY). When the
 * backend becomes reachable, syncPendingEntries() gzip-compresses the
 * queue and sends it to /api/sync-logs in one request, then clears the
 * queue — this is the frontend half of the proposal's "Data Compression
 * & Sync" requirement for offline log transmission.
 */
function readHistory() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readPending() {
  try {
    const raw = window.localStorage.getItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useDiagnosticHistory() {
  const [entries, setEntries] = useState(readHistory);
  const [pendingCount, setPendingCount] = useState(() => readPending().length);

    const addEntry = useCallback((entry) => {
    const fullEntry = { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() };

    const nextHistory = [fullEntry, ...readHistory()].slice(0, 50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
    setEntries(nextHistory);

    const pending = [...readPending(), fullEntry];
    window.localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
    setPendingCount(pending.length);
  }, []);

  const clearHistory = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  const syncPendingEntries = useCallback(async () => {
    const pending = readPending();
    if (pending.length === 0) return null;

    const result = await syncCompressedLogs(pending);
    window.localStorage.removeItem(PENDING_SYNC_KEY);
    setPendingCount(0);
    return result;
  }, []);

  // Best-effort auto-sync shortly after mount if there's anything queued
  // and the browser reports it's online. If the backend isn't actually
  // reachable this just fails silently — the queue stays intact and the
  // next reconnect (or manual sync) will retry it.
  useEffect(() => {
    if (pendingCount === 0 || !navigator.onLine) return;
    syncPendingEntries().catch(() => {
      // Left in the queue for a later retry — no action needed here.
    });
    // Only run this on mount; further syncs are triggered by callers
    // (e.g. when the heartbeat hook reports the backend just came back).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { entries, addEntry, clearHistory, pendingCount, syncPendingEntries };
}
