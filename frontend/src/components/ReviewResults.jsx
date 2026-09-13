import ScoreGauge from "./ScoreGauge.jsx";
import IssueCard from "./IssueCard.jsx";

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <p className="font-serif text-xl text-ink/70">Nothing reviewed yet</p>
      <p className="mt-2 max-w-sm text-sm text-slate">
        Paste code into the editor on the left and click "Review code" — findings
        will appear here, ordered by severity.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <p className="font-serif text-xl text-brick">Review failed</p>
      <p className="mt-2 max-w-sm text-sm text-slate">{message}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10 text-center">
      <p className="font-serif text-xl text-ink/70 animate-pulse">Reading through the code…</p>
    </div>
  );
}

export default function ReviewResults({ result, loading, error }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState />;

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <p className="font-serif text-xl italic text-ink/90">{result.summary}</p>

      <div className="mt-5">
        <ScoreGauge
          score={result.score}
          counts={result.counts}
          overallAssessment={result.overallAssessment}
        />
      </div>

      {result.findings.length === 0 ? (
        <p className="mt-6 text-sm text-teal">No issues found — this looks solid.</p>
      ) : (
        <div className="mt-2">
          {result.findings.map((f, i) => (
            <IssueCard key={i} finding={f} index={i} />
          ))}
        </div>
      )}

      {result.strengths.length > 0 && (
        <div className="mt-6 border-t border-ink/10 pt-4">
          <p className="text-[11px] font-mono uppercase tracking-tight text-slate">Strengths</p>
          <ul className="mt-2 space-y-1">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-sm text-ink/70">
                + {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
