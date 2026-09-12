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
 * Checks connected display(s) and resolution.
 *
 * Windows: PowerShell against Win32_VideoController (current resolution).
 * macOS: `system_profiler SPDisplaysDataType` (human-readable, so we return
 *   the raw text — full structured parsing would need a dedicated parser).
 * Linux: `xrandr --current`, which requires a running X server. On Wayland
 *   or a headless box this will fail — that's expected, not a bug, and the
 *   response reflects that instead of throwing.
 *
 * NOTE: only syntax-checked here, not run on real hardware for each OS.
 * Verify on an actual Windows/macOS machine before shipping.
 */
export async function getDisplayInfo() {
  const platform = os.platform();

  if (platform === "win32") {
    const { error, stdout } = await run(
      'powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_VideoController | Select-Object Name,CurrentHorizontalResolution,CurrentVerticalResolution | ConvertTo-Json"'
    );

    if (error) {
      return {
        success: false,
        platform,
        error: "Could not query display info via PowerShell (Win32_VideoController).",
      };
    }

    try {
      const parsed = JSON.parse(stdout || "[]");
      const controllers = Array.isArray(parsed) ? parsed : [parsed];
      return {
        success: true,
        platform,
        displays: controllers.map((c) => ({
          name: c.Name,
          width: c.CurrentHorizontalResolution,
          height: c.CurrentVerticalResolution,
          hasSignal: Boolean(c.CurrentHorizontalResolution && c.CurrentVerticalResolution),
        })),
      };
    } catch {
      return { success: true, platform, displays: [], raw: stdout };
    }
  }

  if (platform === "darwin") {
    const { error, stdout } = await run("system_profiler SPDisplaysDataType");
    if (error) {
      return { success: false, platform, error: "Could not query displays via system_profiler." };
    }
    // system_profiler's output isn't easily machine-parseable without a
    // dedicated plist/JSON flag per macOS version, so we surface the raw
    // text and let the frontend show it directly.
    return { success: true, platform, raw: stdout };
  }

  // Linux
  const { error, stdout } = await run("xrandr --current");
  if (error) {
    return {
      success: false,
      platform,
      error:
        "Could not query displays via xrandr. This requires a running X server " +
        "and will fail on Wayland-only or headless systems.",
    };
  }

  const displays = stdout
    .split("\n")
    .filter((line) => line.includes(" connected"))
    .map((line) => {
      const nameMatch = line.match(/^(\S+) connected/);
      const resMatch = line.match(/(\d+x\d+)\+\d+\+\d+/);
      return {
        name: nameMatch?.[1] ?? "unknown",
        resolution: resMatch?.[1] ?? null,
      };
    });

  return { success: true, platform, displays };
}
