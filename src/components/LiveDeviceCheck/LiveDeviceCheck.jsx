import { useState } from 'react';

/**
 * Generic "run a real check against the backend" step, shared by the
 * printer, display, and peripheral troubleshooting flows. Network has its
 * own LiveNetworkCheck component instead, since it has a specific
 * hasValidIP outcome the flow branches on — this one is presentation-only.
 *
 * fetchFn: the API function to call (e.g. fetchPrinterCheck).
 * renderList: (data) => array of { key, label } to display when the check
 *   succeeds and returns a structured list (printers/displays/devices).
 * buttonLabel: text for the run button.
 */
export function LiveDeviceCheck({ fetchFn, renderList, buttonLabel = 'Run Live Check' }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function runCheck() {
    setStatus('loading');
    try {
      const result = await fetchFn();
      if (!result.success) {
        setErrorMessage(result.error ?? 'The backend reported this check failed.');
        setStatus('error');
        return;
      }
      setData(result);
      setStatus('done');
    } catch (error) {
      setErrorMessage('Could not reach the SmartDesk backend. Make sure the local server is running.');
      setStatus('error');
    }
  }

  const items = status === 'done' && data ? renderList(data) : [];

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={runCheck}
        disabled={status === 'loading'}
        className="self-start rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm transition-transform hover:scale-[1.02] disabled:opacity-40"
      >
        {status === 'loading' ? 'Checking…' : buttonLabel}
      </button>

      {status === 'error' && <p className="text-sm text-status-offline">{errorMessage}</p>}

      {status === 'done' && data && (
        <div className="hud-panel space-y-2 p-4">
          {items.length > 0 ? (
            <ul className="space-y-1 text-sm text-ghost/80">
              {items.map((item) => (
                <li key={item.key} className="font-mono text-xs">
                  {item.label}
                </li>
              ))}
            </ul>
          ) : data.raw ? (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-ghost/80">
              {data.raw}
            </pre>
          ) : (
            <p className="text-sm text-muted">No devices detected.</p>
          )}
        </div>
      )}
    </div>
  );
}
