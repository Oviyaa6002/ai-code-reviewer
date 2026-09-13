const PROVIDER = (process.env.LLM_PROVIDER || "groq").toLowerCase();

/**
 * Groq — free tier, no credit card required (as of writing: ~1,000
 * requests/day, 30/minute, per console.groq.com). OpenAI-compatible
 * chat completions endpoint, so no extra SDK dependency is needed.
 */
async function callGroq({ systemPrompt, userPrompt, model, maxTokens }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Groq API key. Get a free key at https://console.groq.com/keys and set GROQ_API_KEY in your .env."
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Groq API error (${res.status}): ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq response contained no message content.");
  return text;
}

/**
 * Anthropic (Claude) — optional, paid. Only imported if actually
 * selected, so the free Groq path never needs this dependency present.
 */
async function callAnthropic({ systemPrompt, userPrompt, model, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Anthropic API key. Set ANTHROPIC_API_KEY in your .env, or set LLM_PROVIDER=groq to use the free option instead."
    );
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: model || process.env.CLAUDE_MODEL || "claude-sonnet-5",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) throw new Error("Model response contained no text content.");
  return textBlock.text;
}

/**
 * Sends a single review request to whichever provider is configured
 * via LLM_PROVIDER ("groq" by default, or "anthropic"). All prompt
 * logic lives in promptBuilder.js and all parsing lives in
 * reviewEngine.js — this is the only place that talks to the network.
 */
export async function callModel({ systemPrompt, userPrompt, model, maxTokens = 4096 }) {
  if (PROVIDER === "anthropic") {
    return callAnthropic({ systemPrompt, userPrompt, model, maxTokens });
  }
  return callGroq({ systemPrompt, userPrompt, model, maxTokens });
}
