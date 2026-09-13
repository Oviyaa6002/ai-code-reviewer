export default function Header() {
  return (
    <header className="flex items-baseline justify-between border-b border-ink/10 px-8 py-5">
      <div>
        <h1 className="font-serif text-2xl text-ink">AI Code Reviewer</h1>
        <p className="text-sm text-slate mt-0.5">
          Paste code, get a reviewer's margin notes — bugs, security gaps, and fixes.
        </p>
      </div>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noreferrer"
        className="text-sm text-slate hover:text-ink transition-colors"
      >
        View source
      </a>
    </header>
  );
}
