import { postJson } from "./client";

/**
 * Real AI Assistant call — replaces src/services/mock/aiAssistant.js.
 * The question goes to our backend (server/services/aiAssistant.js),
 * which holds the actual provider API key and forwards the request.
 * The frontend never sees or stores that key.
 */
export async function fetchAIResponse(question) {
  const data = await postJson("/ai-assistant", { question });
  return data.answer;
}
