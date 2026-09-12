import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useBackendHeartbeat } from '../../hooks/useBackendHeartbeat';

/**
 * NetworkStatus — radar-pulse connectivity indicator.
 *
 * Signature element of the futuristic direction: concentric rings ping
 * outward continuously while online (like a radar sweep confirming signal),
 * and freeze mid-ring when offline — the ping "dying" reads instantly as
 * loss of connection without needing to read the label.
 *
 * Combines two independent signals: the browser's online/offline event
 * (isOnline) and a real heartbeat against our own backend
 * (isBackendReachable). They can disagree — e.g. the browser reports
 * "online" but the local SmartDesk backend isn't running — and the label
 * reflects that instead of collapsing to one boolean.
 */
export function NetworkStatus() {
  const isOnline = useOnlineStatus();
  const isBackendReachable = useBackendHeartbeat();

  const label = getLabel(isOnline, isBackendReachable);
  const isHealthy = isOnline && isBackendReachable;

  return (
    <div
      role="status"
      aria-live="polite"
      title={`Browser: ${isOnline ? 'online' : 'offline'} · Backend: ${
        isBackendReachable === null ? 'checking…' : isBackendReachable ? 'reachable' : 'unreachable'
      }`}
      className={`hud-panel inline-flex items-center gap-3 px-4 py-2 ${
        isHealthy ? 'shadow-glow-sm' : ''
      }`}
    >
      <RadarPulse isOnline={isHealthy} />
      <span
        className={`font-mono text-xs font-medium uppercase tracking-widest ${
          isHealthy ? 'text-signal' : 'text-status-offline'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function getLabel(isOnline, isBackendReachable) {
  if (!isOnline) return 'Offline';
  if (isBackendReachable === null) return 'Checking…';
  if (!isBackendReachable) return 'Backend Down';
  return 'Online';
}

function RadarPulse({ isOnline }) {
  return (
    <span className="relative flex h-3 w-3">
      {isOnline && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
      )}
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${
          isOnline ? 'bg-signal shadow-glow-sm' : 'bg-status-offline'
        }`}
      />
    </span>
  );
}
