/**
 * HudPanel — the base "card" used across every page in the futuristic
 * direction: glass background, subtle border, HUD corner brackets.
 * Centralizing it here means the look stays consistent without every
 * page re-implementing the same classes.
 */
export function HudPanel({ title, eyebrow, children, className = '' }) {
  return (
    <section className={`hud-panel p-6 ${className}`}>
      {eyebrow && (
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-signal/70">
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className="mb-2 font-display text-xl font-semibold text-heading">{title}</h2>
      )}
      {children}
    </section>
  );
}
