export function ImageViewer({ src, alt }) {
  if (!src) {
    return (
      <div
        className="flex h-48 w-full items-center justify-center rounded-md border border-dashed border-border bg-white/5"
        role="img"
        aria-label={alt || 'Diagram not yet available'}
      >
        <span className="font-mono text-xs text-muted">Diagram placeholder</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full rounded-md border border-border object-cover"
    />
  );
}
