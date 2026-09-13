const EXTENSION_MAP = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".hpp": "cpp",
  ".cs": "csharp",
  ".php": "php",
  ".rb": "ruby",
  ".sql": "sql",
  ".html": "html",
  ".htm": "html",
  ".css": "css",
};

/**
 * Guesses a language from a file name/path. Falls back to "other" for
 * unrecognized or missing extensions rather than guessing further —
 * a wrong guess produces a worse prompt than an honest "other".
 */
export function detectLanguageFromFileName(fileName = "") {
  const match = fileName.match(/\.[a-zA-Z0-9]+$/);
  if (!match) return "other";
  return EXTENSION_MAP[match[0].toLowerCase()] || "other";
}
