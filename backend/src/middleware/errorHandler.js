// Anthropic SDK errors carry a `status`; our own thrown Errors don't.
// Map both into a consistent JSON error shape so the frontend never has
// to branch on error source.
export function errorHandler(err, req, res, _next) {
  console.error("[error]", err.message);

  if (err.status === 401) {
    return res.status(502).json({
      error: "upstream_auth_error",
      message: "The server's LLM API key was rejected. Check GROQ_API_KEY (or ANTHROPIC_API_KEY if LLM_PROVIDER=anthropic).",
    });
  }

  if (err.status === 429) {
    return res.status(429).json({
      error: "rate_limited",
      message: "The upstream LLM provider's rate limit was hit. Groq's free tier resets daily — try again shortly or tomorrow.",
    });
  }

  if (err.message?.includes("exceeds the")) {
    return res.status(413).json({ error: "payload_too_large", message: err.message });
  }

  if (err.message?.includes("unparseable JSON")) {
    return res.status(502).json({
      error: "upstream_parse_error",
      message: "The model returned a response that couldn't be parsed. Please retry.",
    });
  }

  res.status(500).json({
    error: "internal_error",
    message: "Something went wrong while reviewing this code.",
  });
}
