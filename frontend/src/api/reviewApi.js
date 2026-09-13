const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function requestReview({ code, language, fileName, focus }) {
  const res = await fetch(`${API_BASE}/api/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, fileName, focus }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "The review request failed.");
  }

  return data;
}
