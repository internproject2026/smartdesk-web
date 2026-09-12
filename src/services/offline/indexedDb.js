const DB_NAME = 'smartdesk-db';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

/**
 * Opens (and lazily creates) the IndexedDB database used to cache
 * knowledge-base data for offline access. This is the real persistence
 * layer the proposal specifies — localStorage (used for History) is fine
 * for small session logs, but IndexedDB is the right tool for the larger,
 * structured troubleshooting content.
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Reads a cached value by key. Resolves to `undefined` if not present. */
export async function getCache(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value);
    request.onerror = () => reject(request.error);
  });
}

/** Writes a value under the given key, overwriting any existing entry. */
export async function setCache(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
