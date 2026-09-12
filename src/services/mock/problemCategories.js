/**
 * Mock data standing in for the real diagnostic API (Phase 4).
 *
 * Shape matches what we'll define in the frontend/backend interface
 * contract: id, label, description, icon key, and a rough issue count
 * (useful later for "X common issues" copy on the dashboard).
 */
import { getCache, setCache } from '../offline/indexedDb.js';

const CACHE_KEY = 'categories';

export const PROBLEM_CATEGORIES = [
  {
    id: 'network',
    label: 'Network',
    description: 'Wi-Fi drops, no internet access, VPN failures, slow connections.',
    icon: 'network',
    issueCount: 12,
  },
  {
    id: 'printer',
    label: 'Printer',
    description: 'Spooler hangs, offline printers, print jobs stuck in queue.',
    icon: 'printer',
    issueCount: 8,
  },
  {
    id: 'display',
    label: 'Display',
    description: 'Resolution errors, no signal, multi-monitor setup issues.',
    icon: 'display',
    issueCount: 6,
  },
  {
    id: 'peripheral',
    label: 'Peripheral',
    description: 'Keyboard, mouse, webcam, or USB device not detected.',
    icon: 'peripheral',
    issueCount: 9,
  },
];

/**
 * Simulates an async API call. Swap this implementation for a real
 * fetch() in Phase 4 — every caller already awaits it, so nothing
 * upstream needs to change.
 *
 * Offline-first behavior: when online, "fetches" (simulated) and caches
 * the result to IndexedDB. When offline, reads straight from that cache
 * instead of hitting the network — this is what makes a real page reload
 * with no connection still show real data instead of nothing.
 */
export async function fetchProblemCategories() {
  if (navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await setCache(CACHE_KEY, PROBLEM_CATEGORIES);
    return PROBLEM_CATEGORIES;
  }

  const cached = await getCache(CACHE_KEY);
  return cached ?? [];
}
