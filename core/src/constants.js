// Severity levels a finding can be assigned, ordered worst -> best.
export const SEVERITY = Object.freeze({
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
  INFO: "info",
});

export const SEVERITY_ORDER = [
  SEVERITY.CRITICAL,
  SEVERITY.HIGH,
  SEVERITY.MEDIUM,
  SEVERITY.LOW,
  SEVERITY.INFO,
];

// Weight used to compute the overall 0-100 health score from a finding list.
export const SEVERITY_WEIGHT = Object.freeze({
  [SEVERITY.CRITICAL]: 25,
  [SEVERITY.HIGH]: 12,
  [SEVERITY.MEDIUM]: 6,
  [SEVERITY.LOW]: 2,
  [SEVERITY.INFO]: 0,
});

// Categories a finding can be tagged with. Kept broad on purpose so the
// model has room to classify accurately without inventing new taxonomies.
export const CATEGORY = Object.freeze({
  BUG: "bug",
  SECURITY: "security",
  PERFORMANCE: "performance",
  MAINTAINABILITY: "maintainability",
  STYLE: "style",
  BEST_PRACTICE: "best_practice",
});

export const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "html",
  "css",
  "other",
];

// Cap on how much source we send per request. Large files are chunked by
// the caller rather than truncated silently, so nothing is reviewed blind.
export const MAX_CHARS_PER_REQUEST = 12000;
