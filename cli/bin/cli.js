#!/usr/bin/env node
import "dotenv/config";
import fs from "node:fs/promises";
import { Command } from "commander";
import { glob } from "glob";
import chalk from "chalk";
import { reviewCode, detectLanguageFromFileName, SEVERITY_ORDER } from "@ai-code-reviewer/core";
import { printReview, printSummaryLine } from "../src/formatter.js";

const program = new Command();

program
  .name("code-reviewer")
  .description("AI-powered code review from the command line, backed by the Claude API.")
  .argument("<files...>", "file(s) or glob pattern(s) to review, e.g. src/**/*.js")
  .option("-j, --json", "print raw JSON instead of formatted output")
  .option("-f, --focus <text>", "ask the reviewer to focus on a specific concern, e.g. \"security\"")
  .option(
    "--fail-on <severity>",
    "exit with a non-zero code if any finding at or above this severity is found (critical|high|medium|low)",
    "critical"
  )
  .action(async (patterns, options) => {
    const files = (
      await Promise.all(patterns.map((p) => glob(p, { nodir: true })))
    ).flat();

    if (files.length === 0) {
      console.error(chalk.red(`No files matched: ${patterns.join(", ")}`));
      process.exitCode = 1;
      return;
    }

    const failThresholdIndex = SEVERITY_ORDER.indexOf(options.failOn);
    let worstSeenIndex = SEVERITY_ORDER.length; // start "better than info"
    const jsonResults = [];

    for (const file of files) {
      let code;
      try {
        code = await fs.readFile(file, "utf-8");
      } catch (err) {
        console.error(chalk.red(`Could not read ${file}: ${err.message}`));
        process.exitCode = 1;
        continue;
      }

      try {
        const result = await reviewCode({
          code,
          language: detectLanguageFromFileName(file),
          fileName: file,
          focus: options.focus,
        });

        if (options.json) {
          jsonResults.push(result);
        } else if (files.length > 1) {
          printSummaryLine(file, result);
        } else {
          printReview(result);
        }

        for (const finding of result.findings) {
          const idx = SEVERITY_ORDER.indexOf(finding.severity);
          if (idx !== -1 && idx < worstSeenIndex) worstSeenIndex = idx;
        }
      } catch (err) {
        console.error(chalk.red(`Review failed for ${file}: ${err.message}`));
        process.exitCode = 1;
      }
    }

    if (options.json) {
      console.log(JSON.stringify(jsonResults.length === 1 ? jsonResults[0] : jsonResults, null, 2));
    }

    // Non-zero exit when the worst finding meets/exceeds the fail-on
    // threshold. This is what makes `code-reviewer` usable as a CI gate.
    if (failThresholdIndex !== -1 && worstSeenIndex <= failThresholdIndex) {
      process.exitCode = 1;
    }
  });

program.parseAsync();
