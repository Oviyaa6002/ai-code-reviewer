import { buildSystemPrompt, buildUserPrompt } from "./promptBuilder.js";
import { callModel } from "./llmClient.js";
import {
  SEVERITY_WEIGHT,
  SEVERITY_ORDER,
  MAX_CHARS_PER_REQUEST,
} from "./constants.js";

/**
 * Strips accidental code-fence wrapping and parses the model's JSON.
 * Models occasionally wrap JSON in ```json fences despite instructions
 * not to — this defends against that without weakening the prompt.
 */
function parseModelJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Model returned unparseable JSON: ${err.message}\n--- raw output ---\n${raw.slice(
        0,
        500
      )}`
    );
  }
}

/**
 * Computes a 0-100 health score by deducting weighted penalties per
 * finding. Floors at 0 so a pile-up of critical issues doesn't go
 * negative.
 */
function computeScore(findings) {
  const penalty = findings.reduce(
    (sum, f) => sum + (SEVERITY_WEIGHT[f.severity] ?? 0),
    0
  );
  return Math.max(0, 100 - penalty);
}

function sortFindings(findings) {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );
}

function summarizeCounts(findings) {
  const counts = Object.fromEntries(SEVERITY_ORDER.map((s) => [s, 0]));
  for (const f of findings) {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1;
  }
  return counts;
}

/**
 * Runs a full review of one code snippet/file.
 *
 * @param {Object} params
 * @param {string} params.code - source code to review (required)
 * @param {string} [params.language] - language name; defaults to "other"
 * @param {string} [params.fileName] - optional, improves model context
 * @param {string} [params.focus] - optional focus hint, e.g. "security"
 * @returns {Promise<Object>} structured review result
 */
export async function reviewCode({
  code,
  language = "other",
  fileName,
  focus,
}) {
  if (!code || !code.trim()) {
    throw new Error("No code provided to review.");
  }
  if (code.length > MAX_CHARS_PER_REQUEST) {
    throw new Error(
      `Input is ${code.length} characters, which exceeds the ${MAX_CHARS_PER_REQUEST}-character limit for a single review. Split the file and review it in parts.`
    );
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt({ code, language, fileName, focus });

  const raw = await callModel({ systemPrompt, userPrompt });
  const parsed = parseModelJson(raw);

  const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
  const sorted = sortFindings(findings);

  return {
    fileName: fileName || null,
    language,
    summary: parsed.summary || "",
    overallAssessment: parsed.overallAssessment || "unknown",
    score: computeScore(sorted),
    counts: summarizeCounts(sorted),
    findings: sorted,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    reviewedAt: new Date().toISOString(),
  };
}
