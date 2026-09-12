const OUTCOME_CONFIG = {
  resolved: {
    label: 'Issue Resolved',
    colorClass: 'text-status-online',
    ringClass: 'border-status-online/30 bg-status-online/10',
    message: 'The troubleshooting steps resolved this issue. No further action needed.',
    icon: (
      <path d="M20 6 9 17l-5-5" />
    ),
  },
  escalate: {
    label: 'Escalated',
    colorClass: 'text-status-offline',
    ringClass: 'border-status-offline/30 bg-status-offline/10',
    message:
      'The offline steps didn\u2019t resolve this. This session has been flagged for further help.',
    icon: (
      <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    ),
  },
  unknown: {
    label: 'Session Not Found',
    colorClass: 'text-muted',
    ringClass: 'border-border bg-white/5',
    message: 'No result data for this session \u2014 it may have expired or the link is incorrect.',
    icon: (
      <path d="M12 17h.01M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.75-2 3.5" />
    ),
  },
};

export function DiagnosticResult({ outcome = 'unknown', sessionId }) {
  const config = OUTCOME_CONFIG[outcome] ?? OUTCOME_CONFIG.unknown;

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full border ${config.ringClass}`}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={config.colorClass}
          aria-hidden="true"
        >
          {config.icon}
        </svg>
      </span>

      <div>
        <h3 className={`font-display text-lg font-semibold ${config.colorClass}`}>
          {config.label}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted">{config.message}</p>
        {sessionId && (
          <p className="mt-2 font-mono text-[11px] text-muted/70">Session: {sessionId}</p>
        )}
      </div>
    </div>
  );
}
