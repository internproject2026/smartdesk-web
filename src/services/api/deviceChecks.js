import { getJson } from "./client";

/**
 * Live diagnostic checks for printer, display, and peripheral hardware,
 * matching the same "run a real check" pattern as the network check —
 * see server/checks/*.js for what each one actually inspects on the host
 * machine, and the caveats about which platforms are tested.
 */

export async function fetchPrinterCheck() {
  return getJson("/printer-check");
}

export async function fetchDisplayCheck() {
  return getJson("/display-check");
}

export async function fetchPeripheralCheck() {
  return getJson("/peripheral-check");
}
