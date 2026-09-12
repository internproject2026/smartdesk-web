import { getCache, setCache } from '../offline/indexedDb.js';

/**
 * Mock step-by-step troubleshooting content, keyed by category id.
 * This stands in for the "offline rule engine" — in the real system this
 * data would come from the local IndexedDB/SQLite knowledge base built by
 * the backend team, not be hardcoded here.
 */
const STEPS_BY_CATEGORY = {
  network: [
    { id: 'net-1', title: 'Check the physical connection', instruction: 'Confirm the Ethernet cable is firmly plugged in, or that Wi-Fi is toggled on.', image: null },
    { id: 'net-2', title: 'Restart your network adapter', instruction: 'Open Network Settings, disable the adapter, wait 5 seconds, then re-enable it.', image: null },
    {
      id: 'net-3',
      title: 'Run a live network check',
      instruction: 'This runs a real check against your machine via the local SmartDesk backend, instead of just asking you to look.',
      image: null,
      type: 'live-check',
    },
    { id: 'net-4', title: 'Run the built-in network troubleshooter', instruction: 'Use your OS network diagnostic tool to detect common configuration issues.', image: null },
  ],
  printer: [
    { id: 'print-1', title: 'Check the printer is powered on', instruction: 'Confirm the printer display is lit and there are no error lights blinking.', image: null },
    { id: 'print-2', title: 'Clear the print queue', instruction: 'Open the print queue and cancel any stuck jobs before retrying.', image: null },
    { id: 'print-3', title: 'Restart the print spooler service', instruction: 'Restart the Print Spooler service from your OS services panel.', image: null },
  ],
  display: [
    { id: 'disp-1', title: 'Check the cable connection', instruction: 'Ensure the HDMI/DisplayPort cable is fully seated at both ends.', image: null },
    { id: 'disp-2', title: 'Verify the input source', instruction: 'Use the monitor menu to confirm it is set to the correct input source.', image: null },
  ],
  peripheral: [
    { id: 'periph-1', title: 'Try a different USB port', instruction: 'Unplug the device and connect it to a different USB port directly on the machine.', image: null },
    { id: 'periph-2', title: 'Check Device Manager', instruction: 'Look for a yellow warning icon next to the device and update or reinstall its driver.', image: null },
  ],
};

/**
 * Offline-first, same pattern as fetchProblemCategories: online reads/caches
 * the "network" data, offline reads straight from IndexedDB.
 */
export async function fetchTroubleshootingSteps(categoryId) {
  const cacheKey = `steps:${categoryId}`;

  if (navigator.onLine) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const data = STEPS_BY_CATEGORY[categoryId] ?? [];
    await setCache(cacheKey, data);
    return data;
  }

  const cached = await getCache(cacheKey);
  return cached ?? [];
}
