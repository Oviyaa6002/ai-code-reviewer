# AI Code Reviewer

A code review tool that reads a file or snippet and returns a structured report — bugs, security issues, performance concerns, and concrete fixes — powered by the Claude API. Ships as both a **CLI** (for local use and CI pipelines) and a **web dashboard** (for pasting and reviewing code interactively).

> Built as a portfolio project to demonstrate API integration, prompt engineering for structured output, and full-stack architecture (monorepo, shared core logic, REST API, React frontend, CLI tooling).

---

## Why this exists

Automated linters catch syntax and style issues; they don't catch "this SQL query is built with string concatenation" or "this function will throw if `users` is empty." This tool uses an LLM to do the kind of review a careful senior engineer would do on a pull request — while staying structured enough to gate a CI pipeline or render in a UI, not just produce a paragraph of prose.

## Features

- **Structured findings, not a wall of text** — every issue has a severity, category, line reference, description, and a concrete suggested fix, returned as JSON.
- **Two interfaces, one engine** — the CLI and the web dashboard both call the same `core` review engine, so behavior never drifts between them.
- **CI-friendly** — `code-reviewer --fail-on critical` exits non-zero when it finds blocking issues, so it can gate a pipeline the same way a linter does.
- **Health score** — a 0–100 score computed from weighted severity counts, so review quality is trackable over time, not just a one-off read.
- **Rate-limited, validated API** — the backend guards the expensive (LLM-calling) route specifically, validates input size and language, and returns typed error codes the frontend can branch on.

## Architecture

```
ai-code-reviewer/
├── core/          # Shared engine: prompt building, Claude API client, response parsing, scoring
├── backend/       # Express API — exposes core over HTTP for the web dashboard
├── cli/           # Commander-based CLI — exposes core as `code-reviewer <files>`
└── frontend/      # React + Vite dashboard — paste code, see the report render live
```

Both `backend` and `cli` depend on `core` as a workspace package — the LLM prompt, the JSON schema it enforces, and the scoring logic exist in exactly one place. Fixing a bug in how a finding is scored fixes it everywhere at once.

```
                     ┌──────────────┐
   CLI  ───────────▶ │              │
                     │  core engine │ ───▶ Claude API
   Backend API  ───▶ │  (prompt +   │
   (used by the      │   parsing +  │
    React frontend)  │   scoring)   │
                     └──────────────┘
```

### Request flow (web)

1. User pastes code into the CodeMirror editor and hits **Review code**.
2. Frontend `POST`s `{ code, language, fileName, focus }` to `/api/review`.
3. Backend validates the payload, then calls `core.reviewCode()`.
4. `core` builds a system + user prompt that forces a strict JSON schema, calls Claude, parses the response, and computes a health score from the findings.
5. Backend returns the structured result; the dashboard renders it as a list of annotated findings sorted by severity.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| LLM | Groq API (default, free) — [Claude API](#switching-to-claude) optional | OpenAI-compatible endpoint, no credit card required, generous daily free tier |
| Backend | Node.js + Express | Small, well-understood surface for a single-purpose API |
| Frontend | React + Vite + Tailwind | Fast dev loop; utility CSS keeps the annotated-findings layout maintainable |
| Editor | CodeMirror 6 | Lightweight compared to Monaco, good language support |
| CLI | Commander + Chalk | Standard, ergonomic CLI argument parsing and colored terminal output |
| Monorepo | npm workspaces | One `npm install` at the root wires up all four packages and the shared `core` dependency |

## Getting started

### Prerequisites

- Node.js 18+
- A free Groq API key — [console.groq.com/keys](https://console.groq.com/keys) (no credit card required)

### Setup

```bash
git clone https://github.com/<your-username>/ai-code-reviewer.git
cd ai-code-reviewer
npm install

cp backend/.env.example backend/.env
# then edit backend/.env and add your GROQ_API_KEY

cp frontend/.env.example frontend/.env
```

### Switching to Claude

The review engine is provider-agnostic — Groq is the default because it's free, but the same prompt and JSON contract work against Claude. To switch, set in `backend/.env` (and the root `.env` for the CLI):

```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-sonnet-5
```

No code changes needed — `core/src/llmClient.js` picks the provider from `LLM_PROVIDER` at request time.

### Run the web dashboard

```bash
npm run dev:all
```

This starts the API on `http://localhost:4000` and the dashboard on `http://localhost:5173`.

### Run the CLI

The CLI reads `GROQ_API_KEY` from its own environment, so either export it in your shell or create a `.env` file at the repo root:

```bash
echo "GROQ_API_KEY=gsk-..." > .env

# Review a single file
npm run review -- src/index.js

# Review a whole directory with a glob
npm run review -- "src/**/*.js"

# Ask it to focus on one concern
npm run review -- src/api.js --focus "SQL injection and input validation"

# Get raw JSON (useful for piping into other tools)
npm run review -- src/index.js --json

# Use it as a CI gate — exits 1 if any HIGH or CRITICAL finding is present
npm run review -- "src/**/*.js" --fail-on high
```

Example output:

```
✗ src/db.js  42/100
  1.  CRITICAL   SQL built via string concatenation   line 2
      User input is concatenated directly into the query string, allowing SQL injection.
      Fix — Use a parameterized query: db.query("SELECT * FROM users WHERE id = ?", [id])
```

## API reference

### `POST /api/review`

**Body**

```json
{
  "code": "function add(a, b) { return a + b }",
  "language": "javascript",
  "fileName": "math.js",
  "focus": "optional — e.g. 'performance'"
}
```

**Response `200`**

```json
{
  "fileName": "math.js",
  "language": "javascript",
  "summary": "Small, correct function with no notable issues.",
  "overallAssessment": "clean",
  "score": 100,
  "counts": { "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0 },
  "findings": [],
  "strengths": ["Simple, single-purpose function with a clear name"],
  "reviewedAt": "2026-01-01T00:00:00.000Z"
}
```

**Error responses** use a consistent `{ error, message }` shape with the appropriate HTTP status: `400` validation errors, `413` payload too large, `429` rate limited, `502` upstream (Claude API) failure.

## Design decisions worth knowing for an interview

- **Why force JSON out of the model instead of parsing free text?** Free-text reviews look nice but can't drive a UI, a CI exit code, or a score. The system prompt states the schema once in prose and once as a literal example — repetition improves adherence more than either alone.
- **Why a shared `core` package instead of the CLI calling the backend's HTTP API?** The CLI needs to work with no server running (e.g., in a CI job with only a Claude API key as a secret). Sharing the engine as a library, not over HTTP, keeps the CLI a single dependency-only process.
- **Why cap input size instead of chunking automatically?** Silently chunking a file risks a finding citing a line number from the wrong chunk. The tool fails loudly and asks the caller to split the file instead.
- **Why is the rate limiter only on `/api/review` and not global?** `/api/health` is free; `/api/review` is the only route that costs real money per call, so it's the one worth protecting specifically.

## Roadmap

- [ ] Diff-aware review (only review changed lines in a PR diff)
- [ ] GitHub Action that posts findings as PR review comments
- [ ] Persist review history per file to track score trend over time
- [ ] Support local/open-weight models as a fallback provider

## License

MIT — see [LICENSE](./LICENSE).
