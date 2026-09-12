/**
 * Mock AI response service.
 *
 * In Phase 4 this becomes a real fetch() to the backend, which itself
 * proxies to the cloud LLM — the API key never lives in this frontend
 * code, only on the backend. The shape (a Promise resolving to a string)
 * stays the same, so the page component won't need to change.
 */
export function fetchAIResponse(question) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `This is a placeholder AI response. Once the backend AI API is connected, ` +
          `this will send "${question}" to the cloud model and return a real answer.`
      );
    }, 900);
  });
}
