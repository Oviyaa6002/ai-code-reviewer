import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./config/index.js";
import { reviewRouter } from "./routes/review.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

// Reviews are the expensive path (they call an LLM) — rate limit that
// route specifically rather than the whole API.
const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "rate_limited",
    message: "Too many review requests. Wait a minute and try again.",
  },
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", provider: config.provider });
});

app.use("/api/review", reviewLimiter, reviewRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`AI Code Reviewer API listening on http://localhost:${config.port}`);
});
