import { PROBLEM_CATEGORIES } from './problemCategories';

/**
 * Flattens category + step data into one searchable list. This stands in
 * for the real IndexedDB/SQLite full-text index the offline knowledge
 * engine will provide — search itself stays synchronous and local, which
 * is the whole point of "offline-first" search (no network round trip).
 */
const STEPS_BY_CATEGORY = {
  network: [
    { title: 'Check the physical connection', instruction: 'Confirm the Ethernet cable is firmly plugged in, or that Wi-Fi is toggled on.' },
    { title: 'Restart your network adapter', instruction: 'Open Network Settings, disable the adapter, wait 5 seconds, then re-enable it.' },
    { title: 'Run the built-in network troubleshooter', instruction: 'Use your OS network diagnostic tool to detect common configuration issues.' },
  ],
  printer: [
    { title: 'Check the printer is powered on', instruction: 'Confirm the printer display is lit and there are no error lights blinking.' },
    { title: 'Clear the print queue', instruction: 'Open the print queue and cancel any stuck jobs before retrying.' },
    { title: 'Restart the print spooler service', instruction: 'Restart the Print Spooler service from your OS services panel.' },
  ],
  display: [
    { title: 'Check the cable connection', instruction: 'Ensure the HDMI/DisplayPort cable is fully seated at both ends.' },
    { title: 'Verify the input source', instruction: 'Use the monitor menu to confirm it is set to the correct input source.' },
  ],
  peripheral: [
    { title: 'Try a different USB port', instruction: 'Unplug the device and connect it to a different USB port directly on the machine.' },
    { title: 'Check Device Manager', instruction: 'Look for a yellow warning icon next to the device and update or reinstall its driver.' },
  ],
};

const SEARCH_INDEX = PROBLEM_CATEGORIES.flatMap((category) =>
  (STEPS_BY_CATEGORY[category.id] ?? []).map((step) => ({
    categoryId: category.id,
    categoryLabel: category.label,
    title: step.title,
    snippet: step.instruction,
  }))
);

/**
 * Synchronous local search — no fake delay, since real offline search
 * shouldn't feel network-bound. Matches against title, snippet, and
 * category label, case-insensitive.
 */
export function searchKnowledgeBase(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return SEARCH_INDEX.filter(
    (entry) =>
      entry.title.toLowerCase().includes(q) ||
      entry.snippet.toLowerCase().includes(q) ||
      entry.categoryLabel.toLowerCase().includes(q)
  );
}
