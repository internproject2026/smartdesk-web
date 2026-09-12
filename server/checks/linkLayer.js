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
 * Checks Wi-Fi signal strength (RSSI) and link speed. Node has no
 * built-in cross-platform way to get this — every OS requires a
 * different command, and the output format is genuinely inconsistent
 * even across versions of the same OS. This is the least reliable check
 * in the project; treat it as best-effort.
 *
 * Windows: `netsh wlan show interfaces` reports "Signal" as a percentage
 *   (not dBm) and "Receive rate"/"Transmit rate" in Mbps.
 * macOS: the airport utility used to provide this but Apple has been
 *   removing/relocating it across recent macOS versions — this may
 *   simply fail on newer machines, which is expected, not a bug.
 * Linux: `iwconfig` reports signal level in dBm, but is deprecated in
 *   favor of `iw`, and neither is guaranteed to be installed.
 *
 * NOTE: none of this has been tested on real hardware — only
 * syntax-checked. This is the check most likely to need adjustment once
 * someone actually runs it, since Windows driver/OS version differences
 * change `netsh`'s exact output wording.
 */
export async function getLinkLayerInfo() {
  const platform = os.platform();

  if (platform === "win32") {
    const { error, stdout } = await run("netsh wlan show interfaces");

    if (error) {
      return {
        success: false,
        platform,
        error:
          "Could not query Wi-Fi interface via netsh. This machine may be " +
          "on Ethernet only, or netsh may not be available.",
      };
    }

        const signalMatch = stdout.match(/Signal\s*:\s*(\d+)%/);
    const rssiMatch = stdout.match(/Rssi\s*:\s*(-?\d+)/);
    const receiveMatch = stdout.match(/Receive rate \(Mbps\)\s*:\s*([\d.]+)/);
    const transmitMatch = stdout.match(/Transmit rate \(Mbps\)\s*:\s*([\d.]+)/);
    const ssidMatch = stdout.match(/^\s*SSID\s*:\s*(.+)$/m);

    return {
      success: true,
      platform,
      connectionType: "wifi",
      ssid: ssidMatch?.[1]?.trim() ?? null,
      signalPercent: signalMatch ? Number(signalMatch[1]) : null,
      rssiDbm: rssiMatch ? Number(rssiMatch[1]) : null,
      receiveRateMbps: receiveMatch ? Number(receiveMatch[1]) : null,
      transmitRateMbps: transmitMatch ? Number(transmitMatch[1]) : null,
      raw: stdout,
    };  }

  if (platform === "darwin") {
    // Apple has moved/removed the airport utility across recent macOS
    // versions, so this may fail — that's expected on newer machines.
    const airportPath =
      "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport";
    const { error, stdout } = await run(`${airportPath} -I`);

    if (error) {
      return {
        success: false,
        platform,
        error:
          "Could not query Wi-Fi info via the airport utility. Apple has " +
          "removed/relocated this tool on some macOS versions — this is a " +
          "known limitation, not necessarily a bug in this check.",
      };
    }

    const rssiMatch = stdout.match(/agrCtlRSSI:\s*(-?\d+)/);
    const ssidMatch = stdout.match(/\sSSID:\s*(.+)/);

    return {
      success: true,
      platform,
      connectionType: "wifi",
      ssid: ssidMatch?.[1]?.trim() ?? null,
      rssiDbm: rssiMatch ? Number(rssiMatch[1]) : null,
      raw: stdout,
    };
  }

  // Linux
  const { error, stdout } = await run("iwconfig 2>&1");

  if (error) {
    return {
      success: false,
      platform,
      error: "Could not query Wi-Fi info via iwconfig. Is `wireless-tools` installed?",
    };
  }

  const rssiMatch = stdout.match(/Signal level=(-?\d+)\s*dBm/);
  const ssidMatch = stdout.match(/ESSID:"([^"]*)"/);

  return {
    success: true,
    platform,
    connectionType: "wifi",
    ssid: ssidMatch?.[1] ?? null,
    rssiDbm: rssiMatch ? Number(rssiMatch[1]) : null,
    raw: stdout,
  };
}
