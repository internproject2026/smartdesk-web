import { env } from "../../config/env";

/** Shared fetch helpers for talking to the local Express backend. */

export async function getJson(path) {
  const response = await fetch(`${env.apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

export async function postJson(path, body) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error ?? `Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}
