/**
 * Proxies chat questions to a cloud LLM. The API key lives only here, on
 * the backend, and is never sent to or stored in the frontend bundle —
 * this is the point of having a backend for this at all (see
 * src/config/env.js's comment on the frontend side).
 *
 * Supports two providers via AI_PROVIDER in server/.env:
 *   - "anthropic" (default): Claude via the Messages API
 *   - "openai": Chat Completions API
 *
 * This has not been run against a live API key in this environment
 * (no network access here) — the request/response shapes match each
 * provider's public docs as of writing, but test with a real key before
 * shipping, and re-check the docs if either provider changes their API.
 */

const PROVIDER = process.env.AI_PROVIDER || "anthropic";

export async function getAIResponse(question) {
  if (PROVIDER === "openai") {
    return callOpenAI(question);
  }
  return callAnthropic(question);
}

async function callAnthropic(question) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in server/.env");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system:
        "You are the SmartDesk Assistant AI escalation layer, helping an " +
        "enterprise employee with an IT problem that the offline " +
        "troubleshooting guides didn't resolve. Be concise and practical.",
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  return textBlock?.text ?? "The AI service returned no text response.";
}

async function callOpenAI(question) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in server/.env");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are the SmartDesk Assistant AI escalation layer, helping an " +
            "enterprise employee with an IT problem that the offline " +
            "troubleshooting guides didn't resolve. Be concise and practical.",
        },
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "The AI service returned no text response.";
}
