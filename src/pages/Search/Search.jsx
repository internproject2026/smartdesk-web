import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { searchKnowledgeBase } from '../../services/mock/searchIndex';

export function Search() {
  const [query, setQuery] = useState('');
  const results = searchKnowledgeBase(query);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <HudPanel eyebrow="Knowledge Base" title="Search">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search offline troubleshooting steps…"
          className="w-full rounded-md border border-border bg-white/5 px-4 py-2.5 text-sm text-ghost placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-signal"
        />
      </HudPanel>

      {hasQuery && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <p className="px-1 text-sm text-muted">
              No results for "{query}" in the offline knowledge base.
            </p>
          ) : (
            results.map((entry, i) => (
              <Link
                key={i}
                to={`/troubleshoot/${entry.categoryId}`}
                className="hud-panel block p-4 transition-shadow hover:shadow-glow-sm"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-signal/70">
                  {entry.categoryLabel}
                </span>
                <h3 className="mt-1 font-display text-sm font-semibold text-heading">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{entry.snippet}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
