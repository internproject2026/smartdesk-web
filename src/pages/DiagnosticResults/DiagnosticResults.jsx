import { useParams, useLocation, Link } from 'react-router-dom';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { DiagnosticResult } from '../../components/DiagnosticResult/DiagnosticResult';

export function DiagnosticResults() {
  const { sessionId } = useParams();
  const location = useLocation();
  // Falls back to 'unknown' if someone lands here directly (refresh, shared
  // link) without navigation state — never crashes on missing data.
  const outcome = location.state?.outcome ?? 'unknown';

  return (
    <div className="space-y-4">
      <HudPanel eyebrow="Session Complete" title={`Results: ${sessionId}`}>
        <DiagnosticResult outcome={outcome} sessionId={sessionId} />

        <div className="flex flex-wrap justify-center gap-3 border-t border-border pt-4">
          <Link
            to="/categories"
            className="rounded-md border border-border px-4 py-2 text-sm text-ghost/80 transition-colors hover:bg-white/5"
          >
            Back to Categories
          </Link>

          {outcome === 'escalate' && (
            <Link
              to="/ai-assistant"
              className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm transition-transform hover:scale-[1.02]"
            >
              Ask AI Assistant
            </Link>
          )}
        </div>
      </HudPanel>
    </div>
  );
}
