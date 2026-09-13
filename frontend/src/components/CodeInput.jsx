import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "sql",
  "html",
  "css",
  "other",
];

function extensionsFor(language) {
  if (language === "python") return [python()];
  // CodeMirror's JS mode is a reasonable default for most C-like languages
  // when a dedicated language package isn't loaded — it still gets
  // brackets, strings, and comments right for readability.
  return [javascript({ jsx: true, typescript: language === "typescript" })];
}

export default function CodeInput({
  code,
  setCode,
  language,
  setLanguage,
  fileName,
  setFileName,
  focus,
  setFocus,
  onSubmit,
  loading,
}) {
  return (
    <div className="flex h-full flex-col bg-ink">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-none border border-white/15 bg-ink-soft px-2 py-1 text-xs text-white/80 font-mono focus:border-teal"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="filename (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="flex-1 min-w-0 rounded-none border border-white/15 bg-ink-soft px-2 py-1 text-xs text-white/80 font-mono placeholder:text-white/30 focus:border-teal"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          onChange={setCode}
          theme={oneDark}
          extensions={extensionsFor(language)}
          height="100%"
          placeholder="Paste the code you want reviewed..."
          basicSetup={{ lineNumbers: true, foldGutter: false }}
        />
      </div>

      <div className="border-t border-white/10 px-5 py-3 flex items-center gap-3">
        <input
          type="text"
          placeholder='Optional focus, e.g. "security only"'
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="flex-1 min-w-0 rounded-none border border-white/15 bg-ink-soft px-2 py-1.5 text-xs text-white/80 placeholder:text-white/30 focus:border-teal"
        />
        <button
          onClick={onSubmit}
          disabled={loading || !code.trim()}
          className="shrink-0 bg-teal px-4 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {loading ? "Reviewing…" : "Review code"}
        </button>
      </div>
    </div>
  );
}
