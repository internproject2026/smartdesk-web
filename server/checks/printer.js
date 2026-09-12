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
 * Checks installed printers and their status.
 *
 * Windows: uses PowerShell's Get-Printer (the modern replacement for the
 * deprecated `wmic printer` command).
 * macOS/Linux: uses `lpstat -p`, which reads from CUPS — the print system
 * both platforms use.
 *
 * NOTE: this has only been syntax-checked, not run on a real Windows/macOS
 * machine (this dev environment is Linux-only). Test the Windows branch on
 * an actual Windows box before relying on it — PowerShell's ConvertTo-Json
 * output shape can vary slightly across Windows versions.
 */
export async function getPrinterStatus() {
  const platform = os.platform();

  if (platform === "win32") {
    const { error, stdout } = await run(
      'powershell -NoProfile -Command "Get-Printer | Select-Object Name,PrinterStatus,JobCount | ConvertTo-Json"'
    );

    if (error) {
      return {
        success: false,
        platform,
        error: "Could not query printers via PowerShell (Get-Printer).",
      };
    }

    try {
      const parsed = JSON.parse(stdout || "[]");
      const printers = Array.isArray(parsed) ? parsed : [parsed];
      return {
        success: true,
        platform,
        printers: printers.map((p) => ({
          name: p.Name,
          status: p.PrinterStatus,
          jobCount: p.JobCount,
        })),
      };
    } catch {
      return { success: true, platform, printers: [], raw: stdout };
    }
  }

  // macOS / Linux (CUPS)
  const { error, stdout } = await run("lpstat -p");

  if (error) {
    return {
      success: false,
      platform,
      error: "Could not query printers via lpstat. Is CUPS installed and running?",
    };
  }

  const printers = stdout
    .split("\n")
    .filter((line) => line.startsWith("printer "))
    .map((line) => {
      const match = line.match(/^printer (\S+) is (\w+)/);
      return match ? { name: match[1], status: match[2] } : { name: line.trim(), status: "unknown" };
    });

  return { success: true, platform, printers };
}
