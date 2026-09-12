import { useState, useRef, useEffect } from 'react';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { AIResponse } from '../../components/AIResponse/AIResponse';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { fetchAIResponse } from '../../services/api/aiAssistant';

export function AIAssistant() {
  const isOnline = useOnlineStatus();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setIsSending(true);

    try {
      const answer = await fetchAIResponse(question);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong reaching the AI service. Please try again.' },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  if (!isOnline) {
    return (
      <HudPanel eyebrow="Online Only" title="AI Assistant">
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm text-status-offline">
            The AI Assistant needs an internet connection.
          </p>
          <p className="max-w-sm text-sm text-muted">
            You're currently offline. Use the offline troubleshooting flows from Categories instead —
            AI Assistant will become available again once you're back online.
          </p>
        </div>
      </HudPanel>
    );
  }

  return (
    <HudPanel eyebrow="Online" title="AI Assistant">
      <div className="flex h-[420px] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-muted">
              Ask about a technical issue that the offline guides didn't resolve.
            </p>
          )}
          {messages.map((m, i) => (
            <AIResponse key={i} role={m.role} content={m.content} />
          ))}
          {isSending && <AIResponse role="assistant" isLoading />}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t border-border pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the issue…"
            className="flex-1 rounded-md border border-border bg-white/5 px-3 py-2 text-sm text-ghost placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-signal"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
          >
            Send
          </button>
        </form>
      </div>
    </HudPanel>
  );
}
