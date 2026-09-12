import { getJson } from "./client";

/**
 * Real network diagnostics, talking to the local Express backend
 * (server/index.js). This is the "active local hardware/network probe
 * layer" from the project proposal.
 */

/** Checks whether the backend process itself is reachable. */
export async function checkBackendHealth() {
  try {
    await getJson("/health");
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetches the machine's real network adapter info and whether any
 * adapter has a valid (non-loopback, non-link-local) IPv4 address.
 */
export async function fetchNetworkInfo() {
  return getJson("/network-info");
}

/** Pings a public host (8.8.8.8) to check for real internet reachability. */
export async function pingInternet() {
  return getJson("/ping");
}
