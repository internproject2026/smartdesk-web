/**
 * Troubleshooting step data, now served from the backend instead of being
 * hardcoded in the frontend (src/services/mock/troubleshootingSteps.js).
 *
 * The `type: 'live-check'` steps tell the frontend to render a live
 * diagnostic component (e.g. LiveNetworkCheck) instead of static text —
 * those components call the /api/*-check endpoints below directly.
 */
export const STEPS_BY_CATEGORY = {
  network: [
    { id: "net-1", title: "Check the physical connection", instruction: "Confirm the Ethernet cable is firmly plugged in, or that Wi-Fi is toggled on.", image: null },
    { id: "net-2", title: "Restart your network adapter", instruction: "Open Network Settings, disable the adapter, wait 5 seconds, then re-enable it.", image: null },
    { id: "net-3", title: "Run a live network check", instruction: "This runs a real check against your machine via the local SmartDesk backend, instead of just asking you to look.", image: null, type: "live-check" },
    { id: "net-4", title: "Run the built-in network troubleshooter", instruction: "Use your OS network diagnostic tool to detect common configuration issues.", image: null },
  ],
  printer: [
    { id: "print-1", title: "Check the printer is powered on", instruction: "Confirm the printer display is lit and there are no error lights blinking.", image: null },
    { id: "print-2", title: "Run a live printer check", instruction: "Checks installed printers and their status via the local SmartDesk backend.", image: null, type: "live-printer-check" },
    { id: "print-3", title: "Clear the print queue", instruction: "Open the print queue and cancel any stuck jobs before retrying.", image: null },
    { id: "print-4", title: "Restart the print spooler service", instruction: "Restart the Print Spooler service from your OS services panel.", image: null },
  ],
  display: [
    { id: "disp-1", title: "Check the cable connection", instruction: "Ensure the HDMI/DisplayPort cable is fully seated at both ends.", image: null },
    { id: "disp-2", title: "Run a live display check", instruction: "Checks connected displays and current resolution via the local SmartDesk backend.", image: null, type: "live-display-check" },
    { id: "disp-3", title: "Verify the input source", instruction: "Use the monitor menu to confirm it is set to the correct input source.", image: null },
  ],
  peripheral: [
    { id: "periph-1", title: "Try a different USB port", instruction: "Unplug the device and connect it to a different USB port directly on the machine.", image: null },
    { id: "periph-2", title: "Run a live peripheral check", instruction: "Lists connected USB devices via the local SmartDesk backend.", image: null, type: "live-peripheral-check" },
    { id: "periph-3", title: "Check Device Manager", instruction: "Look for a yellow warning icon next to the device and update or reinstall its driver.", image: null },
  ],
};
