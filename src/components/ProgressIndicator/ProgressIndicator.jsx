export function ProgressIndicator({ current, total }) {
  const percent = ((current + 1) / total) * 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-signal shadow-glow-sm transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
