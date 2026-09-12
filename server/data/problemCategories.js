/**
 * Problem category data, now served from the backend instead of being
 * hardcoded in the frontend (src/services/mock/problemCategories.js).
 * This is the "offline knowledge engine" data source the proposal
 * describes — eventually this could move to SQLite, but a JS module is a
 * fine starting point since the shape callers depend on won't change.
 */
export const PROBLEM_CATEGORIES = [
  {
    id: "network",
    label: "Network",
    description: "Wi-Fi drops, no internet access, VPN failures, slow connections.",
    icon: "network",
    issueCount: 12,
  },
  {
    id: "printer",
    label: "Printer",
    description: "Spooler hangs, offline printers, print jobs stuck in queue.",
    icon: "printer",
    issueCount: 8,
  },
  {
    id: "display",
    label: "Display",
    description: "Resolution errors, no signal, multi-monitor setup issues.",
    icon: "display",
    issueCount: 6,
  },
  {
    id: "peripheral",
    label: "Peripheral",
    description: "Keyboard, mouse, webcam, or USB device not detected.",
    icon: "peripheral",
    issueCount: 9,
  },
];
