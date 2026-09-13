import "dotenv/config";

const PROVIDER = (process.env.LLM_PROVIDER || "groq").toLowerCase();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    // Fail loudly at boot rather than on the first request — a missing
    // API key should never surface as a mysterious 500 to a user.
    console.error(
      `[config] Missing required environment variable: ${name}. Copy backend/.env.example to backend/.env and fill it in.`
    );
    process.exit(1);
  }
  return value;
}

// The free path (Groq) is the default. Anthropic is only required if
// the project is explicitly switched over via LLM_PROVIDER=anthropic.
const requiredKeyName = PROVIDER === "anthropic" ? "ANTHROPIC_API_KEY" : "GROQ_API_KEY";

export const config = {
  port: Number(process.env.PORT) || 4000,
  provider: PROVIDER,
  apiKeyPresent: requireEnv(requiredKeyName),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
};
