import { Link } from 'react-router-dom';

const ICONS = {
  network: (
    <path d="M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M12 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  ),
  printer: (
    <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z" />
  ),
  display: (
    <path d="M3 4h18v12H3V4Zm5 16h8m-4-4v4" />
  ),
  peripheral: (
    <path d="M6 3h12v6a6 6 0 0 1-12 0V3Zm6 12v6" />
  ),
};

/**
 * ProblemCard — one selectable entry point into a troubleshooting flow.
 * Used on both the Categories page and the Dashboard's quick-access section,
 * so the visual treatment only needs to be defined once.
 */
export function ProblemCard({ category }) {
  return (
    <Link
      to={`/troubleshoot/${category.id}`}
      className="hud-panel group flex flex-col gap-3 p-5 transition-shadow hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-signal/30 bg-signal/10 text-signal">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICONS[category.icon]}
          </svg>
        </span>
        <span className="font-mono text-[11px] text-muted">
          {category.issueCount} issues
        </span>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold text-heading group-hover:text-signal">
          {category.label}
        </h3>
        <p className="mt-1 text-sm text-muted">{category.description}</p>
      </div>
    </Link>
  );
}
