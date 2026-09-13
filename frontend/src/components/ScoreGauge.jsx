const SEVERITY_COLOR = {
  critical: "bg-brick",
  high: "bg-brick/70",
  medium: "bg-ochre",
  low: "bg-slate/60",
  info: "bg-slate/30",
};

const ASSESSMENT_LABEL = {
  clean: "Clean",
  minor_issues: "Minor issues",
  needs_work: "Needs work",
  serious_concerns: "Serious concerns",
  unknown: "Reviewed",
};

function scoreTone(score) {
  if (score >= 90) return "text-teal";
  if (score >= 70) return "text-ochre";
  return "text-brick";
}

export default function ScoreGauge({ score, counts, overallAssessment }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="border-b border-ink/10 pb-5">
      <div className="flex items-end gap-3">
        <span className={`font-serif text-5xl leading-none ${scoreTone(score)}`}>
          {score}
        </span>
        <span className="text-sm text-slate mb-1">/ 100 — {ASSESSMENT_LABEL[overallAssessment] || "Reviewed"}</span>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex h-1.5 w-full overflow-hidden bg-ink/5">
            {Object.entries(counts)
              .filter(([, n]) => n > 0)
              .map(([sev, n]) => (
                <div
                  key={sev}
                  className={SEVERITY_COLOR[sev]}
                  style={{ width: `${(n / total) * 100}%` }}
                  title={`${sev}: ${n}`}
                />
              ))}
          </div>
          <div className="mt-1.5 flex gap-4 font-mono text-[11px] text-slate">
            {Object.entries(counts)
              .filter(([, n]) => n > 0)
              .map(([sev, n]) => (
                <span key={sev}>
                  {sev} {n}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
