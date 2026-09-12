import { useState } from 'react';
import { fetchNetworkInfo } from '../../services/api/networkApi';

/**
 * LiveNetworkCheck — runs a real check against the local backend instead
 * of just showing static instructions. Ported from the original
 * SmartDeskAssistant prototype's "Check My IP Address" step, adapted to
 * the shared backend (server/index.js) and the HUD visual language.
 *
 * onResult is called with a boolean (hasValidIP) once the check completes,
 * so the parent (TroubleshootingFlow) can branch the flow accordingly —
 * this mirrors the original goToStep(5) / goToStep(6) branching logic,
 * just driven by real data instead of the user self-reporting.
 */
export function LiveNetworkCheck({ onResult }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [result, setResult] = useState(null);

  async function runCheck() {
    setStatus('loading');
    try {
      const data = await fetchNetworkInfo();
      setResult(data);
      setStatus('done');
      onResult?.(data.hasValidIP);
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={runCheck}
        disabled={status === 'loading'}
        className="self-start rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm transition-transform hover:scale-[1.02] disabled:opacity-40"
      >
        {status === 'loading' ? 'Checking…' : 'Run Live Network Check'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-status-offline">
          Could not reach the SmartDesk backend. Make sure the local server
          (server/index.js) is running on port 3000.
        </p>
      )}

      {status === 'done' && result && (
        <div className="hud-panel space-y-2 p-4">
          <p
            className={`font-mono text-xs font-semibold uppercase tracking-widest ${
              result.hasValidIP ? 'text-signal' : 'text-status-offline'
            }`}
          >
            {result.hasValidIP ? 'Valid IP Address Detected' : 'No Valid IP Address Detected'}
          </p>
          <ul className="space-y-1 text-sm text-ghost/80">
            {result.adapters
              .filter((a) => !a.internal)
              .map((a) => (
                <li key={`${a.adapter}-${a.address}`} className="font-mono text-xs">
                  {a.adapter}: {a.address}
                </li>
              ))}
            {result.adapters.filter((a) => !a.internal).length === 0 && (
              <li className="text-xs text-muted">No external adapters found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
