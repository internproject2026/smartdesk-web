import { gzip, gunzip } from "zlib";
import { promisify } from "util";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Compresses a JSON-serializable object into a gzip buffer, and decompresses
 * it back. This is the "Data Compression & Sync" piece from the proposal —
 * optimizing offline log queue transmission before syncing to the server.
 *
 * The offline frontend queues diagnostic history entries locally
 * (src/hooks/useDiagnosticHistory.js) while offline. When connectivity
 * returns, instead of sending that queue as raw JSON, the frontend can
 * gzip it first — for a queue of many small, repetitive log entries
 * (similar field names, similar values), gzip compression ratios are
 * typically very high, meaningfully reducing sync payload size on
 * reconnect, which matters most on the exact kind of unreliable/limited
 * connection this proposal is designed around.
 */
export async function compressPayload(data) {
  const json = JSON.stringify(data);
  const compressed = await gzipAsync(Buffer.from(json, "utf-8"));
  return {
    compressed,
    originalBytes: Buffer.byteLength(json, "utf-8"),
    compressedBytes: compressed.length,
  };
}

export async function decompressPayload(buffer) {
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString("utf-8"));
}
