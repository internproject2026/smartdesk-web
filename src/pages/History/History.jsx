import { Link } from 'react-router-dom';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { useDiagnosticHistory } from '../../hooks/useDiagnosticHistory';

const OUTCOME_STYLES = {
  resolved: { label: 'Resolved', className: 'text-status-online bg-status-online/10 border-status-online/30' },
  escalate: { label: 'Escalated', className: 'text-status-offline bg-status-offline/10 border-status-offline/30' },
};

export function History() {
  const { entries, clearHistory } = useDiagnosticHistory();

  return (
    <div className="space-y-4">
      <HudPanel eyebrow="Logs" title="History">
        <p className="text-sm text-muted">
          Past troubleshooting sessions, stored locally on this device.
        </p>
      </HudPanel>

      {entries.length === 0 ? (
        <p className="px-1 text-sm text-muted">
          No sessions yet. Completed troubleshooting flows will show up here.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => {
              const style = OUTCOME_STYLES[entry.outcome] ?? OUTCOME_STYLES.resolved;
              return (
                <Link
                  key={entry.id}
                  to={`/troubleshoot/${entry.categoryId}`}
                  className="hud-panel flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-glow-sm"
                >
                  <div>
                    <p className="font-display text-sm font-semibold capitalize text-heading">
                      {entry.categoryId}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wide ${style.className}`}
                  >
                    {style.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={clearHistory}
            className="text-xs text-muted underline-offset-2 hover:text-status-critical hover:underline"
          >
            Clear history
          </button>
        </>
      )}
    </div>
  );
}
