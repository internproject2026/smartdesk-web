import "dotenv/config";
import express from "express";
import cors from "cors";

import { getNetworkInfo, pingHost } from "./checks/network.js";
import { checkDNS, getArpTable } from "./checks/dnsArp.js";
import { getLinkLayerInfo } from "./checks/linkLayer.js";
import { getPrinterStatus } from "./checks/printer.js";
import { getDisplayInfo } from "./checks/display.js";
import { getPeripheralInfo } from "./checks/peripheral.js";
import { getAIResponse } from "./services/aiAssistant.js";
import { compressPayload, decompressPayload } from "./services/compression.js";
import {
  getDb,
  getCategoriesFromDb,
  getStepsForCategoryFromDb,
  insertDiagnosticLog,
} from "./data/db.js";

const app = express();
const PORT = process.env.PORT || 3000;
const db = getDb();

app.use(cors());
app.use(express.json());
// Raw body support for the gzip-compressed sync endpoint.
app.use("/api/sync-logs", express.raw({ type: "application/octet-stream", limit: "5mb" }));

// --- Health -----------------------------------------------------------

/** Liveness check the frontend's heartbeat hook polls. */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// --- Live diagnostic checks --------------------------------------------

app.get("/api/network-info", (req, res) => {
  try {
    res.json({ success: true, ...getNetworkInfo() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/ping", async (req, res) => {
  const result = await pingHost();
  res.json(result);
});

app.get("/api/dns-check", async (req, res) => {
  const hostname = req.query.hostname || "google.com";
  const result = await checkDNS(hostname);
  res.json(result);
});

app.get("/api/arp-table", async (req, res) => {
  try {
    res.json(await getArpTable());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/link-layer", async (req, res) => {
  try {
    res.json(await getLinkLayerInfo());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/printer-check", async (req, res) => {
  try {
    res.json(await getPrinterStatus());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/display-check", async (req, res) => {
  try {
    res.json(await getDisplayInfo());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/peripheral-check", async (req, res) => {
  try {
    res.json(await getPeripheralInfo());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- AI Assistant (hybrid online layer) ---------------------------------

app.post("/api/ai-assistant", async (req, res) => {
  const { question } = req.body ?? {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ success: false, error: "Missing 'question' in request body." });
  }

  try {
    const answer = await getAIResponse(question);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

// --- Knowledge base (now backed by SQLite, see server/data/db.js) -------

app.get("/api/categories", (req, res) => {
  res.json({ success: true, categories: getCategoriesFromDb(db) });
});

app.get("/api/troubleshooting-steps/:categoryId", (req, res) => {
  res.json({ success: true, steps: getStepsForCategoryFromDb(db, req.params.categoryId) });
});

// --- Offline log sync (compressed) ---------------------------------------

/**
 * Accepts a gzip-compressed JSON body (raw bytes, not parsed by
 * express.json) containing an array of queued diagnostic log entries the
 * frontend accumulated while offline. Decompresses, stores each entry,
 * and reports how much the compression saved — useful for confirming
 * this is actually doing something on real queued data.
 */
app.post("/api/sync-logs", async (req, res) => {
  try {
    const entries = await decompressPayload(req.body);
    if (!Array.isArray(entries)) {
      return res.status(400).json({ success: false, error: "Expected a decompressed array of log entries." });
    }

    for (const entry of entries) {
      insertDiagnosticLog(db, entry);
    }

    res.json({ success: true, stored: entries.length });
  } catch (error) {
    res.status(400).json({ success: false, error: "Could not decompress or store log payload: " + error.message });
  }
});

/**
 * Utility endpoint mainly for testing/demoing the compression module
 * directly — compresses whatever JSON body is sent and reports the
 * before/after byte sizes.
 */
app.post("/api/compress-test", express.json(), async (req, res) => {
  const { compressed, originalBytes, compressedBytes } = await compressPayload(req.body);
  res.json({
    success: true,
    originalBytes,
    compressedBytes,
    savedPercent: Math.round((1 - compressedBytes / originalBytes) * 100),
    compressedBase64: compressed.toString("base64"),
  });
});

app.listen(PORT, () => {
  console.log(`SmartDesk backend running on http://localhost:${PORT}`);
});
