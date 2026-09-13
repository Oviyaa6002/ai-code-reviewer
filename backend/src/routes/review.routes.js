import { Router } from "express";
import { reviewCode } from "@ai-code-reviewer/core";
import { validateReviewRequest } from "../middleware/validateRequest.js";

export const reviewRouter = Router();

reviewRouter.post("/", validateReviewRequest, async (req, res, next) => {
  const { code, language, fileName, focus } = req.body;

  try {
    const result = await reviewCode({
      code,
      language: language || "other",
      fileName,
      focus,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
