import { exec } from "child_process";
import dns from "dns";
import os from "os";

function run(command) {
  return new Promise((resolve) => {
    exec(command, { timeout: 8000 }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
}

/**
 * Resolves a hostname to check DNS is working — separate from the ping
 * check, since a machine can have a valid IP and even reach an IP
 * directly while DNS resolution itself is broken (a very common real
 * support scenario: "the internet is down" when actually just DNS is).
 *
 * Uses Node's built-in `dns` module (dns.resolve4), which is genuinely
 * cross-platform — no OS-specific command needed here, unlike most of
 * the other checks in this project.
 */
export function checkDNS(hostname = "google.com") {
  return new Promise((resolve) => {
    const start = Date.now();
    dns.resolve4(hostname, (error, addresses) => {
      if (error) {
        resolve({
          success: false,
          hostname,
          error: error.code ?? error.message,
        });
        return;
      }
      resolve({
        success: true,
        hostname,
        addresses,
        durationMs: Date.now() - start,
      });
    });
  });
}

/**
 * Reads the local ARP table — the mapping of IP addresses to MAC
 * addresses that the OS has recently discovered on the local network.
 * Useful for diagnosing local-network-only issues (e.g. can the machine
 * see its own router / other devices on the LAN at the hardware level),
 * as distinct from internet-reachability, which the ping/DNS checks cover.
 *
 * Windows and macOS/Linux both ship an `arp -a` command with a similar
 * (but not identical) output format, so this uses one command with two
 * parsers.
 *
 * NOTE: only syntax-checked here, not run on real Windows/macOS/Linux
 * machines — arp table format can vary slightly by OS version.
 */
export async function getArpTable() {
  const platform = os.platform();
  const { error, stdout } = await run("arp -a");

  if (error) {
    return {
      success: false,
      platform,
      error: "Could not read the ARP table. Is `arp` available on this system?",
    };
  }

  const entries =
    platform === "win32" ? parseWindowsArp(stdout) : parseUnixArp(stdout);

  return { success: true, platform, entries };
}

function parseWindowsArp(output) {
  // Windows `arp -a` lines look like:
  //   192.168.1.1          00-14-22-01-23-45     dynamic
  const entries = [];
  for (const line of output.split("\n")) {
    const match = line.trim().match(/^(\d+\.\d+\.\d+\.\d+)\s+([\w-]+)\s+(\w+)/);
    if (match) {
      entries.push({ ip: match[1], mac: match[2], type: match[3] });
    }
  }
  return entries;
}

function parseUnixArp(output) {
  // macOS/Linux `arp -a` lines look like:
  //   ? (192.168.1.1) at 0:14:22:1:23:45 on en0 ifscope [ethernet]
  const entries = [];
  for (const line of output.split("\n")) {
    const match = line.match(/\(([\d.]+)\)\s+at\s+([\w:]+)/);
    if (match) {
      entries.push({ ip: match[1], mac: match[2] });
    }
  }
  return entries;
}
