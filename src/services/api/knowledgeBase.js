import { getJson } from "./client";
import { getCache, setCache } from "../offline/indexedDb.js";

/**
 * Real problem-category and troubleshooting-step data, now served from
 * the backend (server/data/*.js) instead of being hardcoded arrays in
 * src/services/mock/*.js.
 *
 * Same offline-first pattern the mock versions used: when online, fetch
 * from the backend and cache the result to IndexedDB; when offline, read
 * straight from that cache. The function signatures are unchanged from
 * the mock versions on purpose, so Dashboard/ProblemCategory/
 * TroubleshootingFlow didn't need any logic changes beyond the import path.
 */

export async function fetchProblemCategories() {
  const cacheKey = "categories";

  if (navigator.onLine) {
    try {
      const data = await getJson("/categories");
      await setCache(cacheKey, data.categories);
      return data.categories;
    } catch {
      // Backend unreachable even though the browser reports online —
      // fall back to cache rather than showing nothing.
    }
  }

  const cached = await getCache(cacheKey);
  return cached ?? [];
}

export async function fetchTroubleshootingSteps(categoryId) {
  const cacheKey = `steps:${categoryId}`;

  if (navigator.onLine) {
    try {
      const data = await getJson(`/troubleshooting-steps/${categoryId}`);
      await setCache(cacheKey, data.steps);
      return data.steps;
    } catch {
      // Same fallback reasoning as above.
    }
  }

  const cached = await getCache(cacheKey);
  return cached ?? [];
}
