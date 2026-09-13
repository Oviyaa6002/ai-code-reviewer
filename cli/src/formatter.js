import chalk from "chalk";
import { SEVERITY } from "@ai-code-reviewer/core";

const SEVERITY_STYLE = {
  [SEVERITY.CRITICAL]: chalk.bgRed.white.bold(" CRITICAL "),
  [SEVERITY.HIGH]: chalk.red.bold(" HIGH "),
  [SEVERITY.MEDIUM]: chalk.yellow.bold(" MEDIUM "),
  [SEVERITY.LOW]: chalk.cyan(" LOW "),
  [SEVERITY.INFO]: chalk.gray(" INFO "),
};

function scoreColor(score) {
  if (score >= 90) return chalk.green.bold(score);
  if (score >= 70) return chalk.yellow.bold(score);
  return chalk.red.bold(score);
}

export function printReview(result) {
  const { fileName, score, summary, counts, findings, strengths } = result;

  console.log("");
  console.log(chalk.bold.underline(fileName || "Code review"));
  console.log(`${chalk.dim("Score:")} ${scoreColor(score)}/100`);
  console.log(`${chalk.dim("Summary:")} ${summary}`);

  const countLine = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([sev, n]) => `${sev}: ${n}`)
    .join("  ");
  if (countLine) console.log(chalk.dim(countLine));

  if (findings.length === 0) {
    console.log(chalk.green("\n✓ No issues found."));
  } else {
    console.log("");
    findings.forEach((f, i) => {
      const badge = SEVERITY_STYLE[f.severity] || f.severity;
      const location = f.line ? chalk.dim(`line ${f.line}`) : "";
      console.log(`${i + 1}. ${badge} ${chalk.bold(f.title)} ${location}`);
      console.log(`   ${f.description}`);
      if (f.codeExcerpt) {
        console.log(chalk.dim(`   > ${f.codeExcerpt}`));
      }
      console.log(`   ${chalk.green("Fix:")} ${f.suggestion}`);
      console.log("");
    });
  }

  if (strengths.length > 0) {
    console.log(chalk.dim("Strengths:"));
    strengths.forEach((s) => console.log(chalk.dim(`  + ${s}`)));
    console.log("");
  }
}

export function printSummaryLine(fileName, result) {
  const { score, counts } = result;
  const critical = counts.critical || 0;
  const high = counts.high || 0;
  const flag = critical > 0 ? chalk.red("✗") : high > 0 ? chalk.yellow("!") : chalk.green("✓");
  console.log(`${flag} ${fileName}  ${scoreColor(score)}/100`);
}
