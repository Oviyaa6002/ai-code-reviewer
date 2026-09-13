import { SUPPORTED_LANGUAGES, MAX_CHARS_PER_REQUEST } from "@ai-code-reviewer/core";

export function validateReviewRequest(req, res, next) {
  const { code, language } = req.body || {};

  if (typeof code !== "string" || !code.trim()) {
    return res.status(400).json({
      error: "validation_error",
      message: "Field 'code' is required and must be a non-empty string.",
    });
  }

  if (code.length > MAX_CHARS_PER_REQUEST) {
    return res.status(413).json({
      error: "payload_too_large",
      message: `Code exceeds the ${MAX_CHARS_PER_REQUEST}-character limit for a single review.`,
    });
  }

  if (language && !SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({
      error: "validation_error",
      message: `Unsupported language '${language}'. Supported: ${SUPPORTED_LANGUAGES.join(
        ", "
      )}.`,
    });
  }

  next();
}
