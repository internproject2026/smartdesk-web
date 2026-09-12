import { env } from "../../config/env";

/**
 * Compresses an array of diagnostic log entries with gzip and sends them
 * to the backend's /api/sync-logs endpoint as raw bytes — the frontend
 * half of the proposal's "Data Compression & Sync" requirement.
 *
 * Uses the browser's built-in CompressionStream API (supported in all
 * current major browsers) rather than adding a JS gzip library — one
 * less dependency, and it does the same job.
 */
export async function syncCompressedLogs(entries) {
  const json = JSON.stringify(entries);
  const jsonBytes = new TextEncoder().encode(json);

  const compressedStream = new Blob([jsonBytes])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  const compressedBuffer = await new Response(compressedStream).arrayBuffer();

  const response = await fetch(`${env.apiBaseUrl}/sync-logs`, {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: compressedBuffer,
  });

  if (!response.ok) {
    throw new Error(`Log sync failed with status ${response.status}`);
  }

  return {
    ...(await response.json()),
    originalBytes: jsonBytes.length,
    compressedBytes: compressedBuffer.byteLength,
  };
}
