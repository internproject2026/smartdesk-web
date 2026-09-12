import { useEffect, useState } from 'react';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { ProblemCard } from '../../components/ProblemCard/ProblemCard';
import { fetchProblemCategories } from '../../services/api/knowledgeBase';

export function ProblemCategory() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProblemCategories().then((data) => {
      if (!cancelled) setCategories(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <HudPanel eyebrow="Select" title="Problem Categories">
        <p className="text-sm text-muted">
          Choose a category to start a step-by-step troubleshooting flow.
        </p>
      </HudPanel>

      {categories === null ? (
        <CategoriesSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <ProblemCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="hud-panel h-32 animate-pulse p-5" aria-hidden="true" />
      ))}
    </div>
  );
}
