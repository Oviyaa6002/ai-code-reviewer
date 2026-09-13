import { SEVERITY, CATEGORY } from "./constants.js";

const SEVERITY_LIST = Object.values(SEVERITY).join(" | ");
const CATEGORY_LIST = Object.values(CATEGORY).join(" | ");

/**
 * System prompt. Sets the reviewer's persona, the rules it must follow,
 * and the exact JSON contract it must return. Kept strict and repeated
 * (schema shown twice: in prose and in the example) because models are
 * more reliable at following a structured contract when it's shown, not
 * just described.
 */
export function buildSystemPrompt() {
  return `You are a senior software engineer performing a rigorous code review, in the style of a careful staff-level reviewer on a pull request. You review for correctness, security, performance, readability, and maintainability.

Rules:
- Only report issues you can justify from the code shown. Do not invent line numbers or behavior that isn't in the snippet.
- Be specific: point to the exact construct, not a generic restatement of best practice.
- Prefer fewer, high-value findings over padding the list with trivial nitpicks.
- Every finding must include a concrete suggested fix, not just a description of the problem.
- If the code is genuinely clean, say so — do not manufacture issues to seem thorough.
- Line numbers refer to the numbered source shown to you (1-indexed, matching the line markers you're given).
- Never include markdown, prose, or code fences outside the JSON object. Return raw JSON only.

You must respond with a single JSON object matching exactly this shape:
{
  "summary": "2-3 sentence plain-English verdict on overall code health",
  "overallAssessment": "clean | minor_issues | needs_work | serious_concerns",
  "findings": [
    {
      "severity": "${SEVERITY_LIST}",
      "category": "${CATEGORY_LIST}",
      "line": <integer or null if not line-specific>,
      "title": "short specific title, under 10 words",
      "description": "what the problem is and why it matters",
      "suggestion": "the concrete fix — code or precise instruction",
      "codeExcerpt": "the exact offending line(s), or null"
    }
  ],
  "strengths": ["short specific positive observations, empty array if none stand out"]
}`;
}

/**
 * Numbers each line of source so the model can cite accurate line
 * references, and the UI can jump to / highlight them later.
 */
function numberLines(code) {
  return code
    .split("\n")
    .map((line, i) => `${i + 1}| ${line}`)
    .join("\n");
}

/**
 * User prompt for one review request.
 * @param {Object} params
 * @param {string} params.code - raw source code
 * @param {string} params.language - detected/declared language
 * @param {string} [params.fileName] - optional file name for context
 * @param {string} [params.focus] - optional user-supplied focus area, e.g. "security only"
 */
export function buildUserPrompt({ code, language, fileName, focus }) {
  const context = fileName ? `File: ${fileName}\n` : "";
  const focusLine = focus
    ? `\nThe author specifically asked you to focus on: ${focus}\n`
    : "";

  return `${context}Language: ${language}
${focusLine}
Review the following source code. Line numbers are shown for reference and are not part of the code.

\`\`\`
${numberLines(code)}
\`\`\`

Return only the JSON object described in your instructions.`;
}
