import { exec } from "child_process";
import os from "os";

function run(command) {
  return new Promise((resolve) => {
    exec(command, { timeout: 8000 }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
}

/**
 * Lists connected USB/peripheral devices.
 *
 * Windows: PowerShell Get-PnpDevice filtered to the USB class.
 * macOS: `system_profiler SPUSBDataType` (raw text, same caveat as display
 *   check — machine-parsing it reliably needs per-version handling).
 * Linux: `lsusb`, part of usbutils — may not be installed by default on
 *   every distro.
 *
 * NOTE: only syntax-checked here, not run against real devices on each OS.
 */
export async function getPeripheralInfo() {
  const platform = os.platform();

  if (platform === "win32") {
    const { error, stdout } = await run(
      'powershell -NoProfile -Command "Get-PnpDevice -Class USB | Select-Object FriendlyName,Status | ConvertTo-Json"'
    );

    if (error) {
      return {
        success: false,
        platform,
        error: "Could not query USB devices via PowerShell (Get-PnpDevice).",
      };
    }

    try {
      const parsed = JSON.parse(stdout || "[]");
      const devices = Array.isArray(parsed) ? parsed : [parsed];
      return {
        success: true,
        platform,
        devices: devices.map((d) => ({
          name: d.FriendlyName,
          status: d.Status,
        })),
      };
    } catch {
      return { success: true, platform, devices: [], raw: stdout };
    }
  }

  if (platform === "darwin") {
    const { error, stdout } = await run("system_profiler SPUSBDataType");
    if (error) {
      return { success: false, platform, error: "Could not query USB devices via system_profiler." };
    }
    return { success: true, platform, raw: stdout };
  }

  // Linux
  const { error, stdout } = await run("lsusb");
  if (error) {
    return {
      success: false,
      platform,
      error: "Could not query USB devices via lsusb. Is the `usbutils` package installed?",
    };
  }

  const devices = stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      // e.g. "Bus 001 Device 004: ID 046d:c52b Logitech, Inc. Unifying Receiver"
      const match = line.match(/ID (\S+) (.+)$/);
      return { id: match?.[1] ?? null, name: match?.[2] ?? line.trim() };
    });

  return { success: true, platform, devices };
}
