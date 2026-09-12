import { useEffect, useState } from 'react';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { ProblemCard } from '../../components/ProblemCard/ProblemCard';
import { fetchProblemCategories } from '../../services/api/knowledgeBase';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function Dashboard() {
  const [categories, setCategories] = useState(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    let cancelled = false;
    fetchProblemCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalIssues = categories?.reduce((sum, c) => sum + c.issueCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatPanel
          eyebrow="Connectivity"
          value={isOnline ? 'Online' : 'Offline'}
          valueClass={isOnline ? 'text-status-online' : 'text-status-offline'}
          note={isOnline ? 'AI assistant available' : 'Using cached knowledge base'}
        />
        <StatPanel
          eyebrow="Known Issues"
          value={totalIssues ?? '—'}
          note="Across all categories"
        />
        <StatPanel eyebrow="Data Source" value="Cached" note="Offline knowledge engine" />
      </div>

      <HudPanel eyebrow="Quick Access" title="Start Troubleshooting">
        <p className="mb-4 text-sm text-muted">
          Select a category below, or browse all categories for the full list.
        </p>
        {categories === null ? (
          <p className="text-sm text-muted">Loading categories…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <ProblemCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </HudPanel>
    </div>
  );
}

function StatPanel({ eyebrow, value, note, valueClass = 'text-heading' }) {
  return (
    <div className="hud-panel p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal/70">
        {eyebrow}
      </p>
      <p className={`mt-1 font-display text-2xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{note}</p>
    </div>
  );
}
