import { useState } from "react";
import Header from "./components/Header.jsx";
import CodeInput from "./components/CodeInput.jsx";
import ReviewResults from "./components/ReviewResults.jsx";
import { requestReview } from "./api/reviewApi.js";

const SAMPLE_CODE = `function getUser(id) {
  const users = db.query("SELECT * FROM users WHERE id = " + id);
  return users[0];
}`;

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const data = await requestReview({ code, language, fileName, focus });
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-paper">
      <Header />
      <main className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[45%_55%]">
        <section className="h-full overflow-hidden">
          <CodeInput
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            fileName={fileName}
            setFileName={setFileName}
            focus={focus}
            setFocus={setFocus}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </section>
        <section className="h-full overflow-hidden border-t border-ink/10 md:border-l md:border-t-0">
          <ReviewResults result={result} loading={loading} error={error} />
        </section>
      </main>
    </div>
  );
}
