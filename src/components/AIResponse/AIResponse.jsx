export function AIResponse({ role, content, isLoading = false }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-signal text-onAccent'
            : 'hud-panel text-ghost'
        }`}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <Dot delay="0ms" />
            <Dot delay="150ms" />
            <Dot delay="300ms" />
          </span>
        ) : (
          content
        )}
      </div>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-signal"
      style={{ animationDelay: delay }}
    />
  );
}
