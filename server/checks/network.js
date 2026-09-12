import { exec } from "child_process";
import os from "os";

/**
 * Reads real network adapter info via Node's built-in os.networkInterfaces()
 * — works identically on Windows, macOS, and Linux, unlike parsing
 * `ipconfig` output (Windows-only).
 */
export function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const adapters = [];
  let hasValidIP = false;

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs ?? []) {
      if (addr.family === "IPv4") {
        const isLoopback = addr.address === "127.0.0.1";
        const isLinkLocal = addr.address.startsWith("169.254.");

        adapters.push({
          adapter: name,
          address: addr.address,
          internal: addr.internal,
        });

        if (!isLoopback && !isLinkLocal && !addr.internal) {
          hasValidIP = true;
        }
      }
    }
  }

  return { hasValidIP, adapters };
}

/**
 * Pings a public host to check for real internet reachability. The `ping`
 * command's flags differ between Windows and POSIX systems.
 */
export function pingHost(host = "8.8.8.8") {
  return new Promise((resolve) => {
    const isWindows = os.platform() === "win32";
    const command = isWindows ? `ping -n 4 ${host}` : `ping -c 4 ${host}`;

    exec(command, { timeout: 8000 }, (error, stdout) => {
      resolve({ success: !error, output: stdout });
    });
  });
}
