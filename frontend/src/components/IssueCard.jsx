const SEVERITY_TICK = {
  critical: "border-brick text-brick",
  high: "border-brick/70 text-brick/80",
  medium: "border-ochre text-ochre",
  low: "border-slate text-slate",
  info: "border-slate/50 text-slate/70",
};

export default function IssueCard({ finding, index }) {
  const tickStyle = SEVERITY_TICK[finding.severity] || SEVERITY_TICK.info;

  return (
    <div className="flex gap-4 border-t border-ink/10 py-4 first:border-t-0">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] font-mono uppercase ${tickStyle}`}
        aria-hidden="true"
      >
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className={`text-[11px] font-mono uppercase tracking-tight ${tickStyle.split(" ")[1]}`}>
            {finding.severity}
          </span>
          <span className="text-[11px] text-slate">· {finding.category.replace("_", " ")}</span>
          {finding.line && <span className="text-[11px] font-mono text-slate">· line {finding.line}</span>}
        </div>

        <h3 className="mt-0.5 text-[15px] font-medium text-ink">{finding.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink/80">{finding.description}</p>

        {finding.codeExcerpt && (
          <pre className="mt-2 overflow-x-auto bg-ink-soft px-3 py-2 font-mono text-xs text-white/90">
            {finding.codeExcerpt}
          </pre>
        )}

        <p className="mt-2 text-sm leading-relaxed">
          <span className="font-medium text-teal">Fix — </span>
          <span className="text-ink/80">{finding.suggestion}</span>
        </p>
      </div>
    </div>
  );
}
